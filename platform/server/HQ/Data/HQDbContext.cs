using HQ.Data.Models;
using Microsoft.AspNetCore.DataProtection.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System.Reflection;

namespace HQ.Data;

public class HQDbContext : IdentityDbContext<User, Role, Guid, UserClaim, UserRole, UserLogin, RoleClaim, UserToken>, IDataProtectionKeyContext
{
    public HQDbContext(DbContextOptions<HQDbContext> options)
        : base(options)
    {
    }

    public DbSet<DataProtectionKey> DataProtectionKeys { get; set; } = null!;
    public DbSet<OpenIddictApplication> OpenIddictApplications { get; set; } = null!;
    public DbSet<OpenIddictAuthorization> OpenIddictAuthorizations { get; set; } = null!;
    public DbSet<OpenIddictScope> OpenIddictScopes { get; set; } = null!;
    public DbSet<OpenIddictToken> OpenIddictTokens { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
    }
}
