using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
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

    public AccountService(
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager,
        AppDbContext context,
        INotificationService notificationService)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _context = context;
        _notificationService = notificationService;
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

        if (!string.IsNullOrWhiteSpace(request.Email))
        {
            user.Email = request.Email.Trim();
            user.UserName = request.Email.Trim();
        }

        if (!string.IsNullOrWhiteSpace(request.FullName))
            user.FullName = request.FullName.Trim();

        var previousIsActive = user.IsActive;
        if (request.IsActive.HasValue)
            user.IsActive = request.IsActive.Value;

        if (!string.IsNullOrWhiteSpace(request.Password))
        {
            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var passResult = await _userManager.ResetPasswordAsync(user, token, request.Password);
            if (!passResult.Succeeded)
                return AccountServiceResult.Fail(400, "Password update failed", passResult.Errors.Select(e => e.Description));
        }

        await _userManager.UpdateAsync(user);

        if (request.IsActive.HasValue && request.IsActive.Value != previousIsActive)
        {
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
            await _userManager.RemoveFromRolesAsync(user, currentRoles);
            if (!await _roleManager.RoleExistsAsync(newRole))
                await _roleManager.CreateAsync(new IdentityRole(newRole));
            await _userManager.AddToRoleAsync(user, newRole);
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

    public async Task<AccountDto?> ChangeRoleAsync(string id, string requestedRole)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null) return null;

        var newRole = RoleHelper.NormalizeRole(requestedRole);
        var currentRoles = await _userManager.GetRolesAsync(user);
        await _userManager.RemoveFromRolesAsync(user, currentRoles);

        if (!await _roleManager.RoleExistsAsync(newRole))
            await _roleManager.CreateAsync(new IdentityRole(newRole));

        await _userManager.AddToRoleAsync(user, newRole);

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

        return MapToDto(user, newRole, userEnrollments);
    }

    public async Task<AccountServiceResult> ToggleActiveAsync(string id, string? currentUserId, bool isActive)
    {
        if (!isActive && currentUserId == id)
        {
            return AccountServiceResult.Fail(400, "You cannot deactivate your own administrative account.");
        }

        var user = await _userManager.FindByIdAsync(id);
        if (user == null) return AccountServiceResult.Fail(404, "User not found.");

        user.IsActive = isActive;
        await _userManager.UpdateAsync(user);

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

        var user = await _userManager.FindByIdAsync(id);
        if (user == null) return AccountServiceResult.Fail(404, "User not found.");

        var result = await _userManager.DeleteAsync(user);
        if (!result.Succeeded)
            return AccountServiceResult.Fail(400, "Delete failed", result.Errors.Select(e => e.Description));

        return AccountServiceResult.NoContentResult();
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
