using ReactFormApi.Constants;

namespace ReactFormApi.Helpers;

public static class RoleHelper
{
    public static string NormalizeRole(string? role)
    {
        if (string.IsNullOrWhiteSpace(role))
            return RoleConstants.Student;

        var trimmed = role.Trim();
        if (string.Equals(trimmed, RoleConstants.Admin, StringComparison.OrdinalIgnoreCase))
            return RoleConstants.Admin;

        if (string.Equals(trimmed, RoleConstants.Staff, StringComparison.OrdinalIgnoreCase) ||
            string.Equals(trimmed, RoleConstants.Teacher, StringComparison.OrdinalIgnoreCase))
            return RoleConstants.Staff;

        return RoleConstants.Student;
    }

    public static string GetPrimaryRole(IList<string> roles)
    {
        if (roles.Contains(RoleConstants.Admin))
            return RoleConstants.Admin;

        if (roles.Contains(RoleConstants.Staff) || roles.Contains(RoleConstants.Teacher))
            return RoleConstants.Staff;

        return RoleConstants.Student;
    }
}
