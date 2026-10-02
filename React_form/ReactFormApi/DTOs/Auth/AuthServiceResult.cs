namespace ReactFormApi.DTOs.Auth;

public class AuthServiceResult
{
    public bool Success { get; set; }
    public int StatusCode { get; set; }
    public string? Message { get; set; }
    public IEnumerable<string>? Errors { get; set; }
    public AuthResponse? Response { get; set; }

    public static AuthServiceResult Ok(AuthResponse response) => new()
    {
        Success = true,
        StatusCode = 200,
        Response = response
    };

    public static AuthServiceResult Fail(int statusCode, string message, IEnumerable<string>? errors = null) => new()
    {
        Success = false,
        StatusCode = statusCode,
        Message = message,
        Errors = errors
    };
}
