using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ReactFormApi.DTOs.Assignments;
using ReactFormApi.Services;

namespace ReactFormApi.Controllers;

[ApiController]
[Route("api/assignments")]
[Authorize]
public class AssignmentFilesController : ControllerBase
{
    private readonly AssignmentFileService _fileService;

    public AssignmentFilesController(AssignmentFileService fileService)
    {
        _fileService = fileService;
    }

    // ================== TEACHER ASSIGNMENT ATTACHMENTS ==================

    [HttpPost("{id:int}/attachments")]
    public async Task<IActionResult> UploadAssignmentAttachment(int id, IFormFile file)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var currentUserRole = User.FindFirstValue(ClaimTypes.Role) ?? "Student";

        var result = await _fileService.UploadAttachmentAsync(id, file, currentUserId, currentUserRole);
        if (!result.Success)
            return StatusCode(result.StatusCode, new { message = result.Message });

        return Ok(result.Data);
    }

    [HttpDelete("{id:int}/attachments/{fileId:int}")]
    public async Task<IActionResult> DeleteAssignmentAttachment(int id, int fileId)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var currentUserRole = User.FindFirstValue(ClaimTypes.Role) ?? "Student";

        var result = await _fileService.DeleteAttachmentAsync(id, fileId, currentUserId, currentUserRole);
        if (!result.Success)
            return StatusCode(result.StatusCode, new { message = result.Message });

        return NoContent();
    }

    [HttpGet("{id:int}/attachments/{fileId:int}/download")]
    public async Task<IActionResult> DownloadAssignmentAttachment(int id, int fileId)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var currentUserRole = User.FindFirstValue(ClaimTypes.Role) ?? "Student";

        var result = await _fileService.GetAttachmentDownloadAsync(id, fileId, currentUserId, currentUserRole);
        if (!result.Success)
            return StatusCode(result.StatusCode, new { message = result.Message });

        return PhysicalFile(result.FilePath, result.ContentType, result.FileName);
    }

    // ================== STUDENT SUBMISSION FILES ==================

    [HttpPost("{id:int}/submissions/files")]
    public async Task<IActionResult> UploadSubmissionFile(int id, IFormFile file)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var currentUserRole = User.FindFirstValue(ClaimTypes.Role) ?? "Student";

        var result = await _fileService.UploadSubmissionFileAsync(id, file, currentUserId, currentUserRole);
        if (!result.Success)
            return StatusCode(result.StatusCode, new { message = result.Message });

        return Ok(result.Data);
    }

    [HttpDelete("{id:int}/submissions/files/{fileId:int}")]
    public async Task<IActionResult> DeleteSubmissionFile(int id, int fileId)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        var result = await _fileService.DeleteSubmissionFileAsync(id, fileId, currentUserId);
        if (!result.Success)
            return StatusCode(result.StatusCode, new { message = result.Message });

        return NoContent();
    }

    [HttpGet("{id:int}/submissions/{subId:int}/files/{fileId:int}/download")]
    public async Task<IActionResult> DownloadSubmissionFile(int id, int subId, int fileId)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var currentUserRole = User.FindFirstValue(ClaimTypes.Role) ?? "Student";

        var result = await _fileService.GetSubmissionFileDownloadAsync(id, subId, fileId, currentUserId, currentUserRole);
        if (!result.Success)
            return StatusCode(result.StatusCode, new { message = result.Message });

        return PhysicalFile(result.FilePath, result.ContentType, result.FileName);
    }
}
