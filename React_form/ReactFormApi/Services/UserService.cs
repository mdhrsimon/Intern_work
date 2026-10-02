using Microsoft.EntityFrameworkCore;
using ReactFormApi.Data;
using ReactFormApi.DTOs.Users;
using ReactFormApi.Models;

namespace ReactFormApi.Services;

public class UserService
{
    private readonly AppDbContext _context;

    public UserService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PagedUsersResult> GetUsersAsync(int page = 1, int pageSize = 5)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 5;
        if (pageSize > 50) pageSize = 50;

        var query = _context.Users
            .Include(u => u.Education)
            .OrderByDescending(u => u.Id);

        var totalCount = await query.CountAsync();
        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedUsersResult
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = totalPages,
            HasMore = page < totalPages
        };
    }

    public async Task<User?> GetUserByIdAsync(int id)
    {
        return await _context.Users
            .Include(u => u.Education)
            .FirstOrDefaultAsync(u => u.Id == id);
    }

    public async Task<User?> GetMySubmissionAsync(string accountId)
    {
        return await _context.Users
            .Include(u => u.Education)
            .FirstOrDefaultAsync(u => u.ApplicationUserId == accountId);
    }

    public async Task<User> CreateUserAsync(User user, string? accountId)
    {
        user.ApplicationUserId = accountId;
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return user;
    }

    public async Task<User?> UpdateUserAsync(int id, User updatedUser)
    {
        var user = await _context.Users
            .Include(u => u.Education)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null) return null;

        user.FullName = updatedUser.FullName;
        user.Email = updatedUser.Email;
        user.Phone = updatedUser.Phone;
        user.DateOfBirth = updatedUser.DateOfBirth;
        user.Address = updatedUser.Address;
        user.Gender = updatedUser.Gender;

        if (user.Education != null && user.Education.Count > 0)
        {
            _context.Educations.RemoveRange(user.Education);
        }

        user.Education = updatedUser.Education ?? new List<Education>();

        await _context.SaveChangesAsync();
        return user;
    }

    public async Task DeleteAllUsersAsync()
    {
        var users = await _context.Users
            .Include(u => u.Education)
            .ToListAsync();

        _context.Users.RemoveRange(users);
        await _context.SaveChangesAsync();
    }

    public async Task<bool> DeleteUserByIdAsync(int id)
    {
        var user = await _context.Users
            .Include(u => u.Education)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null) return false;

        if (user.Education != null && user.Education.Count > 0)
        {
            _context.Educations.RemoveRange(user.Education);
        }

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();
        return true;
    }
}
