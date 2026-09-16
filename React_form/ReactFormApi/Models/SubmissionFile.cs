using System.ComponentModel.DataAnnotations;

namespace ReactFormApi.Models;

public class SubmissionFile
{
    public int Id { get; set; }

    [Required]
    public int AssignmentSubmissionId { get; set; }
    public AssignmentSubmission AssignmentSubmission { get; set; } = null!;

    [Required]
    [MaxLength(260)]
    public string FileName { get; set; } = string.Empty;

    [Required]
    [MaxLength(260)]
    public string StoredFileName { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string ContentType { get; set; } = string.Empty;

    public long FileSize { get; set; }

    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
}
