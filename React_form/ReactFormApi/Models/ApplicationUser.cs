using Microsoft.AspNetCore.Identity;

namespace ReactFormApi.Models;

public class ApplicationUser : IdentityUser
{
    public string? FullName { get; set; }

    // Refresh token fields
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiryTime { get; set; }
    public DateTime? RefreshTokenCreated { get; set; }

    // ===== New fields for User Management =====
    public bool IsActive { get; set; } = true;
    public DateTime? LastSeen { get; set; }
}