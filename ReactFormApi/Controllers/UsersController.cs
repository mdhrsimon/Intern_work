using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReactFormApi.Data;
using ReactFormApi.Models;

namespace ReactFormApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _context;

    public UsersController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/users
    [HttpGet]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _context.Users
            .Include(u => u.Education)
            .ToListAsync();

        return Ok(users);
    }

    // POST: api/users
    [HttpPost]
    public async Task<IActionResult> CreateUser(User user)
    {
        _context.Users.Add(user);

        await _context.SaveChangesAsync();

        return Ok(user);
    }

    // DELETE: api/users
    [HttpDelete]
    public async Task<IActionResult> DeleteUsers()
    {
        var users = await _context.Users
            .Include(u => u.Education)
            .ToListAsync();

        _context.Users.RemoveRange(users);

        await _context.SaveChangesAsync();

        return Ok();
    }
}