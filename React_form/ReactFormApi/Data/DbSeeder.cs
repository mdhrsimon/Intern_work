using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using ReactFormApi.Models;

namespace ReactFormApi.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var configuration = scope.ServiceProvider.GetRequiredService<IConfiguration>();
        var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("DbSeeder");

        // 1. Ensure all required roles exist (keep existing roles – do not remove any)
        foreach (var role in new[] { "Admin", "Staff", "Teacher", "Student", "User" })
        {
            if (!await roleManager.RoleExistsAsync(role))
                await roleManager.CreateAsync(new IdentityRole(role));
        }

        // 2. Seed Admin account from configuration
        var adminEmail = configuration["Seed:AdminEmail"];
        var adminPassword = configuration["Seed:AdminPassword"];

        if (string.IsNullOrWhiteSpace(adminEmail) || string.IsNullOrWhiteSpace(adminPassword))
        {
            logger.LogWarning("Admin credentials ('Seed:AdminEmail' / 'Seed:AdminPassword') not configured. Skipping admin account creation.");
            return;
        }

        await EnsureAdminAsync(userManager, adminEmail, adminPassword, "Administrator");
    }

    private static async Task EnsureAdminAsync(
        UserManager<ApplicationUser> userManager,
        string email, string password, string fullName)
    {
        var existing = await userManager.FindByEmailAsync(email);
        if (existing != null)
        {
            if (!existing.LockoutEnabled)
            {
                existing.LockoutEnabled = true;
                await userManager.UpdateAsync(existing);
            }

            // Make sure admin role is assigned
            if (!await userManager.IsInRoleAsync(existing, "Admin"))
                await userManager.AddToRoleAsync(existing, "Admin");
            return;
        }

        var admin = new ApplicationUser
        {
            UserName = email,
            Email = email,
            FullName = fullName,
            EmailConfirmed = true,
            IsActive = true,
            LockoutEnabled = true
        };

        var result = await userManager.CreateAsync(admin, password);
        if (result.Succeeded)
            await userManager.AddToRoleAsync(admin, "Admin");
    }
}