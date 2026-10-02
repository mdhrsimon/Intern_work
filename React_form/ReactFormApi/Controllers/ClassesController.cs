using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReactFormApi.Authorization;
using ReactFormApi.DTOs.Classes;
using ReactFormApi.Services;

namespace ReactFormApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ClassesController : ControllerBase
{
    private readonly ClassService _classService;
    private readonly ClassAuthorizationService _authorizationService;

    public ClassesController(
        ClassService classService,
        ClassAuthorizationService authorizationService)
    {
        _classService = classService;
        _authorizationService = authorizationService;
    }

    // GET: api/classes?page=1&pageSize=20&search=
    [HttpGet]
    public async Task<IActionResult> GetClasses(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null)
    {
        var result = await _classService.GetClassesAsync(page, pageSize, search);
        return Ok(result);
    }

    // GET: api/classes/my-classes
    [HttpGet("my-classes")]
    public async Task<IActionResult> GetMyClasses()
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(currentUserId)) return Unauthorized();

        var result = await _classService.GetMyClassesAsync(currentUserId);
        return Ok(result);
    }

    // GET: api/classes/{id}
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetClass(int id)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var currentUserRole = User.FindFirstValue(ClaimTypes.Role) ?? "Student";

        var result = await _classService.GetClassByIdAsync(id, currentUserId, currentUserRole);
        if (!result.Success)
        {
            return result.StatusCode == 404
                ? NotFound(new { message = result.Message })
                : StatusCode(result.StatusCode, result.ErrorDetails ?? new { message = result.Message });
        }

        return Ok(result.ClassDetails);
    }

    // POST: api/classes
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateClass([FromBody] CreateClassRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return BadRequest(new { message = "Class name is required." });

        var created = await _classService.CreateClassAsync(request);
        return Ok(created);
    }

    // PUT: api/classes/{id}
    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateClass(int id, [FromBody] UpdateClassRequest request)
    {
        var updated = await _classService.UpdateClassAsync(id, request);
        if (updated == null)
            return NotFound(new { message = $"Class with ID {id} was not found." });

        return Ok(updated);
    }

    // DELETE: api/classes/{id}
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteClass(int id)
    {
        var deleted = await _classService.DeleteClassAsync(id);
        if (!deleted)
            return NotFound(new { message = $"Class with ID {id} was not found." });

        return NoContent();
    }

    // POST: api/classes/{id}/members
    [HttpPost("{id:int}/members")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AssignMember(int id, [FromBody] AssignMemberRequest request)
    {
        var result = await _classService.AssignMemberAsync(id, request);
        if (!result.Success)
            return StatusCode(result.StatusCode, new { message = result.Message });

        return Ok(new { message = result.Message });
    }

    // DELETE: api/classes/{id}/members/{accountId}
    [HttpDelete("{id:int}/members/{accountId}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> RemoveMember(int id, string accountId)
    {
        var removed = await _classService.RemoveMemberAsync(id, accountId);
        if (!removed)
            return NotFound(new { message = "Assignment was not found." });

        return NoContent();
    }

    // POST: api/classes/check-policy (Policy Simulator helper for demonstration/testing)
    [HttpPost("check-policy")]
    public async Task<IActionResult> CheckPolicy([FromBody] PolicyCheckRequest request)
    {
        var fallbackUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var result = await _authorizationService.EvaluatePolicyAsync(request, fallbackUserId);
        return Ok(result);
    }
}
