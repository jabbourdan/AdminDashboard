using Microsoft.EntityFrameworkCore;
using UI_USM_MVC.Models;
using UI_USM_MVC.ExternalService;
namespace UI_USM_MVC.Data
{
    public class ApplicationDbContext : DbContext
    {
        // Your DbSets and other configurations go here
        public DbSet<Events> Events { get; set; }
        public DbSet<Crew> Crew { get; set; }
        public DbSet<Client> Client { get; set; }
        public DbSet<Marketing> Marketing { get; set; }
        public DbSet<Organization> Organization { get; set; }
        public DbSet<Tasks> Tasks { get; set; }
        public DbSet<Services> Services { get; set; }

        public DbSet<Coupons> Coupons { get; set; }

        
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Events>()
                .HasKey(e => e.EventId);
            modelBuilder.Entity<Crew>()
                .HasKey(e => e.CrewId);
            modelBuilder.Entity<Client>()
                .HasKey(e => e.ClientId);
            modelBuilder.Entity<Organization>()
                .HasKey(e => e.OrgId);
            modelBuilder.Entity<Marketing>()
                .HasKey(e => e.AutoId);
            modelBuilder.Entity<Services>()
                .HasKey(e => e.ServicesId);
            modelBuilder.Entity<Tasks>()
                .HasKey(e => e.TaskId);
            modelBuilder.Entity<Coupons>()
                .HasKey(e => e.CouponId);
        }
        
    }
}
