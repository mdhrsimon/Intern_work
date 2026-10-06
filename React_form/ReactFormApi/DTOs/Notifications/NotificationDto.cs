namespace ReactFormApi.DTOs.Notifications;

public class NotificationDto
{
    public int Id { get; set; }
    public string RecipientId { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public int? ClassId { get; set; }
    public int? AssignmentId { get; set; }
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ReadAt { get; set; }
}

public class PagedNotificationsResult
{
    public List<NotificationDto> Items { get; set; } = new();
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
    public int TotalPages { get; set; }
    public int UnreadCount { get; set; }
    public bool HasMore { get; set; }
}

public class UnreadCountDto
{
    public int UnreadCount { get; set; }
}

public class NotificationOperationResult
{
    public bool Success { get; set; }
    public int StatusCode { get; set; }
    public string? Message { get; set; }
    public NotificationDto? Data { get; set; }

    public static NotificationOperationResult Ok(NotificationDto data, string? message = null) =>
        new() { Success = true, StatusCode = 200, Data = data, Message = message };

    public static NotificationOperationResult Fail(int statusCode, string message) =>
        new() { Success = false, StatusCode = statusCode, Message = message };
}
