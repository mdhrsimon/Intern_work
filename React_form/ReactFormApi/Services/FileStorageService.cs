using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using ReactFormApi.Helpers;

namespace ReactFormApi.Services;

public class FileStorageService
{
    private readonly string _baseUploadsPath;

    public FileStorageService(IWebHostEnvironment env)
    {
        _baseUploadsPath = Path.Combine(env.ContentRootPath, "Uploads");
        if (!Directory.Exists(_baseUploadsPath))
        {
            Directory.CreateDirectory(_baseUploadsPath);
        }
    }

    public async Task<(string StoredFileName, string FilePath)> SaveFileAsync(IFormFile file, string subDirectory)
    {
        var dirPath = Path.Combine(_baseUploadsPath, subDirectory);
        if (!Directory.Exists(dirPath))
        {
            Directory.CreateDirectory(dirPath);
        }

        var originalFileName = FileValidationHelper.SanitizeFileName(file.FileName);
        var ext = Path.GetExtension(originalFileName);
        var storedFileName = $"{Guid.NewGuid()}{ext}";
        var filePath = Path.Combine(dirPath, storedFileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        return (storedFileName, filePath);
    }

    public void DeleteFile(string subDirectory, string storedFileName)
    {
        var filePath = GetFilePath(subDirectory, storedFileName);
        if (File.Exists(filePath))
        {
            File.Delete(filePath);
        }
    }

    public string GetFilePath(string subDirectory, string storedFileName)
    {
        return Path.Combine(_baseUploadsPath, subDirectory, storedFileName);
    }

    public bool FileExists(string subDirectory, string storedFileName)
    {
        return File.Exists(GetFilePath(subDirectory, storedFileName));
    }
}
