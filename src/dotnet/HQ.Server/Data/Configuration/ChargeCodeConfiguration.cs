using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using HQ.Server.Data.Models;

namespace HQ.Server.Data.Configuration;

public class ChargeCodeConfiguration : BaseConfiguration<ChargeCode>
{
    public override void Configure(EntityTypeBuilder<ChargeCode> builder)
    {
        base.Configure(builder);

        builder.ToTable("charge_codes");

        builder.HasIndex(t => t.Code)
            .IsUnique();
    }
}