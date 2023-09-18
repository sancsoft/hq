using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using OpenIddict.EntityFrameworkCore.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HQ.Data.Models
{
    public class OpenIddictScope : OpenIddictEntityFrameworkCoreScope<Guid>
    {
        public class Map : IEntityTypeConfiguration<OpenIddictScope>
        {
            public void Configure(EntityTypeBuilder<OpenIddictScope> builder)
            {
                builder.ToTable("openiddict_scopes");
            }
        }
    }
}
