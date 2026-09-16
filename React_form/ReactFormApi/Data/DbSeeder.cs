using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using ReactFormApi.Models;

namespace ReactFormApi.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();

        // 1. Ensure all required roles exist (keep existing roles – do not remove any)
        foreach (var role in new[] { "Admin", "Staff", "Teacher", "Student", "User" })
        {
            if (!await roleManager.RoleExistsAsync(role))
                await roleManager.CreateAsync(new IdentityRole(role));
        }

        // 2. Seed one Admin account only
        await EnsureAdminAsync(userManager, "admin@gmail.com", "Admin@123", "Administrator");
    }

    private static async Task EnsureAdminAsync(
        UserManager<ApplicationUser> userManager,
        string email, string password, string fullName)
    {
        var existing = await userManager.FindByEmailAsync(email);
        if (existing != null)
        {
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
            IsActive = true
        };

        var result = await userManager.CreateAsync(admin, password);
        if (result.Succeeded)
            await userManager.AddToRoleAsync(admin, "Admin");
    }
}