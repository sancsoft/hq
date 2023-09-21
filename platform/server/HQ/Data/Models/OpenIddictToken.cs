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
    public class OpenIddictToken : OpenIddictEntityFrameworkCoreToken<Guid, OpenIddictApplication, OpenIddictAuthorization>
    {
        public class Map : IEntityTypeConfiguration<OpenIddictToken>
        {
            public void Configure(EntityTypeBuilder<OpenIddictToken> builder)
            {
                builder.ToTable("openiddict_tokens");
            }
        }
    }
}
