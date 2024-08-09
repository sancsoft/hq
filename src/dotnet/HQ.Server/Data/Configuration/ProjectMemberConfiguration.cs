using HQ.Server.Data.Models;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HQ.Server.Data.Configuration;

public class ProjectMemberConfiguration : BaseConfiguration<ProjectMember>
{
    public override void Configure(EntityTypeBuilder<ProjectMember> builder)
    {
        base.Configure(builder);

        builder.ToTable("project_members");

        builder.HasIndex(t => new { t.ProjectId, t.StaffId })
            .IsUnique();
    }
}