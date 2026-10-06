using System.ComponentModel.DataAnnotations;

namespace ReactFormApi.Models;

public enum NotificationType
{
    AssignmentPosted,
    AssignmentUpdated,
    AssignmentReturned,
    DueDateReminder,
    AssignmentSubmitted,
    AssignmentResubmitted,
    ClassEnrollmentAdded,
    ClassEnrollmentRemoved,
    UserRegistered,
    UserStatusChanged,
    ClassCreated,
    ClassDeleted
}

public class Notification
{
    public int Id { get; set; }

    [Required]
    public string RecipientId { get; set; } = string.Empty;
    public ApplicationUser Recipient { get; set; } = null!;

    [Required]
    public NotificationType Type { get; set; }

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MaxLength(1000)]
    public string Message { get; set; } = string.Empty;

    public int? ClassId { get; set; }

    public int? AssignmentId { get; set; }

    public bool IsRead { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? ReadAt { get; set; }
}
