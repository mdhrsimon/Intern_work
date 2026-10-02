```csharp
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReactBackend.DTOs.Auth;
using ReactBackend.Services;
using System.Security.Claims;

namespace ReactBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    public const string AccessTokenCookie = "access_token";
    public const string RefreshTokenCookie = "refresh_token";

    private readonly AuthService _authService;

    public AuthController(AuthService authService)
    {
        _authService = authService;
    }

    // ====================== LOGIN ======================

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var result = await _authService.LoginAsync(request, Response);

        if (!result.Success)
            return result.StatusCode switch
            {
                400 => BadRequest(new { message = result.Message }),
                401 => Unauthorized(new { message = result.Message }),
                _ => StatusCode(result.StatusCode, new { message = result.Message })
            };

        return Ok(result.Response);
    }

    // ====================== REFRESH TOKEN ======================

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh()
    {
        var refreshToken = Request.Cookies[RefreshTokenCookie];

        var result = await _authService.RefreshAsync(refreshToken, Response);

        if (!result.Success)
            return Unauthorized(new { message = result.Message });

        return Ok(result.Response);
    }

    // ====================== LOGOUT ======================

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var refreshToken = Request.Cookies[RefreshTokenCookie];

        await _authService.LogoutAsync(
            userId,
            refreshToken,
            Response);

        return Ok(new { message = "Logged out successfully." });
    }

    // ====================== CURRENT USER ======================

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> Me()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var result = await _authService.GetCurrentUserAsync(userId);

        if (!result.Success)
            return Unauthorized();

        return Ok(result.Response);
    }
}
```

Now the controller's main job is simply:

> **Receive request → call service → return response.**

---

# 2. `Services/AuthService.cs`

This contains the actual authentication flow.

```csharp
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using ReactBackend.DTOs.Auth;
using ReactBackend.Helpers;
using ReactBackend.Models;

namespace ReactBackend.Services;

public class AuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly JwtTokenService _jwtTokenService;
    private readonly RefreshTokenService _refreshTokenService;
    private readonly CookieService _cookieService;

    public AuthService(
        UserManager<ApplicationUser> userManager,
        JwtTokenService jwtTokenService,
        RefreshTokenService refreshTokenService,
        CookieService cookieService)
    {
        _userManager = userManager;
        _jwtTokenService = jwtTokenService;
        _refreshTokenService = refreshTokenService;
        _cookieService = cookieService;
    }

    // ====================== LOGIN ======================

    public async Task<AuthServiceResult> LoginAsync(
        LoginRequest request,
        HttpResponse response)
    {
        if (string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Password))
        {
            return AuthServiceResult.Fail(
                400,
                "Email and password are required.");
        }

        var user = await _userManager.FindByEmailAsync(
            request.Email.Trim());

        if (user == null ||
            !await _userManager.CheckPasswordAsync(
                user,
                request.Password))
        {
            return AuthServiceResult.Fail(
                401,
                "Invalid email or password.");
        }

        var authResponse = await IssueAuthTokensAsync(
            user,
            response);

        return AuthServiceResult.Ok(authResponse);
    }

    // ====================== REFRESH TOKEN ======================

    public async Task<AuthServiceResult> RefreshAsync(
        string? refreshToken,
        HttpResponse response)
    {
        if (string.IsNullOrEmpty(refreshToken))
        {
            return AuthServiceResult.Fail(
                401,
                "No refresh token provided.");
        }

        var user = await _userManager.Users
            .FirstOrDefaultAsync(
                u => u.RefreshToken == refreshToken);

        if (user == null ||
            user.RefreshTokenExpiryTime == null ||
            user.RefreshTokenExpiryTime <= DateTime.UtcNow)
        {
            _cookieService.ClearAuthCookies(response);

            return AuthServiceResult.Fail(
                401,
                "Invalid or expired refresh token. Please log in again.");
        }

        var authResponse = await IssueAuthTokensAsync(
            user,
            response);

        return AuthServiceResult.Ok(authResponse);
    }

    // ====================== LOGOUT ======================

    public async Task LogoutAsync(
        string? userId,
        string? refreshToken,
        HttpResponse response)
    {
        ApplicationUser? user = null;

        if (!string.IsNullOrEmpty(userId))
        {
            user = await _userManager.FindByIdAsync(userId);
        }
        else if (!string.IsNullOrEmpty(refreshToken))
        {
            user = await _userManager.Users
                .FirstOrDefaultAsync(
                    u => u.RefreshToken == refreshToken);
        }

        if (user != null)
        {
            user.RefreshToken = null;
            user.RefreshTokenExpiryTime = null;

            await _userManager.UpdateAsync(user);
        }

        _cookieService.ClearAuthCookies(response);
    }

    // ====================== CURRENT USER ======================

    public async Task<AuthServiceResult> GetCurrentUserAsync(
        string? userId)
    {
        if (string.IsNullOrEmpty(userId))
            return AuthServiceResult.Fail(
                401,
                "Unauthorized.");

        var user = await _userManager.FindByIdAsync(userId);

        if (user == null)
            return AuthServiceResult.Fail(
                401,
                "Unauthorized.");

        var roles = await _userManager.GetRolesAsync(user);

        var role = RoleHelper.GetPrimaryRole(roles);

        return AuthServiceResult.Ok(new AuthResponse
        {
            Email = user.Email ?? "",
            FullName = user.FullName,
            Role = role,
            ExpiresAt = DateTime.UtcNow
        });
    }

    // ====================== TOKEN ISSUING ======================

    private async Task<AuthResponse> IssueAuthTokensAsync(
        ApplicationUser user,
        HttpResponse response)
    {
        var roles = await _userManager.GetRolesAsync(user);

        var role = RoleHelper.GetPrimaryRole(roles);

        // Create access token
        var accessToken = _jwtTokenService.CreateAccessToken(
            user,
            role);

        // Create refresh token
        var refreshToken =
            _refreshTokenService.GenerateToken();

        var refreshExpires =
            DateTime.UtcNow.AddDays(7);

        // Save refresh token
        user.RefreshToken = refreshToken;
        user.RefreshTokenCreated = DateTime.UtcNow;
        user.RefreshTokenExpiryTime = refreshExpires;

        await _userManager.UpdateAsync(user);

        // Set cookies
        _cookieService.SetAccessTokenCookie(
            response,
            accessToken.Token,
            accessToken.ExpiresAt);

        _cookieService.SetRefreshTokenCookie(
            response,
            refreshToken,
            refreshExpires);

        return new AuthResponse
        {
            Email = user.Email ?? "",
            FullName = user.FullName,
            Role = role,
            ExpiresAt = accessToken.ExpiresAt
        };
    }
}


// ======================================================
// RESULT CLASS
// ======================================================

public class AuthServiceResult
{
    public bool Success { get; set; }

    public int StatusCode { get; set; }

    public string? Message { get; set; }

    public AuthResponse? Response { get; set; }

    public static AuthServiceResult Ok(AuthResponse response)
    {
        return new AuthServiceResult
        {
            Success = true,
            StatusCode = 200,
            Response = response
        };
    }

    public static AuthServiceResult Fail(
        int statusCode,
        string message)
    {
        return new AuthServiceResult
        {
            Success = false,
            StatusCode = statusCode,
            Message = message
        };
    }
}
```

