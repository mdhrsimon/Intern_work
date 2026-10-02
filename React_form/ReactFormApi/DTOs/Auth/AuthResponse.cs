namespace ReactFormApi.DTOs.Auth;

public class AuthResponse
{
    public string Email { get; set; } = string.Empty;
    public string? FullName { get; set; }
    public string Role { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
}
