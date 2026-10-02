using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReactFormApi.DTOs.Accounts;
using ReactFormApi.Services;

namespace ReactFormApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AccountsController : ControllerBase
{
    private readonly AccountService _accountService;

    public AccountsController(AccountService accountService)
    {
        _accountService = accountService;
    }

    // GET: api/accounts?page=1&pageSize=10&search=&role=&isActive=
    [HttpGet]
    public async Task<IActionResult> GetAccounts(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        [FromQuery] string? role = null,
        [FromQuery] bool? isActive = null)
    {
        var result = await _accountService.GetAccountsAsync(page, pageSize, search, role, isActive);
        return Ok(result);
    }

    // GET: api/accounts/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetAccount(string id)
    {
        var account = await _accountService.GetAccountByIdAsync(id);
        if (account == null)
            return NotFound();

        return Ok(account);
    }

    // POST: api/accounts
    [HttpPost]
    public async Task<IActionResult> CreateAccount([FromBody] CreateAccountRequest request)
    {
        var result = await _accountService.CreateAccountAsync(request);
        if (!result.Success)
            return StatusCode(result.StatusCode, new { message = result.Message, errors = result.Errors });

        return Ok(result.Account);
    }

    // PUT: api/accounts/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateAccount(string id, [FromBody] UpdateAccountRequest request)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var result = await _accountService.UpdateAccountAsync(id, currentUserId, request);
        if (!result.Success)
            return StatusCode(result.StatusCode, new { message = result.Message, errors = result.Errors });

        return Ok(result.Account);
    }

    // PATCH: api/accounts/{id}/role
    [HttpPatch("{id}/role")]
    public async Task<IActionResult> ChangeRole(string id, [FromBody] ChangeRoleRequest request)
    {
        var updated = await _accountService.ChangeRoleAsync(id, request.Role);
        if (updated == null)
            return NotFound();

        return Ok(updated);
    }

    // PATCH: api/accounts/{id}/active
    [HttpPatch("{id}/active")]
    public async Task<IActionResult> ToggleActive(string id, [FromBody] ToggleActiveRequest request)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var result = await _accountService.ToggleActiveAsync(id, currentUserId, request.IsActive);
        if (!result.Success)
            return StatusCode(result.StatusCode, new { message = result.Message });

        return Ok(result.Account);
    }

    // DELETE: api/accounts/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAccount(string id)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var result = await _accountService.DeleteAccountAsync(id, currentUserId);
        if (!result.Success)
            return StatusCode(result.StatusCode, new { message = result.Message, errors = result.Errors });

        return NoContent();
    }
}