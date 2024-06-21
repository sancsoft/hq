using System.Reflection;

using HQ.Server.Data.Models;

using Microsoft.EntityFrameworkCore;

namespace HQ.Server.Data
{
    public class HQDbContext : DbContext
    {
        public DbSet<Book> Books { get; set; } = null!;
        public DbSet<ChargeCode> ChargeCodes { get; set; } = null!;
        public DbSet<Client> Clients { get; set; } = null!;
        public DbSet<Expense> Expenses { get; set; } = null!;
        public DbSet<Holiday> Holidays { get; set; } = null!;
        public DbSet<Invoice> Invoices { get; set; } = null!;
        public DbSet<Plan> Plans { get; set; } = null!;
        public DbSet<Point> Points { get; set; } = null!;
        public DbSet<Project> Projects { get; set; } = null!;
        public DbSet<ProjectActivity> ProjectActivities { get; set; } = null!;
        public DbSet<ProjectStatusReport> ProjectStatusReports { get; set; } = null!;
        public DbSet<Quote> Quotes { get; set; } = null!;
        public DbSet<Service> Services { get; set; } = null!;
        public DbSet<ServiceAgreement> ServiceAgreements { get; set; } = null!;
        public DbSet<Staff> Staff { get; set; } = null!;
        public DbSet<Time> Times { get; set; } = null!;

        public HQDbContext(DbContextOptions<HQDbContext> options)
            : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
        }
    }
}