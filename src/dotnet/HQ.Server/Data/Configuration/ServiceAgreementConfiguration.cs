using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using HQ.Server.Data.Models;

namespace HQ.Server.Data.Configuration;

public class ServiceAgreementConfiguration : BaseConfiguration<ServiceAgreement>
{
    public override void Configure(EntityTypeBuilder<ServiceAgreement> builder)
    {
        base.Configure(builder);

        builder.ToTable("service_agreements");

        builder.HasIndex(t => t.ServiceNumber)
            .IsUnique();
    }
}