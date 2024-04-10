using Microsoft.EntityFrameworkCore;
using System.Reflection;

namespace HQ.Server.Data
{
    public class HQDbContext : DbContext
    {
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
