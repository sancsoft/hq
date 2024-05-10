using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using HQ.Server.Data.Models;

namespace HQ.Server.Data.Configuration;

public class TimeConfiguration : BaseConfiguration<Time>
{
    public override void Configure(EntityTypeBuilder<Time> builder)
    {
        base.Configure(builder);

        builder.ToTable("times");
    }
}