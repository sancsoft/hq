using HQ.Server.Data.Models;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HQ.Server.Data.Configuration;

public abstract class BaseConfiguration<T> : IEntityTypeConfiguration<T> where T : Base
{
    public virtual void Configure(EntityTypeBuilder<T> builder)
    {
        builder.HasKey(t => t.Id);
    }
}