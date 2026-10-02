using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReactFormApi.DTOs.Users;
using ReactFormApi.Models;
using ReactFormApi.Services;

namespace ReactFormApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly UserService _userService;

    public UsersController(UserService userService)
    {
        _userService = userService;
    }

    // GET: api/Users?page=1&pageSize=5
    [HttpGet]
    [Authorize(Roles = "Staff,Teacher,Admin")]
    public async Task<IActionResult> GetUsers(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 5)
    {
        var result = await _userService.GetUsersAsync(page, pageSize);
        return Ok(result);
    }

    // GET: api/users/5
    [HttpGet("{id:int}")]
    [Authorize(Roles = "Staff,Teacher,Admin")]
    public async Task<IActionResult> GetUsers(int id)
    {
        var user = await _userService.GetUserByIdAsync(id);
        if (user == null)
        {
            return NotFound(new { message = $"User with id {id} was not found." });
        }

        return Ok(user);
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

        var user = await _userService.GetMySubmissionAsync(accountId);
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
        var created = await _userService.CreateUserAsync(user, accountId);
        return Ok(created);
    }

    // PUT: api/users/5
    [HttpPut("{id:int}")]
    [Authorize(Roles = "Staff,Teacher,Admin")]
    public async Task<IActionResult> UpdateUser(int id, User updatedUser)
    {
        var updated = await _userService.UpdateUserAsync(id, updatedUser);
        if (updated == null)
        {
            return NotFound(new { message = $"User with id {id} was not found." });
        }

        return Ok(updated);
    }

    // DELETE: api/users
    [HttpDelete]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteUsers()
    {
        await _userService.DeleteAllUsersAsync();
        return Ok();
    }

    // DELETE: api/Users/5
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var deleted = await _userService.DeleteUserByIdAsync(id);
        if (!deleted)
        {
            return NotFound(new { message = $"User with id {id} was not found." });
        }

        return NoContent();
    }
}