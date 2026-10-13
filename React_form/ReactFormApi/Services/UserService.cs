using Microsoft.EntityFrameworkCore;
using ReactFormApi.Constants;
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

    public async Task<PagedUsersResult> GetUsersAsync(
        int page = 1,
        int pageSize = 5,
        string? currentUserId = null,
        string? currentUserRole = null)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 5;
        if (pageSize > 50) pageSize = 50;

        IQueryable<User> query = _context.Users.Include(u => u.Education);

        if (currentUserRole != RoleConstants.Admin)
        {
            // Scope Staff/Teacher to only students enrolled in classes they teach
            var staffClassIds = _context.ClassEnrollments
                .Where(ce => ce.ApplicationUserId == currentUserId &&
                             (ce.RoleInClass == RoleConstants.Staff || ce.RoleInClass == RoleConstants.Teacher))
                .Select(ce => ce.ClassChannelId);

            var allowedStudentAccountIds = _context.ClassEnrollments
                .Where(ce => ce.RoleInClass == RoleConstants.Student && staffClassIds.Contains(ce.ClassChannelId))
                .Select(ce => ce.ApplicationUserId);

            query = query.Where(u => u.ApplicationUserId != null && allowedStudentAccountIds.Contains(u.ApplicationUserId));
        }

        query = query.OrderByDescending(u => u.Id);

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

    public async Task<UserServiceResult<User>> GetUserByIdAsync(
        int id,
        string? currentUserId,
        string? currentUserRole)
    {
        var user = await _context.Users
            .Include(u => u.Education)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null)
            return UserServiceResult<User>.Fail(404, $"User with id {id} was not found.");

        if (currentUserRole == RoleConstants.Admin)
            return UserServiceResult<User>.Ok(user);

        // For Staff/Teacher: check if student is enrolled in caller's classes
        if (string.IsNullOrEmpty(user.ApplicationUserId))
            return UserServiceResult<User>.Fail(403, "Access denied. You can only view submissions of students enrolled in your classes.");

        var staffClassIds = _context.ClassEnrollments
            .Where(ce => ce.ApplicationUserId == currentUserId &&
                         (ce.RoleInClass == RoleConstants.Staff || ce.RoleInClass == RoleConstants.Teacher))
            .Select(ce => ce.ClassChannelId);

        var isAllowed = await _context.ClassEnrollments
            .AnyAsync(ce => ce.ApplicationUserId == user.ApplicationUserId &&
                            ce.RoleInClass == RoleConstants.Student &&
                            staffClassIds.Contains(ce.ClassChannelId));

        if (!isAllowed)
            return UserServiceResult<User>.Fail(403, "Access denied. You can only view submissions of students enrolled in your classes.");

        return UserServiceResult<User>.Ok(user);
    }

    public async Task<User?> GetMySubmissionAsync(string accountId)
    {
        return await _context.Users
            .Include(u => u.Education)
            .FirstOrDefaultAsync(u => u.ApplicationUserId == accountId);
    }

    public async Task<UserServiceResult<User>> CreateUserAsync(CreateUserRequest request, string? accountId)
    {
        if (!string.IsNullOrEmpty(accountId))
        {
            var alreadyExists = await _context.Users.AnyAsync(u => u.ApplicationUserId == accountId);
            if (alreadyExists)
            {
                return UserServiceResult<User>.Fail(409, "A submission already exists for this account.");
            }
        }

        var user = new User
        {
            FullName = request.FullName.Trim(),
            Email = request.Email.Trim(),
            Phone = request.Phone.Trim(),
            DateOfBirth = request.DateOfBirth.Trim(),
            Address = request.Address.Trim(),
            Gender = request.Gender.Trim(),
            ApplicationUserId = accountId,
            Education = request.Education.Select(e => new Education
            {
                Degree = e.Degree.Trim(),
                Institute = e.Institute.Trim(),
                YearPassed = e.YearPassed.Trim()
            }).ToList()
        };

        _context.Users.Add(user);

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            return UserServiceResult<User>.Fail(409, "A submission already exists for this account.");
        }

        return UserServiceResult<User>.Ok(user);
    }

    public async Task<UserServiceResult<User>> UpdateUserAsync(
        int id,
        UpdateUserRequest request,
        string? currentUserId,
        string? currentUserRole)
    {
        var user = await _context.Users
            .Include(u => u.Education)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null)
            return UserServiceResult<User>.Fail(404, $"User with id {id} was not found.");

        if (currentUserRole != RoleConstants.Admin)
        {
            if (string.IsNullOrEmpty(user.ApplicationUserId))
                return UserServiceResult<User>.Fail(403, "Access denied. You can only edit submissions of students enrolled in your classes.");

            var staffClassIds = _context.ClassEnrollments
                .Where(ce => ce.ApplicationUserId == currentUserId &&
                             (ce.RoleInClass == RoleConstants.Staff || ce.RoleInClass == RoleConstants.Teacher))
                .Select(ce => ce.ClassChannelId);

            var isAllowed = await _context.ClassEnrollments
                .AnyAsync(ce => ce.ApplicationUserId == user.ApplicationUserId &&
                                ce.RoleInClass == RoleConstants.Student &&
                                staffClassIds.Contains(ce.ClassChannelId));

            if (!isAllowed)
                return UserServiceResult<User>.Fail(403, "Access denied. You can only edit submissions of students enrolled in your classes.");
        }

        user.FullName = request.FullName.Trim();
        user.Email = request.Email.Trim();
        user.Phone = request.Phone.Trim();
        user.DateOfBirth = request.DateOfBirth.Trim();
        user.Address = request.Address.Trim();
        user.Gender = request.Gender.Trim();

        if (user.Education != null && user.Education.Count > 0)
        {
            _context.Educations.RemoveRange(user.Education);
        }

        user.Education = request.Education.Select(e => new Education
        {
            Degree = e.Degree.Trim(),
            Institute = e.Institute.Trim(),
            YearPassed = e.YearPassed.Trim(),
            UserId = user.Id
        }).ToList();

        await _context.SaveChangesAsync();
        return UserServiceResult<User>.Ok(user);
    }

    public async Task<UserServiceResult<User>> UpdateMySubmissionAsync(string accountId, UpdateUserRequest request)
    {
        var user = await _context.Users
            .Include(u => u.Education)
            .FirstOrDefaultAsync(u => u.ApplicationUserId == accountId);

        if (user == null)
            return UserServiceResult<User>.Fail(404, "No submission found for this account.");

        user.FullName = request.FullName.Trim();
        user.Email = request.Email.Trim();
        user.Phone = request.Phone.Trim();
        user.DateOfBirth = request.DateOfBirth.Trim();
        user.Address = request.Address.Trim();
        user.Gender = request.Gender.Trim();

        if (user.Education != null && user.Education.Count > 0)
        {
            _context.Educations.RemoveRange(user.Education);
        }

        user.Education = request.Education.Select(e => new Education
        {
            Degree = e.Degree.Trim(),
            Institute = e.Institute.Trim(),
            YearPassed = e.YearPassed.Trim(),
            UserId = user.Id
        }).ToList();

        await _context.SaveChangesAsync();
        return UserServiceResult<User>.Ok(user);
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
