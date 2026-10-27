using ReactFormApi.Constants;

namespace ReactFormApi.Helpers;

public static class EnrollmentRules
{
    public static bool IsValid(string? systemRole, string? roleInClass)
    {
        if (string.IsNullOrWhiteSpace(systemRole) || string.IsNullOrWhiteSpace(roleInClass))
            return false;

        var normalizedSystem = RoleHelper.NormalizeRole(systemRole);
        var normalizedClass = RoleHelper.NormalizeRole(roleInClass);

        // Admin accounts cannot be enrolled
        if (normalizedSystem == RoleConstants.Admin)
            return false;

        // Student accounts may only be Student in a class
        if (normalizedSystem == RoleConstants.Student)
            return normalizedClass == RoleConstants.Student;

        // Staff/Teacher accounts only Staff
        if (normalizedSystem == RoleConstants.Staff)
            return normalizedClass == RoleConstants.Staff;

        return false;
    }
}
