using System.Linq.Expressions;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using ReactFormApi.Constants;
using ReactFormApi.Data;
using ReactFormApi.DTOs.Users;
using ReactFormApi.Models;

namespace ReactFormApi.Services;

public class UserService
{
    private readonly AppDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;

    public UserService(AppDbContext context, UserManager<ApplicationUser> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    private static readonly Expression<Func<User, UserResponse>> UserResponseProjection = u => new UserResponse
    {
        Id = u.Id,
        FullName = u.ApplicationUser != null ? (u.ApplicationUser.FullName ?? u.FullName) : u.FullName,
        Email = u.ApplicationUser != null ? (u.ApplicationUser.Email ?? u.Email) : u.Email,
        Phone = u.Phone,
        DateOfBirth = u.DateOfBirth,
        Address = u.Address,
        Gender = u.Gender,
        Education = u.Education.Select(e => new EducationResponse
        {
            Id = e.Id,
            Degree = e.Degree,
            Institute = e.Institute,
            YearPassed = e.YearPassed
        }).ToList()
    };

    private static UserResponse MapToResponse(User u) => new()
    {
        Id = u.Id,
        FullName = u.ApplicationUser != null ? (u.ApplicationUser.FullName ?? u.FullName) : u.FullName,
        Email = u.ApplicationUser != null ? (u.ApplicationUser.Email ?? u.Email) : u.Email,
        Phone = u.Phone,
        DateOfBirth = u.DateOfBirth,
        Address = u.Address,
        Gender = u.Gender,
        Education = u.Education.Select(e => new EducationResponse
        {
            Id = e.Id,
            Degree = e.Degree,
            Institute = e.Institute,
            YearPassed = e.YearPassed
        }).ToList()
    };

    public async Task<PagedUsersResult> GetUsersAsync(
        int page = 1,
        int pageSize = 5,
        string? currentUserId = null,
        string? currentUserRole = null)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 5;
        if (pageSize > 50) pageSize = 50;

        IQueryable<User> query = _context.Users;

        if (currentUserRole != RoleConstants.Admin)
        {
            // Scope Staff/Teacher to only students enrolled in classes they teach
            var allowedStudentAccountIds = GetAllowedStudentAccountIdsQuery(currentUserId);
            query = query.Where(u => u.ApplicationUserId != null && allowedStudentAccountIds.Contains(u.ApplicationUserId));
        }

        query = query.OrderByDescending(u => u.Id);

        var totalCount = await query.CountAsync();
        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(UserResponseProjection)
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

    public async Task<UserServiceResult<UserResponse>> GetUserByIdAsync(
        int id,
        string? currentUserId,
        string? currentUserRole)
    {
        var user = await _context.Users
            .Include(u => u.Education)
            .Include(u => u.ApplicationUser)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null)
            return UserServiceResult<UserResponse>.Fail(404, $"User with id {id} was not found.");

        if (currentUserRole == RoleConstants.Admin)
            return UserServiceResult<UserResponse>.Ok(MapToResponse(user));

        // For Staff/Teacher: check if student is enrolled in caller's classes
        if (string.IsNullOrEmpty(user.ApplicationUserId) ||
            !await IsStudentEnrolledInStaffClassesAsync(currentUserId, user.ApplicationUserId))
        {
            return UserServiceResult<UserResponse>.Fail(403, "Access denied. You can only view submissions of students enrolled in your classes.");
        }

        return UserServiceResult<UserResponse>.Ok(MapToResponse(user));
    }

    public async Task<UserResponse?> GetMySubmissionAsync(string accountId)
    {
        return await _context.Users
            .Where(u => u.ApplicationUserId == accountId)
            .Select(UserResponseProjection)
            .FirstOrDefaultAsync();
    }

    public async Task<UserServiceResult<UserResponse>> CreateUserAsync(CreateUserRequest request, string? accountId)
    {
        string fullName = string.Empty;
        string email = string.Empty;

        if (!string.IsNullOrEmpty(accountId))
        {
            var alreadyExists = await _context.Users.AnyAsync(u => u.ApplicationUserId == accountId);
            if (alreadyExists)
            {
                return UserServiceResult<UserResponse>.Fail(409, "A submission already exists for this account.");
            }

            var account = await _userManager.FindByIdAsync(accountId);
            if (account != null)
            {
                fullName = account.FullName ?? string.Empty;
                email = account.Email ?? string.Empty;
            }
        }

        var user = new User
        {
            FullName = fullName,
            Email = email,
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
        catch (DbUpdateException ex) when (
            ex.InnerException is Microsoft.Data.SqlClient.SqlException sqlEx &&
            (sqlEx.Number == 2601 || sqlEx.Number == 2627))
        {
            return UserServiceResult<UserResponse>.Fail(409, "A submission already exists for this account.");
        }

        return UserServiceResult<UserResponse>.Ok(MapToResponse(user));
    }

    public async Task<UserServiceResult<UserResponse>> UpdateUserAsync(
        int id,
        UpdateUserRequest request,
        string? currentUserId,
        string? currentUserRole)
    {
        var user = await _context.Users
            .Include(u => u.Education)
            .Include(u => u.ApplicationUser)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null)
            return UserServiceResult<UserResponse>.Fail(404, $"User with id {id} was not found.");

        if (currentUserRole != RoleConstants.Admin)
        {
            if (string.IsNullOrEmpty(user.ApplicationUserId) ||
                !await IsStudentEnrolledInStaffClassesAsync(currentUserId, user.ApplicationUserId))
            {
                return UserServiceResult<UserResponse>.Fail(403, "Access denied. You can only edit submissions of students enrolled in your classes.");
            }
        }

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
        return UserServiceResult<UserResponse>.Ok(MapToResponse(user));
    }

    public async Task<UserServiceResult<UserResponse>> UpdateMySubmissionAsync(string accountId, UpdateUserRequest request)
    {
        var user = await _context.Users
            .Include(u => u.Education)
            .Include(u => u.ApplicationUser)
            .FirstOrDefaultAsync(u => u.ApplicationUserId == accountId);

        if (user == null)
            return UserServiceResult<UserResponse>.Fail(404, "No submission found for this account.");

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
        return UserServiceResult<UserResponse>.Ok(MapToResponse(user));
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

    private IQueryable<string> GetAllowedStudentAccountIdsQuery(string? staffUserId)
    {
        var staffClassIds = _context.ClassEnrollments
            .Where(ce => ce.ApplicationUserId == staffUserId &&
                         (ce.RoleInClass == RoleConstants.Staff || ce.RoleInClass == RoleConstants.Teacher))
            .Select(ce => ce.ClassChannelId);

        return _context.ClassEnrollments
            .Where(ce => ce.RoleInClass == RoleConstants.Student && staffClassIds.Contains(ce.ClassChannelId))
            .Select(ce => ce.ApplicationUserId);
    }

    private async Task<bool> IsStudentEnrolledInStaffClassesAsync(string? staffUserId, string? studentAccountId)
    {
        if (string.IsNullOrEmpty(staffUserId) || string.IsNullOrEmpty(studentAccountId))
            return false;

        return await GetAllowedStudentAccountIdsQuery(staffUserId)
            .AnyAsync(accountId => accountId == studentAccountId);
    }
}
