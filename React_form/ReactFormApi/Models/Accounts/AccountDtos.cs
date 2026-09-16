using ReactFormApi.Models.Classes;

namespace ReactFormApi.Models.Accounts;

public class AccountDto
{
    public string Id { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Role { get; set; } = "Student";
    public bool IsActive { get; set; } = true;
    public DateTime? CreatedAt { get; set; }
    public List<AssignedClassSummaryDto> AssignedClasses { get; set; } = new();
}

public class CreateAccountRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Role { get; set; } = "Student"; // Admin | Staff | Student
}

public class UpdateAccountRequest
{
    public string? Email { get; set; }
    public string? FullName { get; set; }
    public string? Role { get; set; }
    public bool? IsActive { get; set; }
    public string? Password { get; set; } // optional change
}

public class ChangeRoleRequest
{
    public string Role { get; set; } = string.Empty;
}

public class ToggleActiveRequest
{
    public bool IsActive { get; set; }
}

public class PagedAccountsResult
{
    public List<AccountDto> Items { get; set; } = new();
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
    public int TotalPages { get; set; }
    public bool HasMore { get; set; }
}