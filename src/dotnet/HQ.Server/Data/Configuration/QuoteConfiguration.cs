using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using HQ.Server.Data.Models;

namespace HQ.Server.Data.Configuration;

public class QuoteConfiguration : BaseConfiguration<Quote>
{
    public override void Configure(EntityTypeBuilder<Quote> builder)
    {
        base.Configure(builder);

        builder.ToTable("quotes");

        builder.HasIndex(t => t.QuoteNumber)
            .IsUnique();
    }
}