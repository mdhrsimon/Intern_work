using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using ReactFormApi.Authorization;
using ReactFormApi.Constants;
using ReactFormApi.Data;
using ReactFormApi.DTOs.Assignments;
using ReactFormApi.Helpers;
using ReactFormApi.Models;

namespace ReactFormApi.Services;

public class AssignmentFileService
{
    private readonly AppDbContext _context;
    private readonly FileStorageService _fileStorageService;
    private readonly ClassAuthorizationService _authorizationService;
    private readonly INotificationService _notificationService;
    private readonly UserManager<ApplicationUser> _userManager;

    public AssignmentFileService(
        AppDbContext context,
        FileStorageService fileStorageService,
        ClassAuthorizationService authorizationService,
        INotificationService notificationService,
        UserManager<ApplicationUser> userManager)
    {
        _context = context;
        _fileStorageService = fileStorageService;
        _authorizationService = authorizationService;
        _notificationService = notificationService;
        _userManager = userManager;
    }

    public async Task<FileServiceResult<AssignmentAttachmentDto>> UploadAttachmentAsync(
        int assignmentId,
        IFormFile file,
        string currentUserId,
        string currentUserRole)
    {
        var assignment = await _context.Assignments
            .Include(a => a.Attachments)
            .FirstOrDefaultAsync(a => a.Id == assignmentId);

        if (assignment == null)
            return FileServiceResult<AssignmentAttachmentDto>.Fail(404, "Assignment not found.");

        var (isAllowed, isTeacherOrAdmin, _) = await _authorizationService.CheckClassAuthAsync(
            assignment.ClassChannelId, currentUserId, currentUserRole);

        if (!isAllowed || !isTeacherOrAdmin)
            return FileServiceResult<AssignmentAttachmentDto>.Fail(403, "Only assigned Teachers or Admins can upload attachments.");

        if (assignment.Attachments.Count >= FileConstants.MaxFileCount)
            return FileServiceResult<AssignmentAttachmentDto>.Fail(400, $"Maximum of {FileConstants.MaxFileCount} files allowed per assignment.");

        if (!FileValidationHelper.IsFileValid(file, out var error))
            return FileServiceResult<AssignmentAttachmentDto>.Fail(400, error);

        var originalFileName = FileValidationHelper.SanitizeFileName(file.FileName);
        var (storedFileName, _) = await _fileStorageService.SaveFileAsync(file, FileConstants.AttachmentsFolder);

        var attachment = new AssignmentAttachment
        {
            AssignmentId = assignmentId,
            FileName = originalFileName,
            StoredFileName = storedFileName,
            ContentType = file.ContentType,
            FileSize = file.Length,
            UploadedByUserId = currentUserId,
            UploadedAt = DateTime.UtcNow
        };

        _context.AssignmentAttachments.Add(attachment);
        await _context.SaveChangesAsync();

        return FileServiceResult<AssignmentAttachmentDto>.Ok(new AssignmentAttachmentDto
        {
            Id = attachment.Id,
            FileName = attachment.FileName,
            ContentType = attachment.ContentType,
            FileSize = attachment.FileSize,
            UploadedAt = attachment.UploadedAt
        });
    }

    public async Task<FileServiceResult<object>> DeleteAttachmentAsync(
        int assignmentId,
        int fileId,
        string currentUserId,
        string currentUserRole)
    {
        var assignment = await _context.Assignments.FindAsync(assignmentId);
        if (assignment == null)
            return FileServiceResult<object>.Fail(404, "Assignment not found.");

        var (isAllowed, isTeacherOrAdmin, _) = await _authorizationService.CheckClassAuthAsync(
            assignment.ClassChannelId, currentUserId, currentUserRole);

        if (!isAllowed || !isTeacherOrAdmin)
            return FileServiceResult<object>.Fail(403, "Only assigned Teachers or Admins can delete attachments.");

        var attachment = await _context.AssignmentAttachments
            .FirstOrDefaultAsync(a => a.Id == fileId && a.AssignmentId == assignmentId);

        if (attachment == null)
            return FileServiceResult<object>.Fail(404, "Attachment not found.");

        _context.AssignmentAttachments.Remove(attachment);
        await _context.SaveChangesAsync();

        _fileStorageService.DeleteFile(FileConstants.AttachmentsFolder, attachment.StoredFileName);

        return FileServiceResult<object>.NoContentResult();
    }

    public async Task<FileDownloadResult> GetAttachmentDownloadAsync(
        int assignmentId,
        int fileId,
        string currentUserId,
        string currentUserRole)
    {
        var assignment = await _context.Assignments.FindAsync(assignmentId);
        if (assignment == null)
            return FileDownloadResult.Fail(404, "Assignment not found.");

        var (isAllowed, _, _) = await _authorizationService.CheckClassAuthAsync(
            assignment.ClassChannelId, currentUserId, currentUserRole);

        if (!isAllowed)
            return FileDownloadResult.Fail(403, "You are not enrolled in this class.");

        var attachment = await _context.AssignmentAttachments
            .FirstOrDefaultAsync(a => a.Id == fileId && a.AssignmentId == assignmentId);

        if (attachment == null)
            return FileDownloadResult.Fail(404, "Attachment not found.");

        var filePath = _fileStorageService.GetFilePath(FileConstants.AttachmentsFolder, attachment.StoredFileName);
        if (!_fileStorageService.FileExists(FileConstants.AttachmentsFolder, attachment.StoredFileName))
            return FileDownloadResult.Fail(404, "File not found on server.");

        return FileDownloadResult.Ok(filePath, attachment.ContentType, attachment.FileName);
    }

