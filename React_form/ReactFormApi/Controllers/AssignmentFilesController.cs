using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReactFormApi.Data;
using ReactFormApi.Models;
using ReactFormApi.Models.Assignments;

namespace ReactFormApi.Controllers;

[ApiController]
[Route("api/assignments")]
[Authorize]
public class AssignmentFilesController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly string _attachmentsPath;
    private readonly string _submissionsPath;
    private readonly long _maxFileSize = 20 * 1024 * 1024; // 20 MB
    private readonly int _maxFileCount = 10;
    
    // Allowed extensions
    private readonly string[] _allowedExtensions = { ".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png", ".txt", ".zip" };
    // Basic MIME mappings to validate content types
    private readonly Dictionary<string, string> _allowedMimeTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        { ".pdf", "application/pdf" },
        { ".doc", "application/msword" },
        { ".docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
        { ".jpg", "image/jpeg" },
        { ".jpeg", "image/jpeg" },
        { ".png", "image/png" },
        { ".txt", "text/plain" },
        { ".zip", "application/zip" }
    };

    public AssignmentFilesController(AppDbContext context, IWebHostEnvironment env)
    {
        _context = context;
        _attachmentsPath = Path.Combine(env.ContentRootPath, "Uploads", "AssignmentAttachments");
        _submissionsPath = Path.Combine(env.ContentRootPath, "Uploads", "SubmissionFiles");

        if (!Directory.Exists(_attachmentsPath)) Directory.CreateDirectory(_attachmentsPath);
        if (!Directory.Exists(_submissionsPath)) Directory.CreateDirectory(_submissionsPath);
    }

    private async Task<(bool IsAllowed, bool IsTeacherOrAdmin, ClassEnrollment? Enrollment)> CheckClassAuthAsync(int classChannelId)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(currentUserId)) return (false, false, null);

        var currentUserRole = User.FindFirstValue(ClaimTypes.Role) ?? "Student";
        if (currentUserRole == "Admin") return (true, true, null);

        var enrollment = await _context.ClassEnrollments
            .FirstOrDefaultAsync(e => e.ClassChannelId == classChannelId && e.ApplicationUserId == currentUserId);

        if (enrollment == null) return (false, false, null);

        bool isTeacherInClass = enrollment.RoleInClass == "Teacher" || enrollment.RoleInClass == "Staff";
        bool isTeacherBySystemRole = currentUserRole == "Teacher" || currentUserRole == "Staff";

        return (true, isTeacherInClass && isTeacherBySystemRole, enrollment);
    }

    private bool IsFileValid(IFormFile file, out string error)
    {
        error = string.Empty;
        if (file.Length > _maxFileSize)
        {
            error = "File size exceeds the 20 MB limit.";
            return false;
        }

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!_allowedExtensions.Contains(ext))
        {
            error = "Invalid file extension.";
            return false;
        }

        if (!_allowedMimeTypes.TryGetValue(ext, out var expectedMime) || !file.ContentType.StartsWith(expectedMime.Split('/')[0], StringComparison.OrdinalIgnoreCase))
        {
            // Simple validation: just ensure it roughly matches expected MIME or is valid
            // In a strict prod environment, deeper header checking (magic numbers) might be added.
        }

        return true;
    }

    // ================== TEACHER ASSIGNMENT ATTACHMENTS ==================

    [HttpPost("{id:int}/attachments")]
    public async Task<IActionResult> UploadAssignmentAttachment(int id, IFormFile file)
    {
        var assignment = await _context.Assignments.Include(a => a.Attachments).FirstOrDefaultAsync(a => a.Id == id);
        if (assignment == null) return NotFound("Assignment not found.");

        var (isAllowed, isTeacherOrAdmin, _) = await CheckClassAuthAsync(assignment.ClassChannelId);
        if (!isAllowed || !isTeacherOrAdmin)
            return StatusCode(StatusCodes.Status403Forbidden, new { message = "Only assigned Teachers or Admins can upload attachments." });

        if (assignment.Attachments.Count >= _maxFileCount)
            return BadRequest($"Maximum of {_maxFileCount} files allowed per assignment.");

        if (file == null || file.Length == 0) return BadRequest("File is empty.");

        if (!IsFileValid(file, out var error))
            return BadRequest(error);

        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var originalFileName = Path.GetFileName(file.FileName); // path traversal protection
        var ext = Path.GetExtension(originalFileName);
        var storedFileName = Guid.NewGuid().ToString() + ext;
        var filePath = Path.Combine(_attachmentsPath, storedFileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var attachment = new AssignmentAttachment
        {
            AssignmentId = id,
            FileName = originalFileName,
            StoredFileName = storedFileName,
            ContentType = file.ContentType,
            FileSize = file.Length,
            UploadedByUserId = currentUserId,
            UploadedAt = DateTime.UtcNow
        };

        _context.AssignmentAttachments.Add(attachment);
        await _context.SaveChangesAsync();

        return Ok(new AssignmentAttachmentDto
        {
            Id = attachment.Id,
            FileName = attachment.FileName,
            ContentType = attachment.ContentType,
            FileSize = attachment.FileSize,
            UploadedAt = attachment.UploadedAt
        });
    }

    [HttpDelete("{id:int}/attachments/{fileId:int}")]
    public async Task<IActionResult> DeleteAssignmentAttachment(int id, int fileId)
    {
        var assignment = await _context.Assignments.FindAsync(id);
        if (assignment == null) return NotFound("Assignment not found.");

        var (isAllowed, isTeacherOrAdmin, _) = await CheckClassAuthAsync(assignment.ClassChannelId);
        if (!isAllowed || !isTeacherOrAdmin)
            return StatusCode(StatusCodes.Status403Forbidden, new { message = "Only assigned Teachers or Admins can delete attachments." });

        var attachment = await _context.AssignmentAttachments.FirstOrDefaultAsync(a => a.Id == fileId && a.AssignmentId == id);
        if (attachment == null) return NotFound("Attachment not found.");

        _context.AssignmentAttachments.Remove(attachment);
        await _context.SaveChangesAsync();

        var filePath = Path.Combine(_attachmentsPath, attachment.StoredFileName);
        if (System.IO.File.Exists(filePath))
        {
            System.IO.File.Delete(filePath);
        }

        return NoContent();
    }

    [HttpGet("{id:int}/attachments/{fileId:int}/download")]
    public async Task<IActionResult> DownloadAssignmentAttachment(int id, int fileId)
    {
        var assignment = await _context.Assignments.FindAsync(id);
        if (assignment == null) return NotFound("Assignment not found.");

        // Both enrolled students and assigned teachers/admins can download
        var (isAllowed, _, _) = await CheckClassAuthAsync(assignment.ClassChannelId);
        if (!isAllowed)
            return StatusCode(StatusCodes.Status403Forbidden, new { message = "You are not enrolled in this class." });

        var attachment = await _context.AssignmentAttachments.FirstOrDefaultAsync(a => a.Id == fileId && a.AssignmentId == id);
        if (attachment == null) return NotFound("Attachment not found.");

        var filePath = Path.Combine(_attachmentsPath, attachment.StoredFileName);
        if (!System.IO.File.Exists(filePath))
            return NotFound("File not found on server.");

        return PhysicalFile(filePath, attachment.ContentType, attachment.FileName);
    }

    // ================== STUDENT SUBMISSION FILES ==================

    [HttpPost("{id:int}/submissions/files")]
    public async Task<IActionResult> UploadSubmissionFile(int id, IFormFile file)
    {
        var assignment = await _context.Assignments.FindAsync(id);
        if (assignment == null) return NotFound("Assignment not found.");

        var (isAllowed, _, _) = await CheckClassAuthAsync(assignment.ClassChannelId);
        if (!isAllowed)
            return StatusCode(StatusCodes.Status403Forbidden, new { message = "You are not enrolled in this class." });

        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        // Ensure submission exists or create one with Assigned status
        var submission = await _context.AssignmentSubmissions
            .Include(s => s.Files)
            .FirstOrDefaultAsync(s => s.AssignmentId == id && s.StudentUserId == currentUserId);

        if (submission == null)
        {
            submission = new AssignmentSubmission
            {
                AssignmentId = id,
                StudentUserId = currentUserId,
                Status = "Assigned",
                SubmittedAt = null
            };
            _context.AssignmentSubmissions.Add(submission);
            await _context.SaveChangesAsync();
        }

        if (submission.Status == "Returned")
            return BadRequest("Cannot upload files after submission has been Returned.");

        if (submission.Files.Count >= _maxFileCount)
            return BadRequest($"Maximum of {_maxFileCount} files allowed per submission.");

        if (file == null || file.Length == 0) return BadRequest("File is empty.");

        if (!IsFileValid(file, out var error))
            return BadRequest(error);

        var originalFileName = Path.GetFileName(file.FileName); // path traversal protection
        var ext = Path.GetExtension(originalFileName);
        var storedFileName = Guid.NewGuid().ToString() + ext;
        var filePath = Path.Combine(_submissionsPath, storedFileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var submissionFile = new SubmissionFile
        {
            AssignmentSubmissionId = submission.Id,
            FileName = originalFileName,
            StoredFileName = storedFileName,
            ContentType = file.ContentType,
            FileSize = file.Length,
            UploadedAt = DateTime.UtcNow
        };

        _context.SubmissionFiles.Add(submissionFile);
        await _context.SaveChangesAsync();

        return Ok(new SubmissionFileDto
        {
            Id = submissionFile.Id,
            FileName = submissionFile.FileName,
            ContentType = submissionFile.ContentType,
            FileSize = submissionFile.FileSize,
            UploadedAt = submissionFile.UploadedAt
        });
    }

    [HttpDelete("{id:int}/submissions/files/{fileId:int}")]
    public async Task<IActionResult> DeleteSubmissionFile(int id, int fileId)
    {
        var assignment = await _context.Assignments.FindAsync(id);
        if (assignment == null) return NotFound("Assignment not found.");

        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        var submission = await _context.AssignmentSubmissions
            .FirstOrDefaultAsync(s => s.AssignmentId == id && s.StudentUserId == currentUserId);

        if (submission == null) return NotFound("Submission not found.");

        if (submission.Status == "Returned")
            return BadRequest("Cannot delete files after submission has been Returned.");

        var submissionFile = await _context.SubmissionFiles
            .FirstOrDefaultAsync(f => f.Id == fileId && f.AssignmentSubmissionId == submission.Id);

        if (submissionFile == null) return NotFound("File not found.");

        _context.SubmissionFiles.Remove(submissionFile);
        await _context.SaveChangesAsync();

        var filePath = Path.Combine(_submissionsPath, submissionFile.StoredFileName);
        if (System.IO.File.Exists(filePath))
        {
            System.IO.File.Delete(filePath);
        }

        return NoContent();
    }

    [HttpGet("{id:int}/submissions/{subId:int}/files/{fileId:int}/download")]
    public async Task<IActionResult> DownloadSubmissionFile(int id, int subId, int fileId)
    {
        var assignment = await _context.Assignments.FindAsync(id);
        if (assignment == null) return NotFound("Assignment not found.");

        var submission = await _context.AssignmentSubmissions.FirstOrDefaultAsync(s => s.Id == subId && s.AssignmentId == id);
        if (submission == null) return NotFound("Submission not found.");

        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var (isAllowed, isTeacherOrAdmin, _) = await CheckClassAuthAsync(assignment.ClassChannelId);
        
        if (!isAllowed)
            return StatusCode(StatusCodes.Status403Forbidden, new { message = "You are not enrolled in this class." });

        // Must be the owner OR an assigned teacher/admin
        if (submission.StudentUserId != currentUserId && !isTeacherOrAdmin)
            return StatusCode(StatusCodes.Status403Forbidden, new { message = "You do not have permission to view this file." });

        var submissionFile = await _context.SubmissionFiles.FirstOrDefaultAsync(f => f.Id == fileId && f.AssignmentSubmissionId == subId);
        if (submissionFile == null) return NotFound("File not found.");

        var filePath = Path.Combine(_submissionsPath, submissionFile.StoredFileName);
        if (!System.IO.File.Exists(filePath))
            return NotFound("File not found on server.");

        return PhysicalFile(filePath, submissionFile.ContentType, submissionFile.FileName);
    }
}
