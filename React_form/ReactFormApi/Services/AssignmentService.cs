using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using ReactFormApi.Authorization;
using ReactFormApi.Constants;
using ReactFormApi.Data;
using ReactFormApi.DTOs.Assignments;
using ReactFormApi.Models;

namespace ReactFormApi.Services;

public class AssignmentService
{
    private readonly AppDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ClassAuthorizationService _authorizationService;

    public AssignmentService(
        AppDbContext context,
        UserManager<ApplicationUser> userManager,
        ClassAuthorizationService authorizationService)
    {
        _context = context;
        _userManager = userManager;
        _authorizationService = authorizationService;
    }

    public async Task<AssignmentServiceResult<List<AssignmentDto>>> GetAssignmentsByClassAsync(
        int classId,
        string? currentUserId,
        string currentUserRole)
    {
        var (isAllowed, _, _) = await _authorizationService.CheckClassAuthAsync(classId, currentUserId, currentUserRole);
        if (!isAllowed)
            return AssignmentServiceResult<List<AssignmentDto>>.Fail(403, "You are not enrolled or assigned to this class.");

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
                    StudentEmail = mySub.Student?.Email ?? string.Empty,
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

        return AssignmentServiceResult<List<AssignmentDto>>.Ok(dtos);
    }

    public async Task<AssignmentServiceResult<AssignmentDto>> CreateAssignmentAsync(
        CreateAssignmentRequest request,
        string currentUserId,
        string currentUserRole)
    {
        if (string.IsNullOrWhiteSpace(request.Title))
            return AssignmentServiceResult<AssignmentDto>.Fail(400, "Assignment title is required.");

        var (isAllowed, isTeacherOrAdmin, _) = await _authorizationService.CheckClassAuthAsync(
            request.ClassChannelId, currentUserId, currentUserRole);

        if (!isAllowed || !isTeacherOrAdmin)
            return AssignmentServiceResult<AssignmentDto>.Fail(403, "Only assigned Teachers or Admins can create assignments for this class.");

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

        return AssignmentServiceResult<AssignmentDto>.Ok(new AssignmentDto
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

    public async Task<AssignmentServiceResult<object>> UpdateAssignmentAsync(
        int id,
        UpdateAssignmentRequest request,
        string currentUserId,
        string currentUserRole)
    {
        var assignment = await _context.Assignments.FindAsync(id);
        if (assignment == null)
            return AssignmentServiceResult<object>.Fail(404, $"Assignment with ID {id} was not found.");

        var (isAllowed, isTeacherOrAdmin, _) = await _authorizationService.CheckClassAuthAsync(
            assignment.ClassChannelId, currentUserId, currentUserRole);

        if (!isAllowed || !isTeacherOrAdmin)
            return AssignmentServiceResult<object>.Fail(403, "Only assigned Teachers or Admins can update assignments for this class.");

        if (!string.IsNullOrWhiteSpace(request.Title))
            assignment.Title = request.Title.Trim();

        assignment.Description = request.Description?.Trim();
        assignment.DueDate = request.DueDate;

        await _context.SaveChangesAsync();

        return AssignmentServiceResult<object>.Ok(new { message = "Assignment updated successfully.", assignmentId = id });
    }

    public async Task<AssignmentServiceResult<object>> DeleteAssignmentAsync(
        int id,
        string currentUserId,
        string currentUserRole)
    {
        var assignment = await _context.Assignments.FindAsync(id);
        if (assignment == null)
            return AssignmentServiceResult<object>.Fail(404, $"Assignment with ID {id} was not found.");

        var (isAllowed, isTeacherOrAdmin, _) = await _authorizationService.CheckClassAuthAsync(
            assignment.ClassChannelId, currentUserId, currentUserRole);

        if (!isAllowed || !isTeacherOrAdmin)
            return AssignmentServiceResult<object>.Fail(403, "Only assigned Teachers or Admins can delete assignments for this class.");

        _context.Assignments.Remove(assignment);
        await _context.SaveChangesAsync();

        return AssignmentServiceResult<object>.NoContentResult();
    }

    public async Task<AssignmentServiceResult<AssignmentSubmissionDto>> SubmitAssignmentAsync(
        int id,
        SubmitAssignmentRequest request,
        string currentUserId,
        string currentUserRole)
    {
        var assignment = await _context.Assignments.FindAsync(id);
        if (assignment == null)
            return AssignmentServiceResult<AssignmentSubmissionDto>.Fail(404, $"Assignment with ID {id} was not found.");

        var (isAllowed, _, _) = await _authorizationService.CheckClassAuthAsync(
            assignment.ClassChannelId, currentUserId, currentUserRole);

        if (!isAllowed)
            return AssignmentServiceResult<AssignmentSubmissionDto>.Fail(403, "You are not enrolled in this class.");

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

        return AssignmentServiceResult<AssignmentSubmissionDto>.Ok(new AssignmentSubmissionDto
        {
            Id = submission.Id,
            AssignmentId = submission.AssignmentId,
            StudentUserId = submission.StudentUserId,
            StudentName = student?.FullName ?? student?.UserName ?? "Student",
            StudentEmail = student?.Email ?? string.Empty,
            SubmittedText = submission.SubmittedText,
            Status = submission.Status,
            Grade = submission.Grade,
            Feedback = submission.Feedback,
            SubmittedAt = submission.SubmittedAt,
            ReturnedAt = submission.ReturnedAt
        });
    }

    public async Task<AssignmentServiceResult<List<AssignmentSubmissionDto>>> GetSubmissionsAsync(
        int id,
        string currentUserId,
        string currentUserRole)
    {
        var assignment = await _context.Assignments.FindAsync(id);
        if (assignment == null)
            return AssignmentServiceResult<List<AssignmentSubmissionDto>>.Fail(404, $"Assignment with ID {id} was not found.");

        var (isAllowed, isTeacherOrAdmin, _) = await _authorizationService.CheckClassAuthAsync(
            assignment.ClassChannelId, currentUserId, currentUserRole);

        if (!isAllowed || !isTeacherOrAdmin)
            return AssignmentServiceResult<List<AssignmentSubmissionDto>>.Fail(403, "Only assigned Teachers or Admins can view submissions.");

        var enrolledStudents = await _context.ClassEnrollments
            .Include(e => e.ApplicationUser)
            .Where(e => e.ClassChannelId == assignment.ClassChannelId && e.RoleInClass == RoleConstants.Student)
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
                    StudentEmail = e.ApplicationUser.Email ?? string.Empty,
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
                list.Add(new AssignmentSubmissionDto
                {
                    Id = 0,
                    AssignmentId = id,
                    StudentUserId = e.ApplicationUserId,
                    StudentName = e.ApplicationUser.FullName ?? e.ApplicationUser.UserName ?? "Student",
                    StudentEmail = e.ApplicationUser.Email ?? string.Empty,
                    SubmittedText = null,
                    Status = "Assigned",
                    Grade = null,
                    Feedback = null,
                    SubmittedAt = null,
                    ReturnedAt = null
                });
            }
        }

        return AssignmentServiceResult<List<AssignmentSubmissionDto>>.Ok(list);
    }

