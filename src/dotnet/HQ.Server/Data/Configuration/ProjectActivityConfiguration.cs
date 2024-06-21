using HQ.Server.Data.Models;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HQ.Server.Data.Configuration;

public class ProjectActivityConfiguration : BaseConfiguration<ProjectActivity>
{
    public override void Configure(EntityTypeBuilder<ProjectActivity> builder)
    {
        base.Configure(builder);

        builder.ToTable("project_activities");

        builder.HasIndex(t => new { t.ProjectId, t.Name })
            .IsUnique();
    }
}