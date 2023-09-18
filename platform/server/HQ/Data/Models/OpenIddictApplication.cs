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
    public class OpenIddictApplication : OpenIddictEntityFrameworkCoreApplication<Guid, OpenIddictAuthorization, OpenIddictToken>
    {
        public class Map : IEntityTypeConfiguration<OpenIddictApplication>
        {
            public void Configure(EntityTypeBuilder<OpenIddictApplication> builder)
            {
                builder.ToTable("openiddict_applications");
            }
        }
    }
}
