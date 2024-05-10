using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using HQ.Server.Data.Models;

namespace HQ.Server.Data.Configuration;

public class BookConfiguration : BaseConfiguration<Book>
{
    public override void Configure(EntityTypeBuilder<Book> builder)
    {
        base.Configure(builder);

        builder.ToTable("books");
    }
}