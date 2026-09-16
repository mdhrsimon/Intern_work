using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using ReactFormApi.Models;
using ReactFormApi.Models.Auth;

namespace ReactFormApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    public const string AccessTokenCookie = "access_token";
    public const string RefreshTokenCookie = "refresh_token";

    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly IConfiguration _config;

    public AuthController(
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager,
        IConfiguration config)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _config = config;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            return BadRequest(new { message = "Email and password are required." });

        if (await _userManager.FindByEmailAsync(request.Email.Trim()) != null)
            return BadRequest(new { message = "Email is already registered." });

        var user = new ApplicationUser
        {
            UserName = request.Email.Trim(),
            Email = request.Email.Trim(),
            FullName = request.FullName?.Trim(),
            EmailConfirmed = true
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
            return BadRequest(new { message = "Registration failed", errors = result.Errors.Select(e => e.Description) });

        // Normalize requested role: Admin, Staff, Teacher, or Student (default)
        var role = request.Role?.Trim();
        if (string.Equals(role, "Admin", StringComparison.OrdinalIgnoreCase))
            role = "Admin";
        else if (string.Equals(role, "Staff", StringComparison.OrdinalIgnoreCase) || string.Equals(role, "Teacher", StringComparison.OrdinalIgnoreCase))
            role = "Staff";
        else
            role = "Student";

        // Ensure role exists
        if (!await _roleManager.RoleExistsAsync(role))
        {
            await _roleManager.CreateAsync(new IdentityRole(role));
        }

        await _userManager.AddToRoleAsync(user, role);

        var authResponse = await IssueAuthTokensAsync(user);
        return Ok(authResponse);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            return BadRequest(new { message = "Email and password are required." });

        var user = await _userManager.FindByEmailAsync(request.Email.Trim());
        if (user == null || !await _userManager.CheckPasswordAsync(user, request.Password))
            return Unauthorized(new { message = "Invalid email or password." });

        var authResponse = await IssueAuthTokensAsync(user);
        return Ok(authResponse);
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh()
    {
        if (!Request.Cookies.TryGetValue(RefreshTokenCookie, out var refreshToken) || string.IsNullOrEmpty(refreshToken))
        {
            return Unauthorized(new { message = "No refresh token provided." });
        }

        var user = await _userManager.Users.FirstOrDefaultAsync(u => u.RefreshToken == refreshToken);
        if (user == null || user.RefreshTokenExpiryTime == null || user.RefreshTokenExpiryTime <= DateTime.UtcNow)
        {
            ClearAuthCookies();
            return Unauthorized(new { message = "Invalid or expired refresh token. Please log in again." });
        }

        // Issue new access token and rotated refresh token
        var authResponse = await IssueAuthTokensAsync(user);
        return Ok(authResponse);
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        // Try identifying the user from the JWT claim or the refresh token cookie to revoke in DB
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        ApplicationUser? user = null;

        if (!string.IsNullOrEmpty(userId))
        {
            user = await _userManager.FindByIdAsync(userId);
        }
        else if (Request.Cookies.TryGetValue(RefreshTokenCookie, out var refreshToken) && !string.IsNullOrEmpty(refreshToken))
        {
            user = await _userManager.Users.FirstOrDefaultAsync(u => u.RefreshToken == refreshToken);
        }

        if (user != null)
        {
            user.RefreshToken = null;
            user.RefreshTokenExpiryTime = null;
            await _userManager.UpdateAsync(user);
        }

        ClearAuthCookies();
        return Ok(new { message = "Logged out successfully and token revoked." });
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> Me()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return Unauthorized();
        }

        var roles = await _userManager.GetRolesAsync(user);
        var role = roles.Contains("Admin") ? "Admin"
                 : (roles.Contains("Staff") || roles.Contains("Teacher")) ? "Staff"
                 : roles.Contains("Student") ? "Student"
                 : roles.Contains("User") ? "Student"
                 : "Student";

        return Ok(new AuthResponse
        {
            Email = user.Email ?? "",
            FullName = user.FullName,
            Role = role,
            ExpiresAt = DateTime.UtcNow
        });
    }
    
    private async Task<AuthResponse> IssueAuthTokensAsync(ApplicationUser user)
    {
        var roles = await _userManager.GetRolesAsync(user);
        var role = roles.Contains("Admin") ? "Admin"
                 : (roles.Contains("Staff") || roles.Contains("Teacher")) ? "Staff"
                 : roles.Contains("Student") ? "Student"
                 : roles.Contains("User") ? "Student"
                 : "Student";

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id),
            new(JwtRegisteredClaimNames.Email, user.Email ?? ""),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new(ClaimTypes.NameIdentifier, user.Id),
            new(ClaimTypes.Name, user.FullName ?? user.Email ?? ""),
            new(ClaimTypes.Email, user.Email ?? ""),
            new(ClaimTypes.Role, role)
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        // Access token: Short-lived (15 minutes default)
        var accessMinutes = int.TryParse(_config["Jwt:ExpireMinutes"], out var parsed) ? parsed : 15;
        var accessExpires = DateTime.UtcNow.AddMinutes(accessMinutes);

        var jwt = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: accessExpires,
            signingCredentials: creds);

        var accessTokenString = new JwtSecurityTokenHandler().WriteToken(jwt);

        // Refresh token: Cryptographically secure random string, 7 days lifetime
        var refreshTokenString = GenerateSecureRefreshToken();
        var refreshDays = 7;
        var refreshExpires = DateTime.UtcNow.AddDays(refreshDays);

        user.RefreshToken = refreshTokenString;
        user.RefreshTokenCreated = DateTime.UtcNow;
        user.RefreshTokenExpiryTime = refreshExpires;
        user.LastSeen = DateTime.UtcNow;
        await _userManager.UpdateAsync(user);

        // Set HttpOnly Cookies
        SetCookie(AccessTokenCookie, accessTokenString, accessExpires, "/");
        SetCookie(RefreshTokenCookie, refreshTokenString, refreshExpires, "/api/auth");

        return new AuthResponse
        {
            Email = user.Email ?? "",
            FullName = user.FullName,
            Role = role,
            ExpiresAt = accessExpires
        };
    }

    private static string GenerateSecureRefreshToken()
    {
        var randomNumber = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }

    private void SetCookie(string name, string value, DateTime expires, string path = "/")
    {
        Response.Cookies.Append(name, value, new CookieOptions
        {
            HttpOnly = true,
            Secure = true, // Always true for modern secure auth
            SameSite = SameSiteMode.None, // Required for cross-port/cross-origin SPA cookie transmission
            Path = path,
            Expires = expires,
            IsEssential = true
        });
    }

    private void ClearAuthCookies()
    {
        var expiredOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None,
            Path = "/",
            Expires = DateTime.UtcNow.AddDays(-1),
            IsEssential = true
        };

        Response.Cookies.Delete(AccessTokenCookie, expiredOptions);

        var refreshExpiredOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None,
            Path = "/api/auth",
            Expires = DateTime.UtcNow.AddDays(-1),
            IsEssential = true
        };

        Response.Cookies.Delete(RefreshTokenCookie, refreshExpiredOptions);
    }
}

