using HQ.Server.Data.Models;
using Microsoft.EntityFrameworkCore;
using System.Reflection;

namespace HQ.Server.Data
{
    public class HQDbContext : DbContext
    {
        public DbSet<Client> Clients { get; set; } = null!;

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
