using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReactFormApi.Constants;
using ReactFormApi.DTOs.Auth;
using ReactFormApi.Services;

namespace ReactFormApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;

    public AuthController(AuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var result = await _authService.RegisterAsync(request, Response);
        if (!result.Success)
        {
            return StatusCode(result.StatusCode, new
            {
                message = result.Message,
                errors = result.Errors
            });
        }

        return Ok(result.Response);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var result = await _authService.LoginAsync(request, Response);
        if (!result.Success)
        {
            return StatusCode(result.StatusCode, new { message = result.Message });
        }

        return Ok(result.Response);
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh()
    {
        Request.Cookies.TryGetValue(AuthConstants.RefreshTokenCookie, out var refreshToken);
        var result = await _authService.RefreshAsync(refreshToken, Response);
        if (!result.Success)
        {
            return StatusCode(result.StatusCode, new { message = result.Message });
        }

        return Ok(result.Response);
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        Request.Cookies.TryGetValue(AuthConstants.RefreshTokenCookie, out var refreshToken);

        await _authService.LogoutAsync(userId, refreshToken, Response);
        return Ok(new { message = "Logged out successfully and token revoked." });
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> Me()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var result = await _authService.GetCurrentUserAsync(userId);
        if (!result.Success)
        {
            return StatusCode(result.StatusCode);
        }

        return Ok(result.Response);
    }
}