---

# 3. `Services/JwtTokenService.cs`

This file is responsible **only for creating the JWT access token**.

```csharp
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using ReactBackend.Models;

namespace ReactBackend.Services;

public class JwtTokenService
{
    private readonly IConfiguration _config;

    public JwtTokenService(IConfiguration config)
    {
        _config = config;
    }

    public AccessTokenResult CreateAccessToken(
        ApplicationUser user,
        string role)
    {
        var claims = new List<Claim>
        {
            new(
                JwtRegisteredClaimNames.Sub,
                user.Id),

            new(
                JwtRegisteredClaimNames.Email,
                user.Email ?? ""),

            new(
                JwtRegisteredClaimNames.Jti,
                Guid.NewGuid().ToString()),

            new(
                ClaimTypes.NameIdentifier,
                user.Id),

            new(
                ClaimTypes.Name,
                user.FullName ?? user.Email ?? ""),

            new(
                ClaimTypes.Email,
                user.Email ?? ""),

            new(
                ClaimTypes.Role,
                role)
        };

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(
                _config["Jwt:Key"]!));

        var credentials = new SigningCredentials(
            key,
            SecurityAlgorithms.HmacSha256);

        var accessMinutes =
            int.TryParse(
                _config["Jwt:ExpireMinutes"],
                out var parsed)
                ? parsed
                : 15;

        var expiresAt =
            DateTime.UtcNow.AddMinutes(accessMinutes);

        var jwt = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: expiresAt,
            signingCredentials: credentials);

        var token =
            new JwtSecurityTokenHandler()
                .WriteToken(jwt);

        return new AccessTokenResult
        {
            Token = token,
            ExpiresAt = expiresAt
        };
    }
}


public class AccessTokenResult
{
    public string Token { get; set; } = "";

    public DateTime ExpiresAt { get; set; }
}
```

---

# 4. `Services/RefreshTokenService.cs`

This contains only refresh-token generation.

