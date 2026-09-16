using System.ComponentModel.DataAnnotations;

namespace ReactFormApi.Models;

public class AssignmentAttachment
{
    public int Id { get; set; }

    [Required]
    public int AssignmentId { get; set; }
    public Assignment Assignment { get; set; } = null!;

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

    [Required]
    public string UploadedByUserId { get; set; } = string.Empty;
    public ApplicationUser UploadedBy { get; set; } = null!;
}
