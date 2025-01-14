using HQ.Server.Data.Models;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HQ.Server.Data.Configuration;

public class TimeConfiguration : BaseConfiguration<Time>
{
    public override void Configure(EntityTypeBuilder<Time> builder)
    {
        base.Configure(builder);

        builder.ToTable("times");

        builder
            .HasIndex(t => t.Date)
            .IsDescending();

        builder
            .HasIndex(t => new { t.ChargeCodeId, t.Status, t.Date })
            .IsDescending([false, false, true]);

        builder
            .HasIndex(t => new { t.ChargeCodeId, t.Date })
            .IncludeProperties(t => new { t.Hours, t.HoursApproved })
            .IsDescending([false, true]);
    }
}