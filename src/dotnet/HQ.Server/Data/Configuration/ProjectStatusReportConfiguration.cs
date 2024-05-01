using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using HQ.Server.Data.Models;

namespace HQ.Server.Data.Configuration;

public class ProjectStatusReportConfiguration : BaseConfiguration<ProjectStatusReport>
{
    public override void Configure(EntityTypeBuilder<ProjectStatusReport> builder)
    {
        base.Configure(builder);

        builder.ToTable("project_status_reports");
    }
}