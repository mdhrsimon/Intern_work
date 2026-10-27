using System.ComponentModel.DataAnnotations;

namespace ReactFormApi.Models;

public class Education
{
    public int Id { get; set; }

    [MaxLength(100)]
    public string Degree { get; set; } = "";

    [MaxLength(150)]
    public string Institute { get; set; } = "";

    [MaxLength(4)]
    public string YearPassed { get; set; } = "";

    public int UserId { get; set; }
}
