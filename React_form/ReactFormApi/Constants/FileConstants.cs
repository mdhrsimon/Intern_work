namespace ReactFormApi.Constants;

public static class FileConstants
{
    public const long MaxFileSize = 20 * 1024 * 1024; // 20 MB
    public const int MaxFileCount = 10;

    public const string AttachmentsFolder = "AssignmentAttachments";
    public const string SubmissionsFolder = "SubmissionFiles";

    public static readonly string[] AllowedExtensions =
    {
        ".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png", ".txt", ".zip"
    };

    public static readonly Dictionary<string, string> AllowedMimeTypes = new(StringComparer.OrdinalIgnoreCase)
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
}
