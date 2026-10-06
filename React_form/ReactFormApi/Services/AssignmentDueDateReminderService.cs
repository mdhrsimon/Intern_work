using Microsoft.EntityFrameworkCore;
using ReactFormApi.Constants;
using ReactFormApi.Data;
using ReactFormApi.Models;

namespace ReactFormApi.Services;

public class AssignmentDueDateReminderService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<AssignmentDueDateReminderService> _logger;
    private readonly TimeSpan _checkInterval = TimeSpan.FromMinutes(5);

    public AssignmentDueDateReminderService(
        IServiceScopeFactory scopeFactory,
        ILogger<AssignmentDueDateReminderService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("AssignmentDueDateReminderService started.");

        // Wait initial delay to allow migrations and startup to finish smoothly
        await Task.Delay(TimeSpan.FromSeconds(15), stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessUpcomingDueDatesAsync(stoppingToken);
            }
            catch (Exception ex) when (!stoppingToken.IsCancellationRequested)
            {
                _logger.LogError(ex, "Error occurred while executing AssignmentDueDateReminderService.");
            }

            try
            {
                await Task.Delay(_checkInterval, stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
        }

        _logger.LogInformation("AssignmentDueDateReminderService is stopping.");
    }

    private async Task ProcessUpcomingDueDatesAsync(CancellationToken stoppingToken)
    {
        using var scope = _scopeFactory.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var notificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();

        var now = DateTime.UtcNow;
        var reminderWindowEnd = now.AddHours(24);

        // Find assignments whose due date is within the next 24 hours and still in the future
        var upcomingAssignments = await context.Assignments
            .AsNoTracking()
            .Where(a => a.DueDate.HasValue && a.DueDate.Value > now && a.DueDate.Value <= reminderWindowEnd)
            .ToListAsync(stoppingToken);

        if (upcomingAssignments.Count == 0)
        {
            return;
        }

        foreach (var assignment in upcomingAssignments)
        {
            if (stoppingToken.IsCancellationRequested) break;

            // 1. All enrolled students in this class
            var enrolledStudentIds = await context.ClassEnrollments
                .AsNoTracking()
                .Where(e => e.ClassChannelId == assignment.ClassChannelId && e.RoleInClass == RoleConstants.Student)
                .Select(e => e.ApplicationUserId)
                .ToListAsync(stoppingToken);

            if (enrolledStudentIds.Count == 0) continue;

            // 2. Students who already turned in or have returned submissions
            var submittedStudentIds = await context.AssignmentSubmissions
                .AsNoTracking()
                .Where(s => s.AssignmentId == assignment.Id && (s.Status == "Turned In" || s.Status == "Returned"))
                .Select(s => s.StudentUserId)
                .ToListAsync(stoppingToken);

            // 3. Filter down to pending students (have not yet turned in)
            var pendingStudentIds = enrolledStudentIds.Except(submittedStudentIds).ToList();
            if (pendingStudentIds.Count == 0) continue;

            // 4. Prevent duplicate reminders: Check who has ALREADY received a DueDateReminder for this assignment
            var alreadyNotifiedStudentIds = await context.Notifications
                .AsNoTracking()
                .Where(n => n.AssignmentId == assignment.Id
                            && n.Type == NotificationType.DueDateReminder
                            && pendingStudentIds.Contains(n.RecipientId))
                .Select(n => n.RecipientId)
                .ToListAsync(stoppingToken);

            var studentsToRemind = pendingStudentIds.Except(alreadyNotifiedStudentIds).ToList();
            if (studentsToRemind.Count == 0) continue;

            var timeRemaining = assignment.DueDate!.Value - now;
            var hoursRemaining = Math.Max(1, (int)Math.Round(timeRemaining.TotalHours));

            await notificationService.CreateAndSendNotificationsAsync(
                studentsToRemind,
                NotificationType.DueDateReminder,
                $"Due Date Reminder: {assignment.Title}",
                $"'{assignment.Title}' is due in ~{hoursRemaining} hour(s) ({assignment.DueDate.Value:MMM dd, yyyy HH:mm} UTC). Please remember to submit your assignment.",
                assignment.ClassChannelId,
                assignment.Id);

            _logger.LogInformation(
                "Sent due date reminder for assignment {AssignmentId} to {Count} students.",
                assignment.Id,
                studentsToRemind.Count);
        }
    }
}
