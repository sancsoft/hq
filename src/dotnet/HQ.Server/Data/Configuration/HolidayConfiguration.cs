using HQ.Server.Data.Models;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HQ.Server.Data.Configuration;

public class HolidayConfiguration : BaseConfiguration<Holiday>
{
    public override void Configure(EntityTypeBuilder<Holiday> builder)
    {
        base.Configure(builder);

        builder.ToTable("holidays");
    }
}