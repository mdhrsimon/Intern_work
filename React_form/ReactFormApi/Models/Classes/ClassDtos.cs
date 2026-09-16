namespace ReactFormApi.Models.Classes;

public class ClassChannelDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Code { get; set; }
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }
    public int StaffCount { get; set; }
    public int StudentCount { get; set; }
}

public class ClassMemberDto
{
    public string AccountId { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = "Student";
    public string RoleInClass { get; set; } = "Student";
    public DateTime? AssignedAt { get; set; }
}

public class ClassWithMembersDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Code { get; set; }
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<ClassMemberDto> Staff { get; set; } = new();
    public List<ClassMemberDto> Students { get; set; } = new();
}

public class CreateClassRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Code { get; set; }
    public string? Description { get; set; }
}

public class UpdateClassRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Code { get; set; }
    public string? Description { get; set; }
}

public class AssignMemberRequest
{
    public string AccountId { get; set; } = string.Empty;
    public string RoleInClass { get; set; } = "Student"; // "Staff" or "Student"
}

public class PagedClassesResult
{
    public List<ClassChannelDto> Items { get; set; } = new();
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
    public int TotalPages { get; set; }
    public bool HasMore { get; set; }
}

public class AssignedClassSummaryDto
{
    public int ClassId { get; set; }
    public string ClassName { get; set; } = string.Empty;
    public string? Code { get; set; }
    public string RoleInClass { get; set; } = "Student";
    public DateTime JoinedAt { get; set; }
}

public class PolicyCheckRequest
{
    public string? UserId { get; set; }
    public int ClassId { get; set; }
    public string Action { get; set; } = "ManageClass"; // "ManageClass" | "ViewClass"
}

public class PolicyCheckResult
{
    public bool IsAllowed { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string UserRole { get; set; } = string.Empty;
    public string? RoleInClass { get; set; }
    public string ClassName { get; set; } = string.Empty;
}
