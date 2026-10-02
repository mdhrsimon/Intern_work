using Microsoft.AspNetCore.Http;
using ReactFormApi.Constants;

namespace ReactFormApi.Helpers;

public static class FileValidationHelper
{
    public static bool IsFileValid(IFormFile? file, out string error)
    {
        error = string.Empty;

        if (file == null || file.Length == 0)
        {
            error = "File is empty.";
            return false;
        }

        if (file.Length > FileConstants.MaxFileSize)
        {
            error = "File size exceeds the 20 MB limit.";
            return false;
        }

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!FileConstants.AllowedExtensions.Contains(ext))
        {
            error = "Invalid file extension.";
            return false;
        }

        return true;
    }

    public static string SanitizeFileName(string fileName)
    {
        return Path.GetFileName(fileName);
    }
}
