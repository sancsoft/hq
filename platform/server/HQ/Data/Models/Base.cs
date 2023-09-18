using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HQ.Data.Models
{
    public abstract class Base
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        public abstract class Map<T> : IEntityTypeConfiguration<T> where T : Base
        {
            public virtual void Configure(EntityTypeBuilder<T> builder)
            {
                builder.HasKey(t => t.Id);
            }
        }
    }
}
