using HQ.Server.Data.Models;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HQ.Server.Data.Configuration;

public class ProjectStatusReportConfiguration : BaseConfiguration<ProjectStatusReport>
{
    public override void Configure(EntityTypeBuilder<ProjectStatusReport> builder)
    {
        base.Configure(builder);

        builder.ToTable("project_status_reports");

        builder
            .HasIndex(p => new { p.ProjectId, p.StartDate, p.EndDate })
            .IsDescending([false, true, true]);
    }
}