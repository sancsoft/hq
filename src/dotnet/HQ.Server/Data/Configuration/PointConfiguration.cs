using HQ.Server.Data.Models;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HQ.Server.Data.Configuration;

public class PointConfiguration : BaseConfiguration<Point>
{
    public override void Configure(EntityTypeBuilder<Point> builder)
    {
        base.Configure(builder);

        builder.ToTable("points");
    }
}