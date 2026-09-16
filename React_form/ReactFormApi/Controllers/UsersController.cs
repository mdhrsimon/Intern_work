using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReactFormApi.Data;
using ReactFormApi.Models;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace ReactFormApi.Controllers;

public class PagedUsersResult
{
    public List<User> Items { get; set; } = new();
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
    public int TotalPages { get; set; }
    public bool HasMore { get; set; }
}

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _context;

    public UsersController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/Users?page=1&pageSize=5
    [HttpGet]
    [Authorize(Roles = "Staff,Teacher,Admin")]
    public async Task<IActionResult> GetUsers(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 5)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 5;
        if (pageSize > 50) pageSize = 50; // safety cap

        var query = _context.Users
            .Include(u => u.Education)
            .OrderByDescending(u => u.Id); // newest first

        var totalCount = await query.CountAsync();
        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var result = new PagedUsersResult
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = totalPages,
            HasMore = page < totalPages
        };

        return Ok(result);
    }
    // GET: api/users/5
    [HttpGet("{id:int}")]
    [Authorize(Roles = "Staff,Teacher,Admin")]
    public async Task<IActionResult> GetUsers(int id)
    {
        var users = await _context.Users
            .Include(u => u.Education)
            .FirstOrDefaultAsync(u => u.Id == id);
        if (users == null)
        {
            return NotFound(new { message = $"User with id {id} was not found." });
        }
            

        return Ok(users);
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetMySubmission()
    {
        var accountId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(accountId))
        {
            return Unauthorized();
        }

        var user = await _context.Users
            .Include(u => u.Education)
            .FirstOrDefaultAsync(u => u.ApplicationUserId == accountId);

        if (user == null)
        {
            return NotFound(new { message = "No submission found for this account." });
        }

        return Ok(user);
    }

    // POST: api/users
    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreateUser(User user)
    {
        var accountId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        user.ApplicationUserId = accountId;

        // optional: one form per account
        // var exists = await _context.Users.AnyAsync(u => u.ApplicationUserId == accountId);
        // if (exists) return BadRequest(...);

        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return Ok(user);
    }
    // PUT: api/users/5
    [HttpPut("{id:int}")]
    [Authorize(Roles = "Staff,Teacher,Admin")]
    public async Task<IActionResult> UpdateUser(int id, User updatedUser)
    {
        var user = await _context.Users
            .Include(u => u.Education)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null)
        {
            return NotFound(new { message = $"User with id {id} was not found." });
        }

        // Update basic fields
        user.FullName = updatedUser.FullName;
        user.Email = updatedUser.Email;
        user.Phone = updatedUser.Phone;
        user.DateOfBirth = updatedUser.DateOfBirth;
        user.Address = updatedUser.Address;
        user.Gender = updatedUser.Gender;

        // Replace education list
        if (user.Education != null && user.Education.Count > 0)
        {
            _context.Educations.RemoveRange(user.Education);
        }

        user.Education = updatedUser.Education ?? new List<Education>();

        await _context.SaveChangesAsync();

        return Ok(user);
    }

    // DELETE: api/users
    [HttpDelete]
    [Authorize(Roles ="Admin")]
    public async Task<IActionResult> DeleteUsers()
    {
        var users = await _context.Users
            .Include(u => u.Education)
            .ToListAsync();

        _context.Users.RemoveRange(users);

        await _context.SaveChangesAsync();

        return Ok();
    }
    // DELETE: api/Users/5
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var user = await _context.Users
            .Include(u => u.Education)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null)
        {
            return NotFound(new { message = $"User with id {id} was not found." });
        }

        // Remove education rows first (avoids FK errors later)
        if (user.Education != null && user.Education.Count > 0)
        {
            _context.Educations.RemoveRange(user.Education);
        }

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();

        return NoContent(); // 204
    }
}