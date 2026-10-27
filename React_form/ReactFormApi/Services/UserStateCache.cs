using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Caching.Memory;
using ReactFormApi.Helpers;
using ReactFormApi.Models;

namespace ReactFormApi.Services;

public record UserState(bool IsActive, string PrimaryRole, string? SecurityStamp);

public class UserStateCache
{
    private readonly IMemoryCache _cache;
    private readonly UserManager<ApplicationUser> _userManager;
    private static readonly TimeSpan CacheTtl = TimeSpan.FromSeconds(30);

    public UserStateCache(IMemoryCache cache, UserManager<ApplicationUser> userManager)
    {
        _cache = cache;
        _userManager = userManager;
    }

    public async Task<UserState?> GetAsync(string userId)
    {
        if (string.IsNullOrEmpty(userId)) return null;

        var cacheKey = $"UserState_{userId}";
        if (_cache.TryGetValue(cacheKey, out UserState? cachedState))
        {
            return cachedState;
        }

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return null;
        }

        var roles = await _userManager.GetRolesAsync(user);
        var role = RoleHelper.GetPrimaryRole(roles);

        var state = new UserState(user.IsActive, role, user.SecurityStamp);
        _cache.Set(cacheKey, state, CacheTtl);
        return state;
    }

    public void Invalidate(string userId)
    {
        if (!string.IsNullOrEmpty(userId))
        {
            _cache.Remove($"UserState_{userId}");
        }
    }
}
