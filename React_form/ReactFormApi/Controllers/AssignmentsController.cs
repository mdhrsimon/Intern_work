using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReactFormApi.DTOs.Assignments;
using ReactFormApi.Services;

namespace ReactFormApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AssignmentsController : ControllerBase
{
    private readonly AssignmentService _assignmentService;

    public AssignmentsController(AssignmentService assignmentService)
    {
        _assignmentService = assignmentService;
    }

    // GET: api/assignments/class/{classId}
    [HttpGet("class/{classId:int}")]
    public async Task<IActionResult> GetAssignmentsByClass(int classId)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var currentUserRole = User.FindFirstValue(ClaimTypes.Role) ?? "Student";

        var result = await _assignmentService.GetAssignmentsByClassAsync(classId, currentUserId, currentUserRole);
        if (!result.Success)
            return StatusCode(result.StatusCode, new { message = result.Message });

        return Ok(result.Data);
    }

    // POST: api/assignments
    [HttpPost]
    public async Task<IActionResult> CreateAssignment([FromBody] CreateAssignmentRequest request)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var currentUserRole = User.FindFirstValue(ClaimTypes.Role) ?? "Student";

        var result = await _assignmentService.CreateAssignmentAsync(request, currentUserId, currentUserRole);
        if (!result.Success)
            return StatusCode(result.StatusCode, new { message = result.Message });

        return Ok(result.Data);
    }

    // PUT: api/assignments/{id}
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateAssignment(int id, [FromBody] UpdateAssignmentRequest request)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var currentUserRole = User.FindFirstValue(ClaimTypes.Role) ?? "Student";

        var result = await _assignmentService.UpdateAssignmentAsync(id, request, currentUserId, currentUserRole);
        if (!result.Success)
            return StatusCode(result.StatusCode, new { message = result.Message });

        return Ok(result.Data);
    }

    // DELETE: api/assignments/{id}
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteAssignment(int id)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var currentUserRole = User.FindFirstValue(ClaimTypes.Role) ?? "Student";

        var result = await _assignmentService.DeleteAssignmentAsync(id, currentUserId, currentUserRole);
        if (!result.Success)
            return StatusCode(result.StatusCode, new { message = result.Message });

        return NoContent();
    }

    // POST: api/assignments/{id}/submit
    [HttpPost("{id:int}/submit")]
    public async Task<IActionResult> SubmitAssignment(int id, [FromBody] SubmitAssignmentRequest request)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var currentUserRole = User.FindFirstValue(ClaimTypes.Role) ?? "Student";

        var result = await _assignmentService.SubmitAssignmentAsync(id, request, currentUserId, currentUserRole);
        if (!result.Success)
            return StatusCode(result.StatusCode, new { message = result.Message });

        return Ok(result.Data);
    }

    // GET: api/assignments/{id}/submissions
    [HttpGet("{id:int}/submissions")]
    public async Task<IActionResult> GetSubmissions(int id)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var currentUserRole = User.FindFirstValue(ClaimTypes.Role) ?? "Student";

        var result = await _assignmentService.GetSubmissionsAsync(id, currentUserId, currentUserRole);
        if (!result.Success)
            return StatusCode(result.StatusCode, new { message = result.Message });

        return Ok(result.Data);
    }

    // PUT: api/assignments/{id}/submissions/{subId}/return
    [HttpPut("{id:int}/submissions/{subId:int}/return")]
    public async Task<IActionResult> ReturnSubmission(int id, int subId, [FromBody] ReturnSubmissionRequest request)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var currentUserRole = User.FindFirstValue(ClaimTypes.Role) ?? "Student";

        var result = await _assignmentService.ReturnSubmissionAsync(id, subId, request, currentUserId, currentUserRole);
        if (!result.Success)
            return StatusCode(result.StatusCode, new { message = result.Message });

        return Ok(result.Data);
    }
}
