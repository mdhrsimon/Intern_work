using ReactFormApi.Models;

namespace ReactFormApi.DTOs.Users;

public class PagedUsersResult
{
    public List<User> Items { get; set; } = new();
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
    public int TotalPages { get; set; }
    public bool HasMore { get; set; }
}
