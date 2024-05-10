using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using HQ.Server.Data.Models;

namespace HQ.Server.Data.Configuration;

public class UserConfiguration : BaseConfiguration<User>
{
    public override void Configure(EntityTypeBuilder<User> builder)
    {
        base.Configure(builder);

        builder.ToTable("users");

        builder.HasIndex(t => t.EmailAddress)
            .IsUnique();
    }
}