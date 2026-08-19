using Microsoft.EntityFrameworkCore;
using ReactFormApi.Models;

namespace ReactFormApi.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users { get; set; }

    public DbSet<Education> Educations { get; set; }
}