using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using ReactFormApi.Constants;
using ReactFormApi.Data;
using ReactFormApi.DTOs.Accounts;
using ReactFormApi.DTOs.Classes;
using ReactFormApi.Helpers;
using ReactFormApi.Models;

namespace ReactFormApi.Services;

public class AccountService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly AppDbContext _context;
    private readonly INotificationService _notificationService;
    private readonly UserStateCache _userStateCache;

    public AccountService(
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager,
        AppDbContext context,
        INotificationService notificationService,
        UserStateCache userStateCache)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _context = context;
        _notificationService = notificationService;
        _userStateCache = userStateCache;
    }

    public async Task<PagedAccountsResult> GetAccountsAsync(
        int page = 1,
        int pageSize = 10,
        string? search = null,
        string? role = null,
        bool? isActive = null)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 10;
        if (pageSize > 50) pageSize = 50;

        var query = _userManager.Users.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(u =>
                (u.Email != null && u.Email.ToLower().Contains(s)) ||
                (u.FullName != null && u.FullName.ToLower().Contains(s)));
        }

        if (isActive.HasValue)
            query = query.Where(u => u.IsActive == isActive.Value);

        var users = await query.OrderByDescending(u => u.Id).ToListAsync();

        var resultItems = new List<AccountDto>();

        var userIds = users.Select(u => u.Id).ToList();
        var enrollments = await _context.ClassEnrollments
            .Include(e => e.ClassChannel)
            .Where(e => userIds.Contains(e.ApplicationUserId))
            .ToListAsync();

        foreach (var user in users)
        {
            var roles = await _userManager.GetRolesAsync(user);
            var userRole = RoleHelper.GetPrimaryRole(roles);

            if (!string.IsNullOrWhiteSpace(role) &&
                !string.Equals(userRole, role, StringComparison.OrdinalIgnoreCase))
                continue;

            var userEnrollments = enrollments
                .Where(e => e.ApplicationUserId == user.Id)
                .Select(e => new AssignedClassSummaryDto
                {
                    ClassId = e.ClassChannelId,
                    ClassName = e.ClassChannel.Name,
                    Code = e.ClassChannel.Code,
                    RoleInClass = e.RoleInClass,
                    JoinedAt = e.JoinedAt
                })
                .ToList();

            resultItems.Add(MapToDto(user, userRole, userEnrollments));
        }

        var totalCount = resultItems.Count;
        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

        var paged = resultItems
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        return new PagedAccountsResult
        {
            Items = paged,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = totalPages,
            HasMore = page < totalPages
        };
    }

    public async Task<AccountDto?> GetAccountByIdAsync(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null) return null;

        var roles = await _userManager.GetRolesAsync(user);
        var role = RoleHelper.GetPrimaryRole(roles);

        var userEnrollments = await _context.ClassEnrollments
            .Include(e => e.ClassChannel)
            .Where(e => e.ApplicationUserId == user.Id)
            .Select(e => new AssignedClassSummaryDto
            {
                ClassId = e.ClassChannelId,
                ClassName = e.ClassChannel.Name,
                Code = e.ClassChannel.Code,
                RoleInClass = e.RoleInClass,
                JoinedAt = e.JoinedAt
            })
            .ToListAsync();

        return MapToDto(user, role, userEnrollments);
    }

    public async Task<AccountServiceResult> CreateAccountAsync(CreateAccountRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            return AccountServiceResult.Fail(400, "Email and password are required.");

        var trimmedEmail = request.Email.Trim();
        if (await _userManager.FindByEmailAsync(trimmedEmail) != null)
            return AccountServiceResult.Fail(400, "Email is already registered.");

        var role = RoleHelper.NormalizeRole(request.Role);

        var user = new ApplicationUser
        {
            UserName = trimmedEmail,
            Email = trimmedEmail,
            FullName = request.FullName?.Trim(),
            EmailConfirmed = true,
            IsActive = true
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
            return AccountServiceResult.Fail(400, "Creation failed", result.Errors.Select(e => e.Description));

        if (!await _roleManager.RoleExistsAsync(role))
            await _roleManager.CreateAsync(new IdentityRole(role));

        await _userManager.AddToRoleAsync(user, role);

        await _notificationService.NotifyAllAdminsAsync(
            NotificationType.UserRegistered,
            "New User Created",
            $"{user.FullName ?? user.Email} was created with role {role}.",
            null,
            null,
            null);

        return AccountServiceResult.Ok(MapToDto(user, role, new List<AssignedClassSummaryDto>()));
    }

    public async Task<AccountServiceResult> UpdateAccountAsync(string id, string? currentUserId, UpdateAccountRequest request)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null) return AccountServiceResult.Fail(404, "User not found.");

        if (request.IsActive.HasValue && !request.IsActive.Value && currentUserId == id)
        {
            return AccountServiceResult.Fail(400, "You cannot deactivate your own administrative account.");
        }

        if (request.IsActive.HasValue && !request.IsActive.Value && await IsLastActiveAdminAsync(id))
        {
            return AccountServiceResult.Fail(400, "Cannot deactivate the last active administrator.");
        }

        if (!string.IsNullOrWhiteSpace(request.Role))
        {
            var requestedRole = RoleHelper.NormalizeRole(request.Role);
            if (currentUserId == id && requestedRole != RoleConstants.Admin)
            {
                return AccountServiceResult.Fail(400, "You cannot change your own administrative role.");
            }

            if (requestedRole != RoleConstants.Admin && await IsLastActiveAdminAsync(id))
            {
                return AccountServiceResult.Fail(400, "Cannot demote the last active administrator.");
            }
        }

        var trimmedEmail = request.Email?.Trim();
        var trimmedFullName = request.FullName?.Trim();

        var emailChanged = !string.IsNullOrWhiteSpace(trimmedEmail) && trimmedEmail != user.Email;
        var fullNameChanged = !string.IsNullOrWhiteSpace(trimmedFullName) && trimmedFullName != user.FullName;

        if (emailChanged)
        {
            user.Email = trimmedEmail;
            user.UserName = trimmedEmail;
        }

        if (fullNameChanged)
            user.FullName = trimmedFullName;

        var previousIsActive = user.IsActive;
        if (request.IsActive.HasValue)
            user.IsActive = request.IsActive.Value;

        if (!string.IsNullOrWhiteSpace(request.Password))
        {
            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var passResult = await _userManager.ResetPasswordAsync(user, token, request.Password);
            if (!passResult.Succeeded)
                return AccountServiceResult.Fail(400, "Password update failed", passResult.Errors.Select(e => e.Description));

            await _userManager.UpdateSecurityStampAsync(user);
            user.RefreshToken = null;
            user.RefreshTokenExpiryTime = null;
            await _userManager.UpdateAsync(user);
            _userStateCache.Invalidate(user.Id);
        }

        if (emailChanged || fullNameChanged)
        {
            var linkedUser = await _context.Users.FirstOrDefaultAsync(u => u.ApplicationUserId == user.Id);
            if (linkedUser != null)
            {
                if (emailChanged)
                    linkedUser.Email = trimmedEmail!;
                if (fullNameChanged)
                    linkedUser.FullName = trimmedFullName!;
            }
        }

        var updateResult = await _userManager.UpdateAsync(user);
        if (!updateResult.Succeeded)
        {
            var isDuplicate = updateResult.Errors.Any(e =>
                e.Code.Contains("Duplicate", StringComparison.OrdinalIgnoreCase) ||
                e.Description.Contains("already taken", StringComparison.OrdinalIgnoreCase) ||
                e.Description.Contains("already in use", StringComparison.OrdinalIgnoreCase));

            return AccountServiceResult.Fail(
                isDuplicate ? 409 : 400,
                isDuplicate ? "Email is already in use." : "Account update failed.",
                updateResult.Errors.Select(e => e.Description));
        }

        if (_context.ChangeTracker.HasChanges())
        {
            await _context.SaveChangesAsync();
        }

        if (request.IsActive.HasValue && request.IsActive.Value != previousIsActive)
        {
            if (!request.IsActive.Value)
            {
                await _userManager.UpdateSecurityStampAsync(user);
                user.RefreshToken = null;
                user.RefreshTokenExpiryTime = null;
                await _userManager.UpdateAsync(user);
            }
            _userStateCache.Invalidate(user.Id);

            await _notificationService.NotifyAllAdminsAsync(
                NotificationType.UserStatusChanged,
                $"Account {(request.IsActive.Value ? "Activated" : "Deactivated")}",
                $"Account for {user.FullName ?? user.Email} was {(request.IsActive.Value ? "activated" : "deactivated")}.",
                null,
                null,
                currentUserId);
        }

        if (!string.IsNullOrWhiteSpace(request.Role))
        {
            var newRole = RoleHelper.NormalizeRole(request.Role);
            var currentRoles = await _userManager.GetRolesAsync(user);
            var oldRole = RoleHelper.GetPrimaryRole(currentRoles);

            if (newRole != oldRole)
            {
                var conflictError = await CheckRoleChangeConflictsAsync(user, oldRole, newRole);
                if (conflictError != null)
                {
                    return AccountServiceResult.Fail(409, conflictError);
                }

                var roleChangeResult = await PerformRoleChangeTransactionAsync(user, newRole);
                if (roleChangeResult != null)
                {
                    return roleChangeResult;
                }
            }
        }

        var roles = await _userManager.GetRolesAsync(user);
        var role = RoleHelper.GetPrimaryRole(roles);

        var userEnrollments = await _context.ClassEnrollments
            .Include(e => e.ClassChannel)
            .Where(e => e.ApplicationUserId == user.Id)
            .Select(e => new AssignedClassSummaryDto
            {
                ClassId = e.ClassChannelId,
                ClassName = e.ClassChannel.Name,
                Code = e.ClassChannel.Code,
                RoleInClass = e.RoleInClass,
                JoinedAt = e.JoinedAt
            })
            .ToListAsync();

        return AccountServiceResult.Ok(MapToDto(user, role, userEnrollments));
    }

    public async Task<AccountServiceResult> ChangeRoleAsync(string id, string? currentUserId, string requestedRole)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null) return AccountServiceResult.Fail(404, "User not found.");

        var newRole = RoleHelper.NormalizeRole(requestedRole);
        var currentRoles = await _userManager.GetRolesAsync(user);
        var oldRole = RoleHelper.GetPrimaryRole(currentRoles);

        if (currentUserId == id && newRole != RoleConstants.Admin)
        {
            return AccountServiceResult.Fail(400, "You cannot change your own administrative role.");
        }

        if (newRole != RoleConstants.Admin && await IsLastActiveAdminAsync(id))
        {
            return AccountServiceResult.Fail(400, "Cannot demote the last active administrator.");
        }

        var conflictError = await CheckRoleChangeConflictsAsync(user, oldRole, newRole);
        if (conflictError != null)
        {
            return AccountServiceResult.Fail(409, conflictError);
        }

        var roleChangeResult = await PerformRoleChangeTransactionAsync(user, newRole);
        if (roleChangeResult != null)
        {
            return roleChangeResult;
        }

        var userEnrollments = await _context.ClassEnrollments
            .Include(e => e.ClassChannel)
            .Where(e => e.ApplicationUserId == user.Id)
            .Select(e => new AssignedClassSummaryDto
            {
                ClassId = e.ClassChannelId,
                ClassName = e.ClassChannel.Name,
                Code = e.ClassChannel.Code,
                RoleInClass = e.RoleInClass,
                JoinedAt = e.JoinedAt
            })
            .ToListAsync();

        return AccountServiceResult.Ok(MapToDto(user, newRole, userEnrollments));
    }

    public async Task<AccountServiceResult> ToggleActiveAsync(string id, string? currentUserId, bool isActive)
    {
        if (!isActive && currentUserId == id)
        {
            return AccountServiceResult.Fail(400, "You cannot deactivate your own administrative account.");
        }

        if (!isActive && await IsLastActiveAdminAsync(id))
        {
            return AccountServiceResult.Fail(400, "Cannot deactivate the last active administrator.");
        }

        var user = await _userManager.FindByIdAsync(id);
        if (user == null) return AccountServiceResult.Fail(404, "User not found.");

        user.IsActive = isActive;
        if (!isActive)
        {
            await _userManager.UpdateSecurityStampAsync(user);
            user.RefreshToken = null;
            user.RefreshTokenExpiryTime = null;
        }
        await _userManager.UpdateAsync(user);
        _userStateCache.Invalidate(user.Id);

        await _notificationService.NotifyAllAdminsAsync(
            NotificationType.UserStatusChanged,
            $"Account {(isActive ? "Activated" : "Deactivated")}",
            $"Account for {user.FullName ?? user.Email} was {(isActive ? "activated" : "deactivated")}.",
            null,
            null,
            currentUserId);

        var roles = await _userManager.GetRolesAsync(user);
        var role = RoleHelper.GetPrimaryRole(roles);

        var userEnrollments = await _context.ClassEnrollments
            .Include(e => e.ClassChannel)
            .Where(e => e.ApplicationUserId == user.Id)
            .Select(e => new AssignedClassSummaryDto
            {
                ClassId = e.ClassChannelId,
                ClassName = e.ClassChannel.Name,
                Code = e.ClassChannel.Code,
                RoleInClass = e.RoleInClass,
                JoinedAt = e.JoinedAt
            })
            .ToListAsync();

        return AccountServiceResult.Ok(MapToDto(user, role, userEnrollments));
    }

    public async Task<AccountServiceResult> DeleteAccountAsync(string id, string? currentUserId)
    {
        if (currentUserId == id)
        {
            return AccountServiceResult.Fail(400, "You cannot delete your own administrative account.");
        }

        if (await IsLastActiveAdminAsync(id))
        {
            return AccountServiceResult.Fail(400, "Cannot delete the last active administrator.");
        }

        var user = await _userManager.FindByIdAsync(id);
        if (user == null) return AccountServiceResult.Fail(404, "User not found.");

        var assignmentsCreated = await _context.Assignments.CountAsync(a => a.CreatedByUserId == user.Id);
        var submissions = await _context.AssignmentSubmissions.CountAsync(s => s.StudentUserId == user.Id);
        var attachmentsUploaded = await _context.AssignmentAttachments.CountAsync(a => a.UploadedByUserId == user.Id);

        if (assignmentsCreated > 0 || submissions > 0 || attachmentsUploaded > 0)
        {
            return AccountServiceResult.Fail(409, $"Cannot delete account: user has dependent academic records ({assignmentsCreated} assignments created, {submissions} submissions, {attachmentsUploaded} attachments uploaded). Deactivate the account instead to remove access while preserving academic history.");
        }

        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var result = await _userManager.DeleteAsync(user);
            if (!result.Succeeded)
            {
                await transaction.RollbackAsync();
                return AccountServiceResult.Fail(400, "Delete failed", result.Errors.Select(e => e.Description));
            }

            await transaction.CommitAsync();
        }
        catch (DbUpdateException)
        {
            await transaction.RollbackAsync();
            return AccountServiceResult.Fail(409, "Cannot delete account because dependent records exist in the database. Deactivate the account instead.");
        }

        _userStateCache.Invalidate(id);
        return AccountServiceResult.NoContentResult();
    }

    private async Task<bool> IsLastActiveAdminAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null || !user.IsActive) return false;
        var roles = await _userManager.GetRolesAsync(user);
        if (!roles.Contains(RoleConstants.Admin)) return false;

        var allAdmins = await _userManager.GetUsersInRoleAsync(RoleConstants.Admin);
        var activeOtherAdmins = allAdmins.Any(u => u.IsActive && u.Id != userId);
        return !activeOtherAdmins;
    }

    private async Task<string?> CheckRoleChangeConflictsAsync(ApplicationUser user, string oldRole, string newRole)
    {
        if (oldRole == newRole) return null;

        if (oldRole == RoleConstants.Staff && newRole != RoleConstants.Staff)
        {
            var hasAssignments = await _context.Assignments.AnyAsync(a => a.CreatedByUserId == user.Id);
            var hasAttachments = await _context.AssignmentAttachments.AnyAsync(a => a.UploadedByUserId == user.Id);
            if (hasAssignments || hasAttachments)
            {
                return "Cannot change role: user has existing teaching records (assignments or attachments created as teacher/staff).";
            }
        }
        else if (oldRole == RoleConstants.Student && newRole != RoleConstants.Student)
        {
            var hasSubmissions = await _context.AssignmentSubmissions.AnyAsync(s => s.StudentUserId == user.Id);
            if (hasSubmissions)
            {
                return "Cannot change role: user has existing academic submissions as a student.";
            }
        }

        return null;
    }

    private async Task<AccountServiceResult?> PerformRoleChangeTransactionAsync(ApplicationUser user, string newRole)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var currentRoles = await _userManager.GetRolesAsync(user);
            var removeResult = await _userManager.RemoveFromRolesAsync(user, currentRoles);
            if (!removeResult.Succeeded)
            {
                await transaction.RollbackAsync();
                return AccountServiceResult.Fail(400, "Failed to remove previous roles.", removeResult.Errors.Select(e => e.Description));
            }

            if (!await _roleManager.RoleExistsAsync(newRole))
                await _roleManager.CreateAsync(new IdentityRole(newRole));

            var addResult = await _userManager.AddToRoleAsync(user, newRole);
            if (!addResult.Succeeded)
            {
                await transaction.RollbackAsync();
                return AccountServiceResult.Fail(400, "Failed to add new role.", addResult.Errors.Select(e => e.Description));
            }

            // Delete enrollments that no longer satisfy the rule
            var enrollments = await _context.ClassEnrollments
                .Where(e => e.ApplicationUserId == user.Id)
                .ToListAsync();

            var invalidEnrollments = enrollments.Where(e => !EnrollmentRules.IsValid(newRole, e.RoleInClass)).ToList();
            if (invalidEnrollments.Count > 0)
            {
                _context.ClassEnrollments.RemoveRange(invalidEnrollments);
                await _context.SaveChangesAsync();
            }

            await transaction.CommitAsync();

            // Item 1 invalidation
            await _userManager.UpdateSecurityStampAsync(user);
            user.RefreshToken = null;
            user.RefreshTokenExpiryTime = null;
            await _userManager.UpdateAsync(user);
            _userStateCache.Invalidate(user.Id);

            return null;
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    private static AccountDto MapToDto(ApplicationUser user, string role, List<AssignedClassSummaryDto> assignedClasses)
    {
        return new AccountDto
        {
            Id = user.Id,
            Email = user.Email ?? string.Empty,
            FullName = user.FullName ?? string.Empty,
            Role = role,
            IsActive = user.IsActive,
            CreatedAt = null,
            AssignedClasses = assignedClasses
        };
    }
}
