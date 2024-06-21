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
    }
}