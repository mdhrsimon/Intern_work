using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using ReactFormApi.Constants;
using ReactFormApi.DTOs.Auth;
using ReactFormApi.Helpers;
using ReactFormApi.Models;

namespace ReactFormApi.Services;

public class AuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly JwtTokenService _jwtTokenService;
    private readonly RefreshTokenService _refreshTokenService;
    private readonly CookieService _cookieService;

    public AuthService(
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager,
        JwtTokenService jwtTokenService,
        RefreshTokenService refreshTokenService,
        CookieService cookieService)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _jwtTokenService = jwtTokenService;
        _refreshTokenService = refreshTokenService;
        _cookieService = cookieService;
    }

    public async Task<AuthServiceResult> RegisterAsync(RegisterRequest request, HttpResponse response)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            return AuthServiceResult.Fail(400, "Email and password are required.");

        var trimmedEmail = request.Email.Trim();
        if (await _userManager.FindByEmailAsync(trimmedEmail) != null)
            return AuthServiceResult.Fail(400, "Email is already registered.");

        var user = new ApplicationUser
        {
            UserName = trimmedEmail,
            Email = trimmedEmail,
            FullName = request.FullName?.Trim(),
            EmailConfirmed = true,
            IsActive = true
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            return AuthServiceResult.Fail(400, "Registration failed", result.Errors.Select(e => e.Description));
        }

        var role = RoleHelper.NormalizeRole(request.Role);

        if (!await _roleManager.RoleExistsAsync(role))
        {
            await _roleManager.CreateAsync(new IdentityRole(role));
        }

        await _userManager.AddToRoleAsync(user, role);

        var authResponse = await IssueAuthTokensAsync(user, response);
        return AuthServiceResult.Ok(authResponse);
    }

    public async Task<AuthServiceResult> LoginAsync(LoginRequest request, HttpResponse response)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            return AuthServiceResult.Fail(400, "Email and password are required.");

        var trimmedEmail = request.Email.Trim();
        var user = await _userManager.FindByEmailAsync(trimmedEmail);

        if (user == null || !await _userManager.CheckPasswordAsync(user, request.Password))
            return AuthServiceResult.Fail(401, "Invalid email or password.");

        if (!user.IsActive)
            return AuthServiceResult.Fail(403, "Account is disabled. Please contact administrator.");

        var authResponse = await IssueAuthTokensAsync(user, response);
        return AuthServiceResult.Ok(authResponse);
    }

    public async Task<AuthServiceResult> RefreshAsync(string? refreshToken, HttpResponse response)
    {
        if (string.IsNullOrEmpty(refreshToken))
        {
            return AuthServiceResult.Fail(401, "No refresh token provided.");
        }

        var user = await _userManager.Users.FirstOrDefaultAsync(u => u.RefreshToken == refreshToken);
        if (user == null || user.RefreshTokenExpiryTime == null || user.RefreshTokenExpiryTime <= DateTime.UtcNow)
        {
            _cookieService.ClearAuthCookies(response);
            return AuthServiceResult.Fail(401, "Invalid or expired refresh token. Please log in again.");
        }

        if (!user.IsActive)
        {
            _cookieService.ClearAuthCookies(response);
            return AuthServiceResult.Fail(403, "Account is disabled.");
        }

        var authResponse = await IssueAuthTokensAsync(user, response);
        return AuthServiceResult.Ok(authResponse);
    }

    public async Task LogoutAsync(string? userId, string? refreshToken, HttpResponse response)
    {
        ApplicationUser? user = null;

        if (!string.IsNullOrEmpty(userId))
        {
            user = await _userManager.FindByIdAsync(userId);
        }
        else if (!string.IsNullOrEmpty(refreshToken))
        {
            user = await _userManager.Users.FirstOrDefaultAsync(u => u.RefreshToken == refreshToken);
        }

        if (user != null)
        {
            user.RefreshToken = null;
            user.RefreshTokenExpiryTime = null;
            await _userManager.UpdateAsync(user);
        }

        _cookieService.ClearAuthCookies(response);
    }

    public async Task<AuthServiceResult> GetCurrentUserAsync(string? userId)
    {
        if (string.IsNullOrEmpty(userId))
            return AuthServiceResult.Fail(401, "Unauthorized.");

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            return AuthServiceResult.Fail(401, "Unauthorized.");

        var roles = await _userManager.GetRolesAsync(user);
        var role = RoleHelper.GetPrimaryRole(roles);

        return AuthServiceResult.Ok(new AuthResponse
        {
            Email = user.Email ?? string.Empty,
            FullName = user.FullName,
            Role = role,
            ExpiresAt = DateTime.UtcNow
        });
    }

    public async Task<AuthResponse> IssueAuthTokensAsync(ApplicationUser user, HttpResponse response)
    {
        var roles = await _userManager.GetRolesAsync(user);
        var role = RoleHelper.GetPrimaryRole(roles);

        var accessToken = _jwtTokenService.CreateAccessToken(user, role);
        var refreshToken = _refreshTokenService.GenerateToken();
        var refreshExpires = DateTime.UtcNow.AddDays(AuthConstants.DefaultRefreshTokenExpiryDays);

        user.RefreshToken = refreshToken;
        user.RefreshTokenCreated = DateTime.UtcNow;
        user.RefreshTokenExpiryTime = refreshExpires;
        user.LastSeen = DateTime.UtcNow;

        await _userManager.UpdateAsync(user);

        _cookieService.SetAccessTokenCookie(response, accessToken.Token, accessToken.ExpiresAt);
        _cookieService.SetRefreshTokenCookie(response, refreshToken, refreshExpires);

        return new AuthResponse
        {
            Email = user.Email ?? string.Empty,
            FullName = user.FullName,
            Role = role,
            ExpiresAt = accessToken.ExpiresAt
        };
    }
}
