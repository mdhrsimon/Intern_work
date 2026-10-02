using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using ReactFormApi.Constants;
using ReactFormApi.Data;
using ReactFormApi.DTOs.Classes;
using ReactFormApi.Helpers;
using ReactFormApi.Models;

namespace ReactFormApi.Authorization;

public class ClassAuthorizationService
{
    private readonly AppDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;

    public ClassAuthorizationService(AppDbContext context, UserManager<ApplicationUser> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    public async Task<(bool IsAllowed, bool IsTeacherOrAdmin, ClassEnrollment? Enrollment)> CheckClassAuthAsync(
        int classChannelId,
        string? currentUserId,
        string? currentUserRole)
    {
        if (string.IsNullOrEmpty(currentUserId))
            return (false, false, null);

        var effectiveRole = currentUserRole ?? RoleConstants.Student;
        if (effectiveRole == RoleConstants.Admin)
            return (true, true, null);

        var enrollment = await _context.ClassEnrollments
            .FirstOrDefaultAsync(e => e.ClassChannelId == classChannelId && e.ApplicationUserId == currentUserId);

        if (enrollment == null)
            return (false, false, null);

        bool isTeacherInClass = enrollment.RoleInClass == RoleConstants.Teacher || enrollment.RoleInClass == RoleConstants.Staff;
        bool isTeacherBySystemRole = effectiveRole == RoleConstants.Teacher || effectiveRole == RoleConstants.Staff;

        return (true, isTeacherInClass && isTeacherBySystemRole, enrollment);
    }

    public async Task<PolicyCheckResult> EvaluatePolicyAsync(PolicyCheckRequest request, string? fallbackUserId)
    {
        var cls = await _context.ClassChannels.FindAsync(request.ClassId);
        if (cls == null)
        {
            return new PolicyCheckResult
            {
                IsAllowed = false,
                Reason = $"Class ID {request.ClassId} not found.",
                ClassName = "Unknown"
            };
        }

        var userId = !string.IsNullOrWhiteSpace(request.UserId) ? request.UserId : fallbackUserId;

        if (string.IsNullOrEmpty(userId))
        {
            return new PolicyCheckResult
            {
                IsAllowed = false,
                Reason = "User not identified.",
                ClassName = cls.Name
            };
        }

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return new PolicyCheckResult
            {
                IsAllowed = false,
                Reason = "User does not exist in database.",
                ClassName = cls.Name
            };
        }

        var roles = await _userManager.GetRolesAsync(user);
        var userRole = RoleHelper.GetPrimaryRole(roles);

        if (userRole == RoleConstants.Admin)
        {
            return new PolicyCheckResult
            {
                IsAllowed = true,
                Reason = "Admin role possesses global unrestricted access across all classes.",
                UserRole = RoleConstants.Admin,
                RoleInClass = RoleConstants.Admin,
                ClassName = cls.Name
            };
        }

        var enrollment = await _context.ClassEnrollments
            .FirstOrDefaultAsync(e => e.ClassChannelId == request.ClassId && e.ApplicationUserId == userId);

        if (enrollment == null)
        {
            return new PolicyCheckResult
            {
                IsAllowed = false,
                Reason = $"❌ Forbidden (403): User '{user.FullName ?? user.Email}' ({userRole}) is NOT assigned/enrolled in class '{cls.Name}'.",
                UserRole = userRole,
                RoleInClass = null,
                ClassName = cls.Name
            };
        }

        if (request.Action == "ManageClass")
        {
            if (enrollment.RoleInClass == RoleConstants.Staff || enrollment.RoleInClass == RoleConstants.Teacher)
            {
                return new PolicyCheckResult
                {
                    IsAllowed = true,
                    Reason = $"✅ Allowed: User '{user.FullName ?? user.Email}' is assigned as Teacher/Staff in '{cls.Name}' with ManageClass policy privileges.",
                    UserRole = userRole,
                    RoleInClass = enrollment.RoleInClass,
                    ClassName = cls.Name
                };
            }

            return new PolicyCheckResult
            {
                IsAllowed = false,
                Reason = $"❌ Forbidden (403): User '{user.FullName ?? user.Email}' is enrolled as a Student in '{cls.Name}' and cannot perform ManageClass action.",
                UserRole = userRole,
                RoleInClass = enrollment.RoleInClass,
                ClassName = cls.Name
            };
        }

        return new PolicyCheckResult
        {
            IsAllowed = true,
            Reason = $"✅ Allowed: User '{user.FullName ?? user.Email}' is enrolled in '{cls.Name}' ({enrollment.RoleInClass}).",
            UserRole = userRole,
            RoleInClass = enrollment.RoleInClass,
            ClassName = cls.Name
        };
    }
}
