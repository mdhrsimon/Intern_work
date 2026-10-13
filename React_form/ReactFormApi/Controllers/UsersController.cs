using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReactFormApi.Constants;
using ReactFormApi.DTOs.Users;
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
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var currentUserRole = User.FindFirstValue(ClaimTypes.Role) ?? RoleConstants.Student;

        var result = await _userService.GetUsersAsync(page, pageSize, currentUserId, currentUserRole);
        return Ok(result);
    }

    // GET: api/users/5
    [HttpGet("{id:int}")]
    [Authorize(Roles = "Staff,Teacher,Admin")]
    public async Task<IActionResult> GetUser(int id)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var currentUserRole = User.FindFirstValue(ClaimTypes.Role) ?? RoleConstants.Student;

        var result = await _userService.GetUserByIdAsync(id, currentUserId, currentUserRole);
        if (!result.Success)
        {
            return StatusCode(result.StatusCode, new { message = result.Message });
        }

        return Ok(result.Data);
    }

    // GET: api/users/me
    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetMySubmission()
    {
        var accountId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(accountId))
        {
            return Unauthorized(new { message = "User not authenticated." });
        }

        var user = await _userService.GetMySubmissionAsync(accountId);
        if (user == null)
        {
            return NotFound(new { message = "No submission found for this account." });
        }

        return Ok(user);
    }

    // PUT: api/users/me
    [HttpPut("me")]
    [Authorize]
    public async Task<IActionResult> UpdateMySubmission([FromBody] UpdateUserRequest request)
    {
        var accountId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(accountId))
        {
            return Unauthorized(new { message = "User not authenticated." });
        }

        var result = await _userService.UpdateMySubmissionAsync(accountId, request);
        if (!result.Success)
        {
            return StatusCode(result.StatusCode, new { message = result.Message });
        }

        return Ok(result.Data);
    }

    // POST: api/users
    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request)
    {
        var accountId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var result = await _userService.CreateUserAsync(request, accountId);
        if (!result.Success)
        {
            return StatusCode(result.StatusCode, new { message = result.Message });
        }

        return Ok(result.Data);
    }

    // PUT: api/users/5
    [HttpPut("{id:int}")]
    [Authorize(Roles = "Staff,Teacher,Admin")]
    public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserRequest request)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var currentUserRole = User.FindFirstValue(ClaimTypes.Role) ?? RoleConstants.Student;

        var result = await _userService.UpdateUserAsync(id, request, currentUserId, currentUserRole);
        if (!result.Success)
        {
            return StatusCode(result.StatusCode, new { message = result.Message });
        }

        return Ok(result.Data);
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