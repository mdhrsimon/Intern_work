using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using ReactFormApi.Constants;
using ReactFormApi.Data;
using ReactFormApi.DTOs.Notifications;
using ReactFormApi.Hubs;
using ReactFormApi.Models;

namespace ReactFormApi.Services;

public class NotificationService : INotificationService
{
    private readonly AppDbContext _context;
    private readonly IHubContext<NotificationHub> _hubContext;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ILogger<NotificationService> _logger;

    public NotificationService(
        AppDbContext context,
        IHubContext<NotificationHub> hubContext,
        UserManager<ApplicationUser> userManager,
        ILogger<NotificationService> logger)
    {
        _context = context;
        _hubContext = hubContext;
        _userManager = userManager;
        _logger = logger;
    }

    public async Task<NotificationDto?> CreateAndSendNotificationAsync(
        string recipientId,
        NotificationType type,
        string title,
        string message,
        int? classId = null,
        int? assignmentId = null,
        string? actorUserId = null)
    {
        var result = await CreateAndSendNotificationsAsync(
            new[] { recipientId },
            type,
            title,
            message,
            classId,
            assignmentId,
            actorUserId);

        return result.FirstOrDefault();
    }

    public async Task<List<NotificationDto>> CreateAndSendNotificationsAsync(
        IEnumerable<string> recipientIds,
        NotificationType type,
        string title,
        string message,
        int? classId = null,
        int? assignmentId = null,
        string? actorUserId = null)
    {
        // 1. Never notify the user who performed the action
        var validRecipientIds = recipientIds
            .Where(id => !string.IsNullOrWhiteSpace(id) && id != actorUserId)
            .Distinct()
            .ToList();

        if (validRecipientIds.Count == 0)
        {
            return new List<NotificationDto>();
        }

        var now = DateTime.UtcNow;
        var entities = validRecipientIds.Select(recipientId => new Notification
        {
            RecipientId = recipientId,
            Type = type,
            Title = title.Trim(),
            Message = message.Trim(),
            ClassId = classId,
            AssignmentId = assignmentId,
            IsRead = false,
            CreatedAt = now
        }).ToList();

        // 2. Save to database first
        await _context.Notifications.AddRangeAsync(entities);
        await _context.SaveChangesAsync();

        var dtos = entities.Select(MapToDto).ToList();

        // 3. Push to connected users through IHubContext<NotificationHub>
        foreach (var dto in dtos)
        {
            try
            {
                await _hubContext.Clients.User(dto.RecipientId).SendAsync("ReceiveNotification", dto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to push real-time notification {NotificationId} to user {RecipientId}", dto.Id, dto.RecipientId);
            }
        }

        return dtos;
    }

    public async Task<List<NotificationDto>> NotifyClassEnrolledUsersAsync(
        int classId,
        string? roleInClass,
        NotificationType type,
        string title,
        string message,
        int? assignmentId = null,
        string? actorUserId = null)
    {
        // Recipients must respect class enrollment: only notify students/teachers actually enrolled in that class
        var query = _context.ClassEnrollments
            .Where(e => e.ClassChannelId == classId);

        if (!string.IsNullOrWhiteSpace(roleInClass))
        {
            if (roleInClass.Equals(RoleConstants.Staff, StringComparison.OrdinalIgnoreCase) ||
                roleInClass.Equals(RoleConstants.Teacher, StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(e => e.RoleInClass == RoleConstants.Staff || e.RoleInClass == RoleConstants.Teacher);
            }
            else
            {
                query = query.Where(e => e.RoleInClass == roleInClass);
            }
        }

        var recipientIds = await query
            .Select(e => e.ApplicationUserId)
            .Distinct()
            .ToListAsync();

        return await CreateAndSendNotificationsAsync(
            recipientIds,
            type,
            title,
            message,
            classId,
            assignmentId,
            actorUserId);
    }

    public async Task<List<NotificationDto>> NotifyAllAdminsAsync(
        NotificationType type,
        string title,
        string message,
        int? classId = null,
        int? assignmentId = null,
        string? actorUserId = null)
    {
        var admins = await _userManager.GetUsersInRoleAsync(RoleConstants.Admin);
        var adminIds = admins.Select(u => u.Id).Distinct();

        return await CreateAndSendNotificationsAsync(
            adminIds,
            type,
            title,
            message,
            classId,
            assignmentId,
            actorUserId);
    }

    public async Task<PagedNotificationsResult> GetNotificationsAsync(
        string userId,
        int page = 1,
        int pageSize = 20,
        bool? unreadOnly = null)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 20;
        if (pageSize > 100) pageSize = 100;

        var query = _context.Notifications
            .AsNoTracking()
            .Where(n => n.RecipientId == userId);

        var totalUnread = await _context.Notifications
            .AsNoTracking()
            .CountAsync(n => n.RecipientId == userId && !n.IsRead);

        if (unreadOnly == true)
        {
            query = query.Where(n => !n.IsRead);
        }

        var totalCount = await query.CountAsync();
        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

        var notifications = await query
            .OrderByDescending(n => n.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedNotificationsResult
        {
            Items = notifications.Select(MapToDto).ToList(),
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = totalPages,
            UnreadCount = totalUnread,
            HasMore = page < totalPages
        };
    }

    public async Task<int> GetUnreadCountAsync(string userId)
    {
        return await _context.Notifications
            .AsNoTracking()
            .CountAsync(n => n.RecipientId == userId && !n.IsRead);
    }

    public async Task<NotificationOperationResult> MarkAsReadAsync(int id, string userId)
    {
        var notification = await _context.Notifications.FindAsync(id);
        if (notification == null)
        {
            return NotificationOperationResult.Fail(404, "Notification not found.");
        }

        // Return 403 if modifying someone else's notification
        if (notification.RecipientId != userId)
        {
            return NotificationOperationResult.Fail(403, "You are not authorized to modify this notification.");
        }

        if (!notification.IsRead)
        {
            notification.IsRead = true;
            notification.ReadAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }

        return NotificationOperationResult.Ok(MapToDto(notification), "Notification marked as read.");
    }

    public async Task<int> MarkAllAsReadAsync(string userId)
    {
        var unreadNotifications = await _context.Notifications
            .Where(n => n.RecipientId == userId && !n.IsRead)
            .ToListAsync();

        if (unreadNotifications.Count == 0)
        {
            return 0;
        }

        var now = DateTime.UtcNow;
        foreach (var notification in unreadNotifications)
        {
            notification.IsRead = true;
            notification.ReadAt = now;
        }

        await _context.SaveChangesAsync();
        return unreadNotifications.Count;
    }

    private static NotificationDto MapToDto(Notification n)
    {
        return new NotificationDto
        {
            Id = n.Id,
            RecipientId = n.RecipientId,
            Type = n.Type.ToString(),
            Title = n.Title,
            Message = n.Message,
            ClassId = n.ClassId,
            AssignmentId = n.AssignmentId,
            IsRead = n.IsRead,
            CreatedAt = n.CreatedAt,
            ReadAt = n.ReadAt
        };
    }
}
