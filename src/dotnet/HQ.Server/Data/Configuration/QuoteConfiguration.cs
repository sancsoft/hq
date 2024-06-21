using HQ.Server.Data.Models;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

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