    public async Task<AssignmentServiceResult<AssignmentSubmissionDto>> ReturnSubmissionAsync(
        int id,
        int subId,
        ReturnSubmissionRequest request,
        string currentUserId,
        string currentUserRole)
    {
        var assignment = await _context.Assignments.FindAsync(id);
        if (assignment == null)
            return AssignmentServiceResult<AssignmentSubmissionDto>.Fail(404, $"Assignment with ID {id} was not found.");

        var (isAllowed, isTeacherOrAdmin, _) = await _authorizationService.CheckClassAuthAsync(
            assignment.ClassChannelId, currentUserId, currentUserRole);

        if (!isAllowed || !isTeacherOrAdmin)
            return AssignmentServiceResult<AssignmentSubmissionDto>.Fail(403, "Only assigned Teachers or Admins can grade/return submissions.");

        var submission = await _context.AssignmentSubmissions
            .Include(s => s.Student)
            .FirstOrDefaultAsync(s => s.Id == subId && s.AssignmentId == id);

        if (submission == null)
            return AssignmentServiceResult<AssignmentSubmissionDto>.Fail(404, "Submission was not found.");

        submission.Grade = request.Grade?.Trim();
        submission.Feedback = request.Feedback?.Trim();
        submission.Status = "Returned";
        submission.ReturnedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return AssignmentServiceResult<AssignmentSubmissionDto>.Ok(new AssignmentSubmissionDto
        {
            Id = submission.Id,
            AssignmentId = submission.AssignmentId,
            StudentUserId = submission.StudentUserId,
            StudentName = submission.Student?.FullName ?? submission.Student?.UserName ?? "Student",
            StudentEmail = submission.Student?.Email ?? string.Empty,
            SubmittedText = submission.SubmittedText,
            Status = submission.Status,
            Grade = submission.Grade,
            Feedback = submission.Feedback,
            SubmittedAt = submission.SubmittedAt,
            ReturnedAt = submission.ReturnedAt
        });
    }
}
