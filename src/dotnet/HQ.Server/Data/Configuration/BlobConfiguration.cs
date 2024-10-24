using HQ.Server.Data.Models;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HQ.Server.Data.Configuration;

public class BlobConfiguration : BaseConfiguration<Blob>
{
    public override void Configure(EntityTypeBuilder<Blob> builder)
    {
        base.Configure(builder);

        builder.ToTable("blobs");

        builder.Property(t => t.ETag).HasColumnName("etag");

        builder.HasIndex(t => t.Key)
            .IsUnique();
    }
}