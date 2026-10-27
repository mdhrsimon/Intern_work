using System.ComponentModel.DataAnnotations;

namespace ReactFormApi.DTOs.Users;

public class EducationDto
{
    [Required]
    [StringLength(100)]
    public string Degree { get; set; } = string.Empty;

    [Required]
    [StringLength(150)]
    public string Institute { get; set; } = string.Empty;

    [Required]
    [StringLength(4)]
    public string YearPassed { get; set; } = string.Empty;
}

public class EducationResponse
{
    public int Id { get; set; }
    public string Degree { get; set; } = string.Empty;
    public string Institute { get; set; } = string.Empty;
    public string YearPassed { get; set; } = string.Empty;
}

public class UserResponse
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string DateOfBirth { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Gender { get; set; } = string.Empty;
    public List<EducationResponse> Education { get; set; } = new();
}

public class CreateUserRequest
{
    [Required]
    [StringLength(20)]
    public string Phone { get; set; } = string.Empty;

    [Required]
    [StringLength(10)]
    public string DateOfBirth { get; set; } = string.Empty;

    [Required]
    [StringLength(300)]
    public string Address { get; set; } = string.Empty;

    [Required]
    [StringLength(20)]
    public string Gender { get; set; } = string.Empty;

    public List<EducationDto> Education { get; set; } = new();
}

public class UpdateUserRequest
{
    [Required]
    [StringLength(20)]
    public string Phone { get; set; } = string.Empty;

    [Required]
    [StringLength(10)]
    public string DateOfBirth { get; set; } = string.Empty;

    [Required]
    [StringLength(300)]
    public string Address { get; set; } = string.Empty;

    [Required]
    [StringLength(20)]
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
