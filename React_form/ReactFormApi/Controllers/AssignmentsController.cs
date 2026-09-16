using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReactFormApi.Data;
using ReactFormApi.Models;
using ReactFormApi.Models.Assignments;

namespace ReactFormApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AssignmentsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;

    public AssignmentsController(AppDbContext context, UserManager<ApplicationUser> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    // Helper: Check authorization for a class
    // Returns (isAllowed, isTeacherOrAdmin, enrollment)
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

    // GET: api/assignments/class/{classId}
    [HttpGet("class/{classId:int}")]
    public async Task<IActionResult> GetAssignmentsByClass(int classId)
    {
        var (isAllowed, isTeacherOrAdmin, _) = await CheckClassAuthAsync(classId);
        if (!isAllowed)
            return StatusCode(StatusCodes.Status403Forbidden, new { message = "You are not enrolled or assigned to this class." });

        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var assignments = await _context.Assignments
            .Include(a => a.Attachments)
            .Include(a => a.CreatedBy)
            .Include(a => a.Submissions)
                .ThenInclude(s => s.Student)
            .Include(a => a.Submissions)
                .ThenInclude(s => s.Files)
            .Where(a => a.ClassChannelId == classId)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();

        var dtos = assignments.Select(a =>
        {
            var mySub = a.Submissions.FirstOrDefault(s => s.StudentUserId == currentUserId);

            return new AssignmentDto
            {
                Id = a.Id,
                ClassChannelId = a.ClassChannelId,
                Title = a.Title,
                Description = a.Description,
                DueDate = a.DueDate,
                CreatedByUserId = a.CreatedByUserId,
                CreatedByName = a.CreatedBy?.FullName ?? a.CreatedBy?.UserName ?? "Teacher",
                CreatedAt = a.CreatedAt,
                TotalSubmissions = a.Submissions.Count,
                TurnedInCount = a.Submissions.Count(s => s.Status == "Turned In"),
                ReturnedCount = a.Submissions.Count(s => s.Status == "Returned"),
                Attachments = a.Attachments.Select(att => new AssignmentAttachmentDto
                {
                    Id = att.Id,
                    FileName = att.FileName,
                    ContentType = att.ContentType,
                    FileSize = att.FileSize,
                    UploadedAt = att.UploadedAt
                }).ToList(),
                MySubmission = mySub == null ? null : new AssignmentSubmissionDto
                {
                    Id = mySub.Id,
                    AssignmentId = mySub.AssignmentId,
                    StudentUserId = mySub.StudentUserId,
                    StudentName = mySub.Student?.FullName ?? mySub.Student?.UserName ?? "Student",
                    StudentEmail = mySub.Student?.Email ?? "",
                    SubmittedText = mySub.SubmittedText,
                    Status = mySub.Status,
                    Grade = mySub.Grade,
                    Feedback = mySub.Feedback,
                    SubmittedAt = mySub.SubmittedAt,
                    ReturnedAt = mySub.ReturnedAt,
                    Files = mySub.Files.Select(f => new SubmissionFileDto
                    {
                        Id = f.Id,
                        FileName = f.FileName,
                        ContentType = f.ContentType,
                        FileSize = f.FileSize,
                        UploadedAt = f.UploadedAt
                    }).ToList()
                }
            };
        }).ToList();

        return Ok(dtos);
    }

    // POST: api/assignments
    [HttpPost]
    public async Task<IActionResult> CreateAssignment([FromBody] CreateAssignmentRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Title))
            return BadRequest(new { message = "Assignment title is required." });

        var (isAllowed, isTeacherOrAdmin, _) = await CheckClassAuthAsync(request.ClassChannelId);
        if (!isAllowed || !isTeacherOrAdmin)
            return StatusCode(StatusCodes.Status403Forbidden, new { message = "Only assigned Teachers or Admins can create assignments for this class." });

        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        var assignment = new Assignment
        {
            ClassChannelId = request.ClassChannelId,
            Title = request.Title.Trim(),
            Description = request.Description?.Trim(),
            DueDate = request.DueDate,
            CreatedByUserId = currentUserId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Assignments.Add(assignment);
        await _context.SaveChangesAsync();

        var teacher = await _userManager.FindByIdAsync(currentUserId);

        return Ok(new AssignmentDto
        {
            Id = assignment.Id,
            ClassChannelId = assignment.ClassChannelId,
            Title = assignment.Title,
            Description = assignment.Description,
            DueDate = assignment.DueDate,
            CreatedByUserId = assignment.CreatedByUserId,
            CreatedByName = teacher?.FullName ?? teacher?.UserName ?? "Teacher",
            CreatedAt = assignment.CreatedAt,
            TotalSubmissions = 0,
            TurnedInCount = 0,
            ReturnedCount = 0
        });
    }

    // PUT: api/assignments/{id}
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateAssignment(int id, [FromBody] UpdateAssignmentRequest request)
    {
        var assignment = await _context.Assignments.FindAsync(id);
        if (assignment == null)
            return NotFound(new { message = $"Assignment with ID {id} was not found." });

        var (isAllowed, isTeacherOrAdmin, _) = await CheckClassAuthAsync(assignment.ClassChannelId);
        if (!isAllowed || !isTeacherOrAdmin)
            return StatusCode(StatusCodes.Status403Forbidden, new { message = "Only assigned Teachers or Admins can update assignments for this class." });

        if (!string.IsNullOrWhiteSpace(request.Title))
            assignment.Title = request.Title.Trim();

        assignment.Description = request.Description?.Trim();
        assignment.DueDate = request.DueDate;

        await _context.SaveChangesAsync();

        return Ok(new { message = "Assignment updated successfully.", assignmentId = id });
    }

    // DELETE: api/assignments/{id}
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteAssignment(int id)
    {
        var assignment = await _context.Assignments.FindAsync(id);
        if (assignment == null)
            return NotFound(new { message = $"Assignment with ID {id} was not found." });

        var (isAllowed, isTeacherOrAdmin, _) = await CheckClassAuthAsync(assignment.ClassChannelId);
        if (!isAllowed || !isTeacherOrAdmin)
            return StatusCode(StatusCodes.Status403Forbidden, new { message = "Only assigned Teachers or Admins can delete assignments for this class." });

        _context.Assignments.Remove(assignment);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // POST: api/assignments/{id}/submit
    [HttpPost("{id:int}/submit")]
    public async Task<IActionResult> SubmitAssignment(int id, [FromBody] SubmitAssignmentRequest request)
    {
        var assignment = await _context.Assignments.FindAsync(id);
        if (assignment == null)
            return NotFound(new { message = $"Assignment with ID {id} was not found." });

        var (isAllowed, _, _) = await CheckClassAuthAsync(assignment.ClassChannelId);
        if (!isAllowed)
            return StatusCode(StatusCodes.Status403Forbidden, new { message = "You are not enrolled in this class." });

        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        var submission = await _context.AssignmentSubmissions
            .FirstOrDefaultAsync(s => s.AssignmentId == id && s.StudentUserId == currentUserId);

        if (submission == null)
        {
            submission = new AssignmentSubmission
            {
                AssignmentId = id,
                StudentUserId = currentUserId,
                SubmittedText = request.SubmittedText?.Trim(),
                Status = "Turned In",
                SubmittedAt = DateTime.UtcNow
            };
            _context.AssignmentSubmissions.Add(submission);
        }
        else
        {
            submission.SubmittedText = request.SubmittedText?.Trim();
            submission.Status = "Turned In";
            submission.SubmittedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        var student = await _userManager.FindByIdAsync(currentUserId);

        return Ok(new AssignmentSubmissionDto
        {
            Id = submission.Id,
            AssignmentId = submission.AssignmentId,
            StudentUserId = submission.StudentUserId,
            StudentName = student?.FullName ?? student?.UserName ?? "Student",
            StudentEmail = student?.Email ?? "",
            SubmittedText = submission.SubmittedText,
            Status = submission.Status,
            Grade = submission.Grade,
            Feedback = submission.Feedback,
            SubmittedAt = submission.SubmittedAt,
            ReturnedAt = submission.ReturnedAt
        });
    }

    // GET: api/assignments/{id}/submissions
    [HttpGet("{id:int}/submissions")]
    public async Task<IActionResult> GetSubmissions(int id)
    {
        var assignment = await _context.Assignments.FindAsync(id);
        if (assignment == null)
            return NotFound(new { message = $"Assignment with ID {id} was not found." });

        var (isAllowed, isTeacherOrAdmin, _) = await CheckClassAuthAsync(assignment.ClassChannelId);
        if (!isAllowed || !isTeacherOrAdmin)
            return StatusCode(StatusCodes.Status403Forbidden, new { message = "Only assigned Teachers or Admins can view submissions." });

        // Get enrolled students in this class
        var enrolledStudents = await _context.ClassEnrollments
            .Include(e => e.ApplicationUser)
            .Where(e => e.ClassChannelId == assignment.ClassChannelId && e.RoleInClass == "Student")
            .ToListAsync();

        var submissions = await _context.AssignmentSubmissions
            .Include(s => s.Student)
            .Include(s => s.Files)
            .Where(s => s.AssignmentId == id)
            .ToListAsync();

        var submissionDict = submissions.ToDictionary(s => s.StudentUserId);

        var list = new List<AssignmentSubmissionDto>();

        foreach (var e in enrolledStudents)
        {
            if (e.ApplicationUser == null) continue;

            if (submissionDict.TryGetValue(e.ApplicationUserId, out var sub))
            {
                list.Add(new AssignmentSubmissionDto
                {
                    Id = sub.Id,
                    AssignmentId = sub.AssignmentId,
                    StudentUserId = sub.StudentUserId,
                    StudentName = e.ApplicationUser.FullName ?? e.ApplicationUser.UserName ?? "Student",
                    StudentEmail = e.ApplicationUser.Email ?? "",
                    SubmittedText = sub.SubmittedText,
                    Status = sub.Status,
                    Grade = sub.Grade,
                    Feedback = sub.Feedback,
                    SubmittedAt = sub.SubmittedAt,
                    ReturnedAt = sub.ReturnedAt,
                    Files = sub.Files.Select(f => new SubmissionFileDto
                    {
                        Id = f.Id,
                        FileName = f.FileName,
                        ContentType = f.ContentType,
                        FileSize = f.FileSize,
                        UploadedAt = f.UploadedAt
                    }).ToList()
                });
            }
            else
            {
                // Not submitted yet -> default "Assigned"
                list.Add(new AssignmentSubmissionDto
                {
                    Id = 0,
                    AssignmentId = id,
                    StudentUserId = e.ApplicationUserId,
                    StudentName = e.ApplicationUser.FullName ?? e.ApplicationUser.UserName ?? "Student",
                    StudentEmail = e.ApplicationUser.Email ?? "",
                    SubmittedText = null,
                    Status = "Assigned",
                    Grade = null,
                    Feedback = null,
                    SubmittedAt = null,
                    ReturnedAt = null
                });
            }
        }

        return Ok(list);
    }

    // PUT: api/assignments/{id}/submissions/{subId}/return
    [HttpPut("{id:int}/submissions/{subId:int}/return")]
    public async Task<IActionResult> ReturnSubmission(int id, int subId, [FromBody] ReturnSubmissionRequest request)
    {
        var assignment = await _context.Assignments.FindAsync(id);
        if (assignment == null)
            return NotFound(new { message = $"Assignment with ID {id} was not found." });

        var (isAllowed, isTeacherOrAdmin, _) = await CheckClassAuthAsync(assignment.ClassChannelId);
        if (!isAllowed || !isTeacherOrAdmin)
            return StatusCode(StatusCodes.Status403Forbidden, new { message = "Only assigned Teachers or Admins can grade/return submissions." });

        var submission = await _context.AssignmentSubmissions
            .Include(s => s.Student)
            .FirstOrDefaultAsync(s => s.Id == subId && s.AssignmentId == id);

        if (submission == null)
            return NotFound(new { message = "Submission was not found." });

        submission.Grade = request.Grade?.Trim();
        submission.Feedback = request.Feedback?.Trim();
        submission.Status = "Returned";
        submission.ReturnedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new AssignmentSubmissionDto
        {
            Id = submission.Id,
            AssignmentId = submission.AssignmentId,
            StudentUserId = submission.StudentUserId,
            StudentName = submission.Student?.FullName ?? submission.Student?.UserName ?? "Student",
            StudentEmail = submission.Student?.Email ?? "",
            SubmittedText = submission.SubmittedText,
            Status = submission.Status,
            Grade = submission.Grade,
            Feedback = submission.Feedback,
            SubmittedAt = submission.SubmittedAt,
            ReturnedAt = submission.ReturnedAt
        });
    }
}
