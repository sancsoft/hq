using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using HQ.Server.Data.Models;

namespace HQ.Server.Data.Configuration;

public class PointConfiguration : BaseConfiguration<Point>
{
    public override void Configure(EntityTypeBuilder<Point> builder)
    {
        base.Configure(builder);

        builder.ToTable("points");
    }
}