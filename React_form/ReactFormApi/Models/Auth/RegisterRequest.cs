namespace ReactFormApi.Models.Auth;

public class RegisterRequest
{
    public string Email { get; set; } = "";
    public string Password { get; set; } = "";
    public string? FullName { get; set; }
    public string? Role { get; set; }
}