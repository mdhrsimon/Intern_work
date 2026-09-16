using System.ComponentModel.DataAnnotations;

namespace ReactFormApi.Models;

public class ClassEnrollment
{
    public int Id { get; set; }

    [Required]
    public int ClassChannelId { get; set; }
    public ClassChannel ClassChannel { get; set; } = null!;

    [Required]
    public string ApplicationUserId { get; set; } = string.Empty;
    public ApplicationUser ApplicationUser { get; set; } = null!;

    [Required]
    [MaxLength(50)]
    public string RoleInClass { get; set; } = "Student"; // "Staff" (Teacher) or "Student"

    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
}
