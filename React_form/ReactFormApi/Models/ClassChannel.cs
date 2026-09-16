using System.ComponentModel.DataAnnotations;

namespace ReactFormApi.Models;

public class ClassChannel
{
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(50)]
    public string? Code { get; set; }

    [MaxLength(500)]
    public string? Description { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property for enrollments / assignments
    public ICollection<ClassEnrollment> Enrollments { get; set; } = new List<ClassEnrollment>();
}
