namespace ReactFormApi.DTOs.Users;

public class EducationDto
{
    public string Degree { get; set; } = string.Empty;
    public string Institute { get; set; } = string.Empty;
    public string YearPassed { get; set; } = string.Empty;
}

public class CreateUserRequest
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string DateOfBirth { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Gender { get; set; } = string.Empty;
    public List<EducationDto> Education { get; set; } = new();
}

public class UpdateUserRequest
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string DateOfBirth { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Gender { get; set; } = string.Empty;
    public List<EducationDto> Education { get; set; } = new();
}

public class UserServiceResult<T>
{
    public bool Success { get; set; }
    public int StatusCode { get; set; }
    public string? Message { get; set; }
    public T? Data { get; set; }

    public static UserServiceResult<T> Ok(T data) =>
        new() { Success = true, StatusCode = 200, Data = data };

    public static UserServiceResult<T> Fail(int statusCode, string message) =>
        new() { Success = false, StatusCode = statusCode, Message = message };
}
