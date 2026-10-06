using ReactFormApi.DTOs.Notifications;
using ReactFormApi.Models;

namespace ReactFormApi.Services;

public interface INotificationService
{
    Task<NotificationDto?> CreateAndSendNotificationAsync(
        string recipientId,
        NotificationType type,
        string title,
        string message,
        int? classId = null,
        int? assignmentId = null,
        string? actorUserId = null);

    Task<List<NotificationDto>> CreateAndSendNotificationsAsync(
        IEnumerable<string> recipientIds,
        NotificationType type,
        string title,
        string message,
        int? classId = null,
        int? assignmentId = null,
        string? actorUserId = null);

    Task<List<NotificationDto>> NotifyClassEnrolledUsersAsync(
        int classId,
        string? roleInClass,
        NotificationType type,
        string title,
        string message,
        int? assignmentId = null,
        string? actorUserId = null);

    Task<List<NotificationDto>> NotifyAllAdminsAsync(
        NotificationType type,
        string title,
        string message,
        int? classId = null,
        int? assignmentId = null,
        string? actorUserId = null);

    Task<PagedNotificationsResult> GetNotificationsAsync(
        string userId,
        int page = 1,
        int pageSize = 20,
        bool? unreadOnly = null);

    Task<int> GetUnreadCountAsync(string userId);

    Task<NotificationOperationResult> MarkAsReadAsync(int id, string userId);

    Task<int> MarkAllAsReadAsync(string userId);
}
