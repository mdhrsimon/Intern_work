using System.ComponentModel.DataAnnotations;

namespace ReactFormApi.Models;

public class Assignment
{
    public int Id { get; set; }

    [Required]
    public int ClassChannelId { get; set; }
    public ClassChannel ClassChannel { get; set; } = null!;

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string? Description { get; set; }

    public DateTime? DueDate { get; set; }

    [Required]
    public string CreatedByUserId { get; set; } = string.Empty;  // Teacher who created it
    public ApplicationUser CreatedBy { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<AssignmentSubmission> Submissions { get; set; } = new List<AssignmentSubmission>();
    public ICollection<AssignmentAttachment> Attachments { get; set; } = new List<AssignmentAttachment>();
}

public class AssignmentSubmission
{
    public int Id { get; set; }

    [Required]
    public int AssignmentId { get; set; }
    public Assignment Assignment { get; set; } = null!;

    [Required]
    public string StudentUserId { get; set; } = string.Empty;  // Student who submitted
    public ApplicationUser Student { get; set; } = null!;

    [MaxLength(5000)]
    public string? SubmittedText { get; set; }

    // Status: "Assigned" | "Turned In" | "Returned"
    [MaxLength(20)]
    public string Status { get; set; } = "Assigned";

    [MaxLength(10)]
    public string? Grade { get; set; }

    [MaxLength(2000)]
    public string? Feedback { get; set; }

    public DateTime? SubmittedAt { get; set; }
    public DateTime? ReturnedAt { get; set; }

    public ICollection<SubmissionFile> Files { get; set; } = new List<SubmissionFile>();
}