```csharp
using System.Security.Cryptography;

namespace ReactBackend.Services;

public class RefreshTokenService
{
    public string GenerateToken()
    {
        var randomNumber = new byte[64];

        using var rng =
            RandomNumberGenerator.Create();

        rng.GetBytes(randomNumber);

        return Convert.ToBase64String(randomNumber);
    }
}
```

This is much easier to understand:

> `RefreshTokenService` → creates a secure random refresh token.

---

# 5. `Services/CookieService.cs`

Cookie handling is separated from authentication logic.

```csharp
using Microsoft.AspNetCore.Http;
using ReactBackend.Controllers;

namespace ReactBackend.Services;

public class CookieService
{
    public void SetAccessTokenCookie(
        HttpResponse response,
        string token,
        DateTime expires)
    {
        response.Cookies.Append(
            AuthController.AccessTokenCookie,
            token,
            new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Path = "/",
                Expires = expires,
                IsEssential = true
            });
    }

    public void SetRefreshTokenCookie(
        HttpResponse response,
        string token,
        DateTime expires)
    {
        response.Cookies.Append(
            AuthController.RefreshTokenCookie,
            token,
            new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Path = "/api/auth",
                Expires = expires,
                IsEssential = true
            });
    }

    public void ClearAuthCookies(HttpResponse response)
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

        response.Cookies.Delete(
            AuthController.AccessTokenCookie,
            expiredOptions);

        var refreshExpiredOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None,
            Path = "/api/auth",
            Expires = DateTime.UtcNow.AddDays(-1),
            IsEssential = true
        };

        response.Cookies.Delete(
            AuthController.RefreshTokenCookie,
            refreshExpiredOptions);
    }
}
```

---

# 6. `Helpers/RoleHelper.cs`

Your role-selection logic is small enough to put into a helper.

```csharp
namespace ReactBackend.Helpers;

public static class RoleHelper
{
    public static string GetPrimaryRole(
        IList<string> roles)
    {
        if (roles.Contains("Admin"))
            return "Admin";

        if (roles.Contains("Staff") ||
            roles.Contains("Teacher"))
            return "Staff";

        if (roles.Contains("Student"))
            return "Student";

        return "Student";
    }
}
```

This keeps this logic out of `AuthController` and `AuthService`.

---

# 7. `DTOs/Auth/LoginRequest.cs`

If you already have `LoginRequest`, **don't create another one**. Just move it here.

```csharp
namespace ReactBackend.DTOs.Auth;

public class LoginRequest
{
    public string Email { get; set; } = "";

    public string Password { get; set; } = "";
}
```

---

# 8. `DTOs/Auth/AuthResponse.cs`

Likewise, move your existing `AuthResponse` here.

namespace ReactBackend.DTOs.Auth;

public class AuthResponse
{
public string Email { get; set; } = "";

```
public string? FullName { get; set; }

public string Role { get; set; } = "";

public DateTime ExpiresAt { get; set; }
```

}

````

---

# 9. Register the services in `Program.cs`

This part is important. ASP.NET needs to know that these classes are services.

Add this **before `builder.Build()`**:

```csharp
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<JwtTokenService>();
builder.Services.AddScoped<RefreshTokenService>();
builder.Services.AddScoped<CookieService>();
````

So the dependency chain becomes:

```text
AuthController
      │
      ▼
 AuthService
   │   │   │
   │   │   └──────── CookieService
   │   │
   │   └──────────── RefreshTokenService
   │
   └──────────────── JwtTokenService
```

### What each file now does

| File                  | Responsibility                            |
| --------------------- | ----------------------------------------- |
| `AuthController`      | HTTP endpoints                            |
| `AuthService`         | Login, refresh, logout, current-user flow |
| `JwtTokenService`     | Creates JWT access token                  |
| `RefreshTokenService` | Generates refresh token                   |
| `CookieService`       | Sets/clears cookies                       |
| `RoleHelper`          | Determines primary role                   |
| `LoginRequest`        | Login input                               |
| `AuthResponse`        | Authentication output                     |

### One important point

I would **not split `AuthService` further yet**. Your original controller was ~200 lines, and this structure reduces the controller to roughly 70 lines while keeping the authentication flow understandable.

Also, this preserves your current behavior:

```text
Login
 ↓
Check email/password
 ↓
Create access token
 ↓
Create refresh token
 ↓
Save refresh token in DB
 ↓
Set HttpOnly cookies
 ↓
Return AuthResponse
```

and:

```text
Access token expires
 ↓
Frontend calls /refresh
 ↓
Refresh token checked against DB
 ↓
New access token + refresh token
 ↓
New cookies
```

So you're getting **better structure without introducing Repository, Unit of Work, CQRS, MediatR, interfaces for everything, etc.** Those would add complexity that isn't necessary for your current project.
