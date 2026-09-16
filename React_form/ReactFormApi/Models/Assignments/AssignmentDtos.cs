namespace ReactFormApi.Models.Assignments;

public class CreateAssignmentRequest
{
    public int ClassChannelId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime? DueDate { get; set; }
}

public class UpdateAssignmentRequest
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime? DueDate { get; set; }
}

public class SubmitAssignmentRequest
{
    public string SubmittedText { get; set; } = string.Empty;
}

public class ReturnSubmissionRequest
{
    public string? Grade { get; set; }
    public string? Feedback { get; set; }
}

public class AssignmentDto
{
    public int Id { get; set; }
    public int ClassChannelId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime? DueDate { get; set; }
    public string CreatedByUserId { get; set; } = string.Empty;
    public string CreatedByName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }

    // Summary details for caller context
    public int TotalSubmissions { get; set; }
    public int TurnedInCount { get; set; }
    public int ReturnedCount { get; set; }

    // Student specific context (if student is fetching)
    public AssignmentSubmissionDto? MySubmission { get; set; }

    public List<AssignmentAttachmentDto> Attachments { get; set; } = new List<AssignmentAttachmentDto>();
}

public class AssignmentSubmissionDto
{
    public int Id { get; set; }
    public int AssignmentId { get; set; }
    public string StudentUserId { get; set; } = string.Empty;
    public string StudentName { get; set; } = string.Empty;
    public string StudentEmail { get; set; } = string.Empty;
    public string? SubmittedText { get; set; }
    public string Status { get; set; } = "Assigned";
    public string? Grade { get; set; }
    public string? Feedback { get; set; }
    public DateTime? SubmittedAt { get; set; }
    public DateTime? ReturnedAt { get; set; }

    public List<SubmissionFileDto> Files { get; set; } = new List<SubmissionFileDto>();
}

public class AssignmentAttachmentDto
{
    public int Id { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public DateTime UploadedAt { get; set; }
}

public class SubmissionFileDto
{
    public int Id { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public DateTime UploadedAt { get; set; }
}
