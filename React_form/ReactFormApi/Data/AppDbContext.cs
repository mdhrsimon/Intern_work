using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using ReactFormApi.Models;

namespace ReactFormApi.Data;

// IdentityDbContext = your tables + Identity tables (login users, roles, ...)
public class AppDbContext : IdentityDbContext<ApplicationUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    // Form submissions
    public new DbSet<User> Users { get; set; }

    public DbSet<Education> Educations { get; set; }

    // Class / Channel Management & Assignments
    public DbSet<ClassChannel> ClassChannels { get; set; }
    public DbSet<ClassEnrollment> ClassEnrollments { get; set; }

    // Assignments
    public DbSet<Assignment> Assignments { get; set; }
    public DbSet<AssignmentSubmission> AssignmentSubmissions { get; set; }
    public DbSet<AssignmentAttachment> AssignmentAttachments { get; set; }
    public DbSet<SubmissionFile> SubmissionFiles { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // ClassEnrollment configuration
        builder.Entity<ClassEnrollment>(entity =>
        {
            entity.HasIndex(e => new { e.ClassChannelId, e.ApplicationUserId })
                .IsUnique();

            entity.HasOne(e => e.ClassChannel)
                .WithMany(c => c.Enrollments)
                .HasForeignKey(e => e.ClassChannelId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.ApplicationUser)
                .WithMany()
                .HasForeignKey(e => e.ApplicationUserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Assignment configuration
        builder.Entity<Assignment>(entity =>
        {
            entity.HasOne(a => a.ClassChannel)
                .WithMany()
                .HasForeignKey(a => a.ClassChannelId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(a => a.CreatedBy)
                .WithMany()
                .HasForeignKey(a => a.CreatedByUserId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        // AssignmentSubmission configuration
        builder.Entity<AssignmentSubmission>(entity =>
        {
            // One submission per student per assignment
            entity.HasIndex(s => new { s.AssignmentId, s.StudentUserId }).IsUnique();

            entity.HasOne(s => s.Assignment)
                .WithMany(a => a.Submissions)
                .HasForeignKey(s => s.AssignmentId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(s => s.Student)
                .WithMany()
                .HasForeignKey(s => s.StudentUserId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        // AssignmentAttachment configuration
        builder.Entity<AssignmentAttachment>(entity =>
        {
            entity.HasOne(a => a.Assignment)
                .WithMany(a => a.Attachments)
                .HasForeignKey(a => a.AssignmentId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(a => a.UploadedBy)
                .WithMany()
                .HasForeignKey(a => a.UploadedByUserId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        // SubmissionFile configuration
        builder.Entity<SubmissionFile>(entity =>
        {
            entity.HasOne(f => f.AssignmentSubmission)
                .WithMany(s => s.Files)
                .HasForeignKey(f => f.AssignmentSubmissionId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}