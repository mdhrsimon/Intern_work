using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReactFormApi.Data;
using ReactFormApi.Models;
using ReactFormApi.Models.Classes;

namespace ReactFormApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ClassesController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;

    public ClassesController(AppDbContext context, UserManager<ApplicationUser> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    // GET: api/classes?page=1&pageSize=20&search=
    [HttpGet]
    public async Task<IActionResult> GetClasses(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 20;
        if (pageSize > 100) pageSize = 100;

        var query = _context.ClassChannels.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(c => c.Name.ToLower().Contains(s) || (c.Code != null && c.Code.ToLower().Contains(s)));
        }

        var totalCount = await query.CountAsync();
        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

        var classes = await query
            .OrderBy(c => c.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new ClassChannelDto
            {
                Id = c.Id,
                Name = c.Name,
                Code = c.Code,
                Description = c.Description,
                CreatedAt = c.CreatedAt,
                StaffCount = c.Enrollments.Count(e => e.RoleInClass == "Staff" || e.RoleInClass == "Teacher"),
                StudentCount = c.Enrollments.Count(e => e.RoleInClass == "Student")
            })
            .ToListAsync();

        return Ok(new PagedClassesResult
        {
            Items = classes,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = totalPages,
            HasMore = page < totalPages
        });
    }

    // GET: api/classes/my-classes
    [HttpGet("my-classes")]
    public async Task<IActionResult> GetMyClasses()
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(currentUserId)) return Unauthorized();

        var enrollments = await _context.ClassEnrollments
            .Include(e => e.ClassChannel)
                .ThenInclude(c => c.Enrollments)
            .Where(e => e.ApplicationUserId == currentUserId)
            .ToListAsync();

        var myClasses = enrollments.Select(e => new ClassChannelDto
        {
            Id = e.ClassChannel.Id,
            Name = e.ClassChannel.Name,
            Code = e.ClassChannel.Code,
            Description = e.ClassChannel.Description,
            CreatedAt = e.ClassChannel.CreatedAt,
            StaffCount = e.ClassChannel.Enrollments.Count(en => en.RoleInClass == "Staff" || en.RoleInClass == "Teacher"),
            StudentCount = e.ClassChannel.Enrollments.Count(en => en.RoleInClass == "Student")
        }).ToList();

        return Ok(myClasses);
    }

    // GET: api/classes/{id}
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetClass(int id)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var currentUserRole = User.FindFirstValue(ClaimTypes.Role) ?? "Student";

        var cls = await _context.ClassChannels
            .Include(c => c.Enrollments)
                .ThenInclude(e => e.ApplicationUser)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (cls == null) return NotFound(new { message = $"Class with ID {id} was not found." });

        // Policy Authorization Enforcement:
        // Admin has full access.
        // Teacher/Staff can only access if assigned as Staff to this class.
        // Student can only access if enrolled in this class.
        if (currentUserRole != "Admin")
        {
            var enrollment = cls.Enrollments.FirstOrDefault(e => e.ApplicationUserId == currentUserId);
            if (enrollment == null)
            {
                return StatusCode(StatusCodes.Status403Forbidden, new
                {
                    message = "Policy Enforcement: Access Denied. You are not assigned/enrolled in this class channel.",
                    classId = id,
                    className = cls.Name,
                    userRole = currentUserRole
                });
            }

            if ((currentUserRole == "Staff" || currentUserRole == "Teacher") &&
                enrollment.RoleInClass != "Staff" && enrollment.RoleInClass != "Teacher")
            {
                return StatusCode(StatusCodes.Status403Forbidden, new
                {
                    message = "Policy Enforcement: Access Denied. You are not assigned as a Teacher/Staff in this class.",
                    classId = id,
                    className = cls.Name
                });
            }
        }

        var staffMembers = cls.Enrollments
            .Where(e => e.RoleInClass == "Staff" || e.RoleInClass == "Teacher")
            .Select(e => new ClassMemberDto
            {
                AccountId = e.ApplicationUserId,
                FullName = e.ApplicationUser?.FullName ?? e.ApplicationUser?.UserName ?? "Staff Member",
                Email = e.ApplicationUser?.Email ?? "",
                Role = "Staff",
                RoleInClass = "Staff",
                AssignedAt = e.JoinedAt
            })
            .ToList();

        var studentMembers = cls.Enrollments
            .Where(e => e.RoleInClass == "Student")
            .Select(e => new ClassMemberDto
            {
                AccountId = e.ApplicationUserId,
                FullName = e.ApplicationUser?.FullName ?? e.ApplicationUser?.UserName ?? "Student",
                Email = e.ApplicationUser?.Email ?? "",
                Role = "Student",
                RoleInClass = "Student",
                AssignedAt = e.JoinedAt
            })
            .ToList();

        return Ok(new ClassWithMembersDto
        {
            Id = cls.Id,
            Name = cls.Name,
            Code = cls.Code,
            Description = cls.Description,
            CreatedAt = cls.CreatedAt,
            Staff = staffMembers,
            Students = studentMembers
        });
    }

    // POST: api/classes
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateClass([FromBody] CreateClassRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return BadRequest(new { message = "Class name is required." });

        var classChannel = new ClassChannel
        {
            Name = request.Name.Trim(),
            Code = request.Code?.Trim(),
            Description = request.Description?.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        _context.ClassChannels.Add(classChannel);
        await _context.SaveChangesAsync();

        return Ok(new ClassChannelDto
        {
            Id = classChannel.Id,
            Name = classChannel.Name,
            Code = classChannel.Code,
            Description = classChannel.Description,
            CreatedAt = classChannel.CreatedAt,
            StaffCount = 0,
            StudentCount = 0
        });
    }

    // PUT: api/classes/{id}
    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateClass(int id, [FromBody] UpdateClassRequest request)
    {
        var cls = await _context.ClassChannels.FindAsync(id);
        if (cls == null) return NotFound(new { message = $"Class with ID {id} was not found." });

        if (!string.IsNullOrWhiteSpace(request.Name))
            cls.Name = request.Name.Trim();

        cls.Code = request.Code?.Trim();
        cls.Description = request.Description?.Trim();

        await _context.SaveChangesAsync();

        var staffCount = await _context.ClassEnrollments.CountAsync(e => e.ClassChannelId == id && (e.RoleInClass == "Staff" || e.RoleInClass == "Teacher"));
        var studentCount = await _context.ClassEnrollments.CountAsync(e => e.ClassChannelId == id && e.RoleInClass == "Student");

        return Ok(new ClassChannelDto
        {
            Id = cls.Id,
            Name = cls.Name,
            Code = cls.Code,
            Description = cls.Description,
            CreatedAt = cls.CreatedAt,
            StaffCount = staffCount,
            StudentCount = studentCount
        });
    }

    // DELETE: api/classes/{id}
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteClass(int id)
    {
        var cls = await _context.ClassChannels.FindAsync(id);
        if (cls == null) return NotFound(new { message = $"Class with ID {id} was not found." });

        _context.ClassChannels.Remove(cls);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // POST: api/classes/{id}/members
    [HttpPost("{id:int}/members")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AssignMember(int id, [FromBody] AssignMemberRequest request)
    {
        var cls = await _context.ClassChannels.FindAsync(id);
        if (cls == null) return NotFound(new { message = $"Class with ID {id} was not found." });

        var user = await _userManager.FindByIdAsync(request.AccountId);
        if (user == null) return NotFound(new { message = "User was not found." });

        // Check if already assigned
        var existing = await _context.ClassEnrollments
            .FirstOrDefaultAsync(e => e.ClassChannelId == id && e.ApplicationUserId == request.AccountId);

        var roleInClass = (request.RoleInClass?.Equals("Staff", StringComparison.OrdinalIgnoreCase) == true ||
                           request.RoleInClass?.Equals("Teacher", StringComparison.OrdinalIgnoreCase) == true)
                          ? "Staff" : "Student";

        if (existing != null)
        {
            // Update role in class if already member
            existing.RoleInClass = roleInClass;
            await _context.SaveChangesAsync();
            return Ok(new { message = "User assignment role updated." });
        }

        var enrollment = new ClassEnrollment
        {
            ClassChannelId = id,
            ApplicationUserId = user.Id,
            RoleInClass = roleInClass,
            JoinedAt = DateTime.UtcNow
        };

        _context.ClassEnrollments.Add(enrollment);
        await _context.SaveChangesAsync();

        return Ok(new { message = $"User {user.FullName ?? user.Email} successfully assigned to {cls.Name}." });
    }

    // DELETE: api/classes/{id}/members/{accountId}
    [HttpDelete("{id:int}/members/{accountId}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> RemoveMember(int id, string accountId)
    {
        var enrollment = await _context.ClassEnrollments
            .FirstOrDefaultAsync(e => e.ClassChannelId == id && e.ApplicationUserId == accountId);

        if (enrollment == null)
            return NotFound(new { message = "Assignment was not found." });

        _context.ClassEnrollments.Remove(enrollment);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // POST: api/classes/check-policy (Policy Simulator helper for demonstration/testing)
    [HttpPost("check-policy")]
    public async Task<IActionResult> CheckPolicy([FromBody] PolicyCheckRequest request)
    {
        var cls = await _context.ClassChannels.FindAsync(request.ClassId);
        if (cls == null)
        {
            return Ok(new PolicyCheckResult
            {
                IsAllowed = false,
                Reason = $"Class ID {request.ClassId} not found.",
                ClassName = "Unknown"
            });
        }

        // Target user can be passed explicitly (for simulation) or falls back to current caller
        var userId = !string.IsNullOrWhiteSpace(request.UserId)
            ? request.UserId
            : User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(userId))
        {
            return Ok(new PolicyCheckResult
            {
                IsAllowed = false,
                Reason = "User not identified.",
                ClassName = cls.Name
            });
        }

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return Ok(new PolicyCheckResult
            {
                IsAllowed = false,
                Reason = "User does not exist in database.",
                ClassName = cls.Name
            });
        }

        var roles = await _userManager.GetRolesAsync(user);
        var userRole = roles.Contains("Admin") ? "Admin"
                     : (roles.Contains("Staff") || roles.Contains("Teacher")) ? "Staff"
                     : "Student";

        // Admin is always allowed
        if (userRole == "Admin")
        {
            return Ok(new PolicyCheckResult
            {
                IsAllowed = true,
                Reason = "Admin role possesses global unrestricted access across all classes.",
                UserRole = "Admin",
                RoleInClass = "Admin",
                ClassName = cls.Name
            });
        }

        // Check enrollment
        var enrollment = await _context.ClassEnrollments
            .FirstOrDefaultAsync(e => e.ClassChannelId == request.ClassId && e.ApplicationUserId == userId);

        if (enrollment == null)
        {
            return Ok(new PolicyCheckResult
            {
                IsAllowed = false,
                Reason = $"❌ Forbidden (403): User '{user.FullName ?? user.Email}' ({userRole}) is NOT assigned/enrolled in class '{cls.Name}'.",
                UserRole = userRole,
                RoleInClass = null,
                ClassName = cls.Name
            });
        }

        if (request.Action == "ManageClass")
        {
            if (enrollment.RoleInClass == "Staff" || enrollment.RoleInClass == "Teacher")
            {
                return Ok(new PolicyCheckResult
                {
                    IsAllowed = true,
                    Reason = $"✅ Allowed: User '{user.FullName ?? user.Email}' is assigned as Teacher/Staff in '{cls.Name}' with ManageClass policy privileges.",
                    UserRole = userRole,
                    RoleInClass = enrollment.RoleInClass,
                    ClassName = cls.Name
                });
            }
            else
            {
                return Ok(new PolicyCheckResult
                {
                    IsAllowed = false,
                    Reason = $"❌ Forbidden (403): User '{user.FullName ?? user.Email}' is enrolled as a Student in '{cls.Name}' and cannot perform ManageClass action.",
                    UserRole = userRole,
                    RoleInClass = enrollment.RoleInClass,
                    ClassName = cls.Name
                });
            }
        }

        // ViewClass action
        return Ok(new PolicyCheckResult
        {
            IsAllowed = true,
            Reason = $"✅ Allowed: User '{user.FullName ?? user.Email}' is enrolled in '{cls.Name}' ({enrollment.RoleInClass}).",
            UserRole = userRole,
            RoleInClass = enrollment.RoleInClass,
            ClassName = cls.Name
        });
    }
}
