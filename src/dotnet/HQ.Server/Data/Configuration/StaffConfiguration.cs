using HQ.Server.Data.Models;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HQ.Server.Data.Configuration;

public class StaffConfiguration : BaseConfiguration<Staff>
{
    public override void Configure(EntityTypeBuilder<Staff> builder)
    {
        base.Configure(builder);

        builder.ToTable("staff");

        builder
            .HasMany(t => t.Times)
            .WithOne(s => s.Staff)
            .HasForeignKey(t => t.StaffId);

        builder
            .HasIndex(t => t.Name)
            .IsUnique();
    }
}