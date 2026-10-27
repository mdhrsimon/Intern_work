using System.ComponentModel.DataAnnotations;

namespace ReactFormApi.Models;

public class User
{
    public int Id { get; set; }

    [MaxLength(150)]
    public string FullName { get; set; } = "";

    [MaxLength(256)]
    public string Email { get; set; } = "";

    [MaxLength(20)]
    public string Phone { get; set; } = "";

    [MaxLength(10)]
    public string DateOfBirth { get; set; } = "";

    [MaxLength(300)]
    public string Address { get; set; } = "";

    [MaxLength(20)]
    public string Gender { get; set; } = "";

    public List<Education> Education { get; set; } = new();

    /// <summary>Identity user id of the account that submitted this form.</summary>
    public string? ApplicationUserId { get; set; }
    public ApplicationUser? ApplicationUser { get; set; }
}