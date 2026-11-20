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

        // NEW: optional demo data, only when "Seed:DemoUsers" is "true" (keep it off in production)
        if (configuration["Seed:DemoUsers"] == "true")
            await SeedDemoUsersAsync(userManager, logger);

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

    // NEW: creates 8 staff + 22 students. Safe to run many times: existing emails are skipped.
    private static async Task SeedDemoUsersAsync(
        UserManager<ApplicationUser> userManager,
        ILogger logger)
    {
        // Must satisfy your Identity rules in Program.cs: min length 8, at least one digit
        const string demoPassword = "Demo@1234";

        var staffNames = new[]
        {
            "Ramesh Sharma", "Sita Adhikari", "Bikash Thapa", "Anita Gurung",
            "Prakash Koirala", "Sunita Rai", "Dipesh Karki", "Mina Shrestha"
        };

        var studentNames = new[]
        {
            "Aarav Poudel", "Binita Magar", "Kiran Basnet", "Nisha Tamang",
            "Rohan Khadka", "Sabina Joshi", "Suraj Bhandari", "Pooja Acharya",
            "Anil Dahal", "Smriti Lama", "Bibek Subedi", "Rina Maharjan",
            "Sandesh Pandey", "Kritika Neupane", "Utsav Regmi", "Manisha Bhattarai",
            "Rajan Ghimire", "Samikshya Khatri", "Nabin Chaudhary", "Asmita Silwal",
            "Yubraj Oli", "Prerana Dhakal"
        };

        var created = 0;

        for (var i = 0; i < staffNames.Length; i++)
        {
            if (await CreateDemoUserAsync(userManager, logger,
                    $"staff{i + 1:00}@example.com", staffNames[i], demoPassword, "Staff"))
                created++;
        }

        for (var i = 0; i < studentNames.Length; i++)
        {
            if (await CreateDemoUserAsync(userManager, logger,
                    $"student{i + 1:00}@example.com", studentNames[i], demoPassword, "Student"))
                created++;
        }

        logger.LogInformation("Demo user seeding finished. {Created} new users created.", created);
    }

    private static async Task<bool> CreateDemoUserAsync(
        UserManager<ApplicationUser> userManager,
        ILogger logger,
        string email, string fullName, string password, string role)
    {
        if (await userManager.FindByEmailAsync(email) != null)
            return false; // already exists, skip

        var user = new ApplicationUser
        {
            UserName = email,
            Email = email,
            FullName = fullName,
            EmailConfirmed = true,
            IsActive = true,
            LockoutEnabled = true
        };

        // CreateAsync hashes the password with Identity's PasswordHasher
        var result = await userManager.CreateAsync(user, password);
        if (!result.Succeeded)
        {
            logger.LogWarning("Could not create demo user {Email}: {Errors}",
                email, string.Join("; ", result.Errors.Select(e => e.Description)));
            return false;
        }

        await userManager.AddToRoleAsync(user, role);
        return true;
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