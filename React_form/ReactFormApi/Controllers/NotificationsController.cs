using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReactFormApi.DTOs.Notifications;
using ReactFormApi.Services;

namespace ReactFormApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _notificationService;

    public NotificationsController(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    /// <summary>
    /// Gets a paginated list of notifications for the currently logged-in user.
    /// </summary>
    /// <param name="page">Page number (default 1)</param>
    /// <param name="pageSize">Items per page (default 20)</param>
    /// <param name="unreadOnly">Filter to only unread notifications if true</param>
    /// <returns>Paged list of notifications</returns>
    [HttpGet]
    [ProducesResponseType(typeof(PagedNotificationsResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetNotifications(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] bool? unreadOnly = null)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(currentUserId)) return Unauthorized();

        var result = await _notificationService.GetNotificationsAsync(currentUserId, page, pageSize, unreadOnly);
        return Ok(result);
    }

    /// <summary>
    /// Gets the count of unread notifications for the currently logged-in user.
    /// </summary>
    /// <returns>Unread count object</returns>
    [HttpGet("unread-count")]
    [ProducesResponseType(typeof(UnreadCountDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetUnreadCount()
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(currentUserId)) return Unauthorized();

        var count = await _notificationService.GetUnreadCountAsync(currentUserId);
        return Ok(new UnreadCountDto { UnreadCount = count });
    }

    /// <summary>
    /// Marks a specific notification as read. Users may only mark their own notifications.
    /// </summary>
    /// <param name="id">Notification ID</param>
    /// <returns>Updated notification DTO</returns>
    [HttpPatch("{id}/read")]
    [ProducesResponseType(typeof(NotificationDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> MarkAsRead(int id)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(currentUserId)) return Unauthorized();

        var result = await _notificationService.MarkAsReadAsync(id, currentUserId);
        if (!result.Success)
        {
            return StatusCode(result.StatusCode, new { message = result.Message });
        }

        return Ok(result.Data);
    }

    /// <summary>
    /// Marks all unread notifications as read for the currently logged-in user.
    /// </summary>
    /// <returns>Summary of marked notifications</returns>
    [HttpPatch("read-all")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> MarkAllAsRead()
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(currentUserId)) return Unauthorized();

        var count = await _notificationService.MarkAllAsReadAsync(currentUserId);
        return Ok(new { message = "All notifications marked as read.", markedCount = count });
    }
}