    public async Task<FileServiceResult<SubmissionFileDto>> UploadSubmissionFileAsync(
        int assignmentId,
        IFormFile file,
        string currentUserId,
        string currentUserRole)
    {
        var assignment = await _context.Assignments.FindAsync(assignmentId);
        if (assignment == null)
            return FileServiceResult<SubmissionFileDto>.Fail(404, "Assignment not found.");

        var (isAllowed, _, _) = await _authorizationService.CheckClassAuthAsync(
            assignment.ClassChannelId, currentUserId, currentUserRole);

        if (!isAllowed)
            return FileServiceResult<SubmissionFileDto>.Fail(403, "You are not enrolled in this class.");

        var submission = await _context.AssignmentSubmissions
            .Include(s => s.Files)
            .FirstOrDefaultAsync(s => s.AssignmentId == assignmentId && s.StudentUserId == currentUserId);

        if (submission == null)
        {
            submission = new AssignmentSubmission
            {
                AssignmentId = assignmentId,
                StudentUserId = currentUserId,
                Status = "Assigned",
                SubmittedAt = null
            };
            _context.AssignmentSubmissions.Add(submission);
            await _context.SaveChangesAsync();
        }

        if (submission.Status == "Returned")
            return FileServiceResult<SubmissionFileDto>.Fail(400, "Cannot upload files after submission has been Returned.");

        if (submission.Files.Count >= FileConstants.MaxFileCount)
            return FileServiceResult<SubmissionFileDto>.Fail(400, $"Maximum of {FileConstants.MaxFileCount} files allowed per submission.");

        if (!FileValidationHelper.IsFileValid(file, out var error))
            return FileServiceResult<SubmissionFileDto>.Fail(400, error);

        var originalFileName = FileValidationHelper.SanitizeFileName(file.FileName);
        var (storedFileName, _) = await _fileStorageService.SaveFileAsync(file, FileConstants.SubmissionsFolder);

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

        if (submission.Status == "Turned In" || submission.SubmittedAt != null)
        {
            var student = await _userManager.FindByIdAsync(currentUserId);
            var studentName = student?.FullName ?? student?.UserName ?? "A student";
            await _notificationService.NotifyClassEnrolledUsersAsync(
                assignment.ClassChannelId,
                RoleConstants.Staff,
                NotificationType.AssignmentResubmitted,
                "Submission Files Updated",
                $"{studentName} updated submission files for '{assignment.Title}'.",
                assignment.Id,
                currentUserId);
        }

        return FileServiceResult<SubmissionFileDto>.Ok(new SubmissionFileDto
        {
            Id = submissionFile.Id,
            FileName = submissionFile.FileName,
            ContentType = submissionFile.ContentType,
            FileSize = submissionFile.FileSize,
            UploadedAt = submissionFile.UploadedAt
        });
    }

    public async Task<FileServiceResult<object>> DeleteSubmissionFileAsync(
        int assignmentId,
        int fileId,
        string currentUserId)
    {
        var assignment = await _context.Assignments.FindAsync(assignmentId);
        if (assignment == null)
            return FileServiceResult<object>.Fail(404, "Assignment not found.");

        var submission = await _context.AssignmentSubmissions
            .FirstOrDefaultAsync(s => s.AssignmentId == assignmentId && s.StudentUserId == currentUserId);

        if (submission == null)
            return FileServiceResult<object>.Fail(404, "Submission not found.");

        if (submission.Status == "Returned")
            return FileServiceResult<object>.Fail(400, "Cannot delete files after submission has been Returned.");

        var submissionFile = await _context.SubmissionFiles
            .FirstOrDefaultAsync(f => f.Id == fileId && f.AssignmentSubmissionId == submission.Id);

        if (submissionFile == null)
            return FileServiceResult<object>.Fail(404, "File not found.");

        _context.SubmissionFiles.Remove(submissionFile);
        await _context.SaveChangesAsync();

        _fileStorageService.DeleteFile(FileConstants.SubmissionsFolder, submissionFile.StoredFileName);

        return FileServiceResult<object>.NoContentResult();
    }

    public async Task<FileDownloadResult> GetSubmissionFileDownloadAsync(
        int assignmentId,
        int subId,
        int fileId,
        string currentUserId,
        string currentUserRole)
    {
        var assignment = await _context.Assignments.FindAsync(assignmentId);
        if (assignment == null)
            return FileDownloadResult.Fail(404, "Assignment not found.");

        var submission = await _context.AssignmentSubmissions
            .FirstOrDefaultAsync(s => s.Id == subId && s.AssignmentId == assignmentId);

        if (submission == null)
            return FileDownloadResult.Fail(404, "Submission not found.");

        var (isAllowed, isTeacherOrAdmin, _) = await _authorizationService.CheckClassAuthAsync(
            assignment.ClassChannelId, currentUserId, currentUserRole);

        if (!isAllowed)
            return FileDownloadResult.Fail(403, "You are not enrolled in this class.");

        if (submission.StudentUserId != currentUserId && !isTeacherOrAdmin)
            return FileDownloadResult.Fail(403, "You do not have permission to view this file.");

        var submissionFile = await _context.SubmissionFiles
            .FirstOrDefaultAsync(f => f.Id == fileId && f.AssignmentSubmissionId == subId);

        if (submissionFile == null)
            return FileDownloadResult.Fail(404, "File not found.");

        var filePath = _fileStorageService.GetFilePath(FileConstants.SubmissionsFolder, submissionFile.StoredFileName);
        if (!_fileStorageService.FileExists(FileConstants.SubmissionsFolder, submissionFile.StoredFileName))
            return FileDownloadResult.Fail(404, "File not found on server.");

        return FileDownloadResult.Ok(filePath, submissionFile.ContentType, submissionFile.FileName);
    }
}
