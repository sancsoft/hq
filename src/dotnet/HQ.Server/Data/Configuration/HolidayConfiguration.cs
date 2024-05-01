using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using HQ.Server.Data.Models;

namespace HQ.Server.Data.Configuration;

public class HolidayConfiguration : BaseConfiguration<Holiday>
{
    public override void Configure(EntityTypeBuilder<Holiday> builder)
    {
        base.Configure(builder);

        builder.ToTable("holidays");
    }
}