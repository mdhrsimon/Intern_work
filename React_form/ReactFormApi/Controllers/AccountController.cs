using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReactFormApi.Data;
using ReactFormApi.Models;
using ReactFormApi.Models.Accounts;
using ReactFormApi.Models.Classes;

namespace ReactFormApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]   // only Admin can manage accounts
public class AccountsController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly AppDbContext _context;

    public AccountsController(
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager,
        AppDbContext context)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _context = context;
    }

    // GET: api/accounts?page=1&pageSize=10&search=&role=&isActive=
    [HttpGet]
    public async Task<IActionResult> GetAccounts(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        [FromQuery] string? role = null,
        [FromQuery] bool? isActive = null)
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

        // Fetch users
        var users = await query.OrderByDescending(u => u.Id).ToListAsync();

        var resultItems = new List<AccountDto>();

        // Preload enrollments for assigned class display
        var userIds = users.Select(u => u.Id).ToList();
        var enrollments = await _context.ClassEnrollments
            .Include(e => e.ClassChannel)
            .Where(e => userIds.Contains(e.ApplicationUserId))
            .ToListAsync();

        foreach (var user in users)
        {
            var roles = await _userManager.GetRolesAsync(user);
            var userRole = roles.Contains("Admin") ? "Admin"
                         : (roles.Contains("Staff") || roles.Contains("Teacher")) ? "Staff"
                         : "Student";

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

        return Ok(new PagedAccountsResult
        {
            Items = paged,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = totalPages,
            HasMore = page < totalPages
        });
    }

    // GET: api/accounts/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetAccount(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null) return NotFound();

        var roles = await _userManager.GetRolesAsync(user);
        var role = roles.Contains("Admin") ? "Admin"
                 : (roles.Contains("Staff") || roles.Contains("Teacher")) ? "Staff"
                 : "Student";

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

        return Ok(MapToDto(user, role, userEnrollments));
    }

    // POST: api/accounts
    [HttpPost]
    public async Task<IActionResult> CreateAccount([FromBody] CreateAccountRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            return BadRequest(new { message = "Email and password are required." });

        if (await _userManager.FindByEmailAsync(request.Email.Trim()) != null)
            return BadRequest(new { message = "Email is already registered." });

        var role = NormalizeRole(request.Role);

        var user = new ApplicationUser
        {
            UserName = request.Email.Trim(),
            Email = request.Email.Trim(),
            FullName = request.FullName?.Trim(),
            EmailConfirmed = true,
            IsActive = true
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
            return BadRequest(new { message = "Creation failed", errors = result.Errors.Select(e => e.Description) });

        if (!await _roleManager.RoleExistsAsync(role))
            await _roleManager.CreateAsync(new IdentityRole(role));

        await _userManager.AddToRoleAsync(user, role);

        return Ok(MapToDto(user, role, new List<AssignedClassSummaryDto>()));
    }

    // PUT: api/accounts/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateAccount(string id, [FromBody] UpdateAccountRequest request)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var user = await _userManager.FindByIdAsync(id);
        if (user == null) return NotFound();

        // Safeguard: Prevent admin from deactivating self
        if (request.IsActive.HasValue && !request.IsActive.Value && currentUserId == id)
        {
            return BadRequest(new { message = "You cannot deactivate your own administrative account." });
        }

        if (!string.IsNullOrWhiteSpace(request.Email))
        {
            user.Email = request.Email.Trim();
            user.UserName = request.Email.Trim();
        }

        if (!string.IsNullOrWhiteSpace(request.FullName))
            user.FullName = request.FullName.Trim();

        if (request.IsActive.HasValue)
            user.IsActive = request.IsActive.Value;

        if (!string.IsNullOrWhiteSpace(request.Password))
        {
            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var passResult = await _userManager.ResetPasswordAsync(user, token, request.Password);
            if (!passResult.Succeeded)
                return BadRequest(new { message = "Password update failed", errors = passResult.Errors.Select(e => e.Description) });
        }

        await _userManager.UpdateAsync(user);

        // Change role if requested
        if (!string.IsNullOrWhiteSpace(request.Role))
        {
            var newRole = NormalizeRole(request.Role);
            var currentRoles = await _userManager.GetRolesAsync(user);
            await _userManager.RemoveFromRolesAsync(user, currentRoles);
            if (!await _roleManager.RoleExistsAsync(newRole))
                await _roleManager.CreateAsync(new IdentityRole(newRole));
            await _userManager.AddToRoleAsync(user, newRole);
        }

        var roles = await _userManager.GetRolesAsync(user);
        var role = roles.Contains("Admin") ? "Admin"
                 : (roles.Contains("Staff") || roles.Contains("Teacher")) ? "Staff"
                 : "Student";

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

        return Ok(MapToDto(user, role, userEnrollments));
    }

    // PATCH: api/accounts/{id}/role
    [HttpPatch("{id}/role")]
    public async Task<IActionResult> ChangeRole(string id, [FromBody] ChangeRoleRequest request)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null) return NotFound();

        var newRole = NormalizeRole(request.Role);
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

        return Ok(MapToDto(user, newRole, userEnrollments));
    }

    // PATCH: api/accounts/{id}/active
    [HttpPatch("{id}/active")]
    public async Task<IActionResult> ToggleActive(string id, [FromBody] ToggleActiveRequest request)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!request.IsActive && currentUserId == id)
        {
            return BadRequest(new { message = "You cannot deactivate your own administrative account." });
        }

        var user = await _userManager.FindByIdAsync(id);
        if (user == null) return NotFound();

        user.IsActive = request.IsActive;
        await _userManager.UpdateAsync(user);

        var roles = await _userManager.GetRolesAsync(user);
        var role = roles.Contains("Admin") ? "Admin"
                 : (roles.Contains("Staff") || roles.Contains("Teacher")) ? "Staff"
                 : "Student";

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

        return Ok(MapToDto(user, role, userEnrollments));
    }

    // DELETE: api/accounts/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAccount(string id)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (currentUserId == id)
        {
            return BadRequest(new { message = "You cannot delete your own administrative account." });
        }

        var user = await _userManager.FindByIdAsync(id);
        if (user == null) return NotFound();

        var result = await _userManager.DeleteAsync(user);
        if (!result.Succeeded)
            return BadRequest(new { message = "Delete failed", errors = result.Errors.Select(e => e.Description) });

        return NoContent();
    }

    // ---------- helpers ----------
    private static string NormalizeRole(string? role)
    {
        if (string.Equals(role, "Admin", StringComparison.OrdinalIgnoreCase)) return "Admin";
        if (string.Equals(role, "Staff", StringComparison.OrdinalIgnoreCase) ||
            string.Equals(role, "Teacher", StringComparison.OrdinalIgnoreCase)) return "Staff";
        return "Student";
    }

    private static AccountDto MapToDto(ApplicationUser user, string role, List<AssignedClassSummaryDto> assignedClasses)
    {
        return new AccountDto
        {
            Id = user.Id,
            Email = user.Email ?? "",
            FullName = user.FullName ?? "",
            Role = role,
            IsActive = user.IsActive,
            CreatedAt = null,
            AssignedClasses = assignedClasses
        };
    }
}