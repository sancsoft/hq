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
    public class OpenIddictAuthorization : OpenIddictEntityFrameworkCoreAuthorization<Guid, OpenIddictApplication, OpenIddictToken>
    {
        public class Map : IEntityTypeConfiguration<OpenIddictAuthorization>
        {
            public void Configure(EntityTypeBuilder<OpenIddictAuthorization> builder)
            {
                builder.ToTable("openiddict_authorizations");
            }
        }
    }
}
