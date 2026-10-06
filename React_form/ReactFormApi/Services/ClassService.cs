using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using ReactFormApi.Constants;
using ReactFormApi.Data;
using ReactFormApi.DTOs.Classes;
using ReactFormApi.Models;

namespace ReactFormApi.Services;

public class ClassService
{
    private readonly AppDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly INotificationService _notificationService;

    public ClassService(
        AppDbContext context,
        UserManager<ApplicationUser> userManager,
        INotificationService notificationService)
    {
        _context = context;
        _userManager = userManager;
        _notificationService = notificationService;
    }

    public async Task<PagedClassesResult> GetClassesAsync(
        int page = 1,
        int pageSize = 20,
        string? search = null)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 20;
        if (pageSize > 100) pageSize = 100;

        var query = _context.ClassChannels.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(c => c.Name.ToLower().Contains(s) || (c.Code != null && c.Code.ToLower().Contains(s)));
        }

        var totalCount = await query.CountAsync();
        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

        var classes = await query
            .OrderBy(c => c.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new ClassChannelDto
            {
                Id = c.Id,
                Name = c.Name,
                Code = c.Code,
                Description = c.Description,
                CreatedAt = c.CreatedAt,
                StaffCount = c.Enrollments.Count(e => e.RoleInClass == RoleConstants.Staff || e.RoleInClass == RoleConstants.Teacher),
                StudentCount = c.Enrollments.Count(e => e.RoleInClass == RoleConstants.Student)
            })
            .ToListAsync();

        return new PagedClassesResult
        {
            Items = classes,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = totalPages,
            HasMore = page < totalPages
        };
    }

    public async Task<List<ClassChannelDto>> GetMyClassesAsync(string currentUserId)
    {
        var enrollments = await _context.ClassEnrollments
            .Include(e => e.ClassChannel)
                .ThenInclude(c => c.Enrollments)
            .Where(e => e.ApplicationUserId == currentUserId)
            .ToListAsync();

        return enrollments.Select(e => new ClassChannelDto
        {
            Id = e.ClassChannel.Id,
            Name = e.ClassChannel.Name,
            Code = e.ClassChannel.Code,
            Description = e.ClassChannel.Description,
            CreatedAt = e.ClassChannel.CreatedAt,
            StaffCount = e.ClassChannel.Enrollments.Count(en => en.RoleInClass == RoleConstants.Staff || en.RoleInClass == RoleConstants.Teacher),
            StudentCount = e.ClassChannel.Enrollments.Count(en => en.RoleInClass == RoleConstants.Student)
        }).ToList();
    }

    public async Task<ClassServiceResult> GetClassByIdAsync(int id, string? currentUserId, string currentUserRole)
    {
        var cls = await _context.ClassChannels
            .Include(c => c.Enrollments)
                .ThenInclude(e => e.ApplicationUser)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (cls == null)
            return ClassServiceResult.Fail(404, $"Class with ID {id} was not found.");

        if (currentUserRole != RoleConstants.Admin)
        {
            var enrollment = cls.Enrollments.FirstOrDefault(e => e.ApplicationUserId == currentUserId);
            if (enrollment == null)
            {
                return ClassServiceResult.Fail(403, "Policy Enforcement: Access Denied. You are not assigned/enrolled in this class channel.",
                    new
                    {
                        message = "Policy Enforcement: Access Denied. You are not assigned/enrolled in this class channel.",
                        classId = id,
                        className = cls.Name,
                        userRole = currentUserRole
                    });
            }

            if ((currentUserRole == RoleConstants.Staff || currentUserRole == RoleConstants.Teacher) &&
                enrollment.RoleInClass != RoleConstants.Staff && enrollment.RoleInClass != RoleConstants.Teacher)
            {
                return ClassServiceResult.Fail(403, "Policy Enforcement: Access Denied. You are not assigned as a Teacher/Staff in this class.",
                    new
                    {
                        message = "Policy Enforcement: Access Denied. You are not assigned as a Teacher/Staff in this class.",
                        classId = id,
                        className = cls.Name
                    });
            }
        }

        var staffMembers = cls.Enrollments
            .Where(e => e.RoleInClass == RoleConstants.Staff || e.RoleInClass == RoleConstants.Teacher)
            .Select(e => new ClassMemberDto
            {
                AccountId = e.ApplicationUserId,
                FullName = e.ApplicationUser?.FullName ?? e.ApplicationUser?.UserName ?? "Staff Member",
                Email = e.ApplicationUser?.Email ?? string.Empty,
                Role = RoleConstants.Staff,
                RoleInClass = RoleConstants.Staff,
                AssignedAt = e.JoinedAt
            })
            .ToList();

        var studentMembers = cls.Enrollments
            .Where(e => e.RoleInClass == RoleConstants.Student)
            .Select(e => new ClassMemberDto
            {
                AccountId = e.ApplicationUserId,
                FullName = e.ApplicationUser?.FullName ?? e.ApplicationUser?.UserName ?? "Student",
                Email = e.ApplicationUser?.Email ?? string.Empty,
                Role = RoleConstants.Student,
                RoleInClass = RoleConstants.Student,
                AssignedAt = e.JoinedAt
            })
            .ToList();

        return ClassServiceResult.Ok(new ClassWithMembersDto
        {
            Id = cls.Id,
            Name = cls.Name,
            Code = cls.Code,
            Description = cls.Description,
            CreatedAt = cls.CreatedAt,
            Staff = staffMembers,
            Students = studentMembers
        });
    }

    public async Task<ClassChannelDto> CreateClassAsync(CreateClassRequest request)
    {
        var classChannel = new ClassChannel
        {
            Name = request.Name.Trim(),
            Code = request.Code?.Trim(),
            Description = request.Description?.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        _context.ClassChannels.Add(classChannel);
        await _context.SaveChangesAsync();

        await _notificationService.NotifyAllAdminsAsync(
            NotificationType.ClassCreated,
            "Class Created",
            $"Class '{classChannel.Name}' has been created.",
            classChannel.Id);

        return new ClassChannelDto
        {
            Id = classChannel.Id,
            Name = classChannel.Name,
            Code = classChannel.Code,
            Description = classChannel.Description,
            CreatedAt = classChannel.CreatedAt,
            StaffCount = 0,
            StudentCount = 0
        };
    }

    public async Task<ClassChannelDto?> UpdateClassAsync(int id, UpdateClassRequest request)
    {
        var cls = await _context.ClassChannels.FindAsync(id);
        if (cls == null) return null;

        if (!string.IsNullOrWhiteSpace(request.Name))
            cls.Name = request.Name.Trim();

        cls.Code = request.Code?.Trim();
        cls.Description = request.Description?.Trim();

        await _context.SaveChangesAsync();

        var staffCount = await _context.ClassEnrollments.CountAsync(e => e.ClassChannelId == id && (e.RoleInClass == RoleConstants.Staff || e.RoleInClass == RoleConstants.Teacher));
        var studentCount = await _context.ClassEnrollments.CountAsync(e => e.ClassChannelId == id && e.RoleInClass == RoleConstants.Student);

        return new ClassChannelDto
        {
            Id = cls.Id,
            Name = cls.Name,
            Code = cls.Code,
            Description = cls.Description,
            CreatedAt = cls.CreatedAt,
            StaffCount = staffCount,
            StudentCount = studentCount
        };
    }

    public async Task<bool> DeleteClassAsync(int id)
    {
        var cls = await _context.ClassChannels.FindAsync(id);
        if (cls == null) return false;

        var className = cls.Name;

        _context.ClassChannels.Remove(cls);
        await _context.SaveChangesAsync();

        await _notificationService.NotifyAllAdminsAsync(
            NotificationType.ClassDeleted,
            "Class Deleted",
            $"Class '{className}' has been deleted.",
            id);

        return true;
    }

    public async Task<AssignMemberResult> AssignMemberAsync(int id, AssignMemberRequest request)
    {
        var cls = await _context.ClassChannels.FindAsync(id);
        if (cls == null)
            return AssignMemberResult.Fail(404, $"Class with ID {id} was not found.");

        var user = await _userManager.FindByIdAsync(request.AccountId);
        if (user == null)
            return AssignMemberResult.Fail(404, "User was not found.");

        var existing = await _context.ClassEnrollments
            .FirstOrDefaultAsync(e => e.ClassChannelId == id && e.ApplicationUserId == request.AccountId);

        var roleInClass = (request.RoleInClass.Equals(RoleConstants.Staff, StringComparison.OrdinalIgnoreCase) ||
                           request.RoleInClass.Equals(RoleConstants.Teacher, StringComparison.OrdinalIgnoreCase))
                          ? RoleConstants.Staff : RoleConstants.Student;

        if (existing != null)
        {
            existing.RoleInClass = roleInClass;
            await _context.SaveChangesAsync();
            return AssignMemberResult.Ok("User assignment role updated.");
        }

        var enrollment = new ClassEnrollment
        {
            ClassChannelId = id,
            ApplicationUserId = user.Id,
            RoleInClass = roleInClass,
            JoinedAt = DateTime.UtcNow
        };

        _context.ClassEnrollments.Add(enrollment);
        await _context.SaveChangesAsync();

        var roleDisplay = roleInClass == RoleConstants.Staff ? "Teacher" : "Student";
        await _notificationService.CreateAndSendNotificationAsync(
            user.Id,
            NotificationType.ClassEnrollmentAdded,
            $"Enrolled in {cls.Name}",
            $"You have been assigned to class '{cls.Name}' as a {roleDisplay}.",
            cls.Id);

        await _notificationService.NotifyAllAdminsAsync(
            NotificationType.ClassEnrollmentAdded,
            "Class Enrollment Updated",
            $"{user.FullName ?? user.Email} was assigned as {roleDisplay} in '{cls.Name}'.",
            cls.Id);

        return AssignMemberResult.Ok($"User {user.FullName ?? user.Email} successfully assigned to {cls.Name}.");
    }

    public async Task<bool> RemoveMemberAsync(int id, string accountId)
    {
        var enrollment = await _context.ClassEnrollments
            .Include(e => e.ClassChannel)
            .Include(e => e.ApplicationUser)
            .FirstOrDefaultAsync(e => e.ClassChannelId == id && e.ApplicationUserId == accountId);

        if (enrollment == null)
            return false;

        var className = enrollment.ClassChannel?.Name ?? "a class";
        var userName = enrollment.ApplicationUser?.FullName ?? enrollment.ApplicationUser?.Email ?? "A member";

        _context.ClassEnrollments.Remove(enrollment);
        await _context.SaveChangesAsync();

        await _notificationService.CreateAndSendNotificationAsync(
            accountId,
            NotificationType.ClassEnrollmentRemoved,
            $"Removed from {className}",
            $"You have been removed from the class '{className}'.",
            id);

        await _notificationService.NotifyAllAdminsAsync(
            NotificationType.ClassEnrollmentRemoved,
            "Class Member Removed",
            $"{userName} was removed from the class '{className}'.",
            id);

        return true;
    }
}
