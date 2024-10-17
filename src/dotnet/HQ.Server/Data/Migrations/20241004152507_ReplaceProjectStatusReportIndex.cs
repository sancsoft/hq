using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HQ.Server.Data.Migrations
{
    /// <inheritdoc />
    public partial class ReplaceProjectStatusReportIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "idx_psr_startdate_enddate",
                table: "project_status_reports");

            migrationBuilder.DropIndex(
                name: "ix_project_status_reports_project_id",
                table: "project_status_reports");

            migrationBuilder.CreateIndex(
                name: "idx_psr_projectid_startdate_enddate",
                table: "project_status_reports",
                columns: new[] { "project_id", "start_date", "end_date" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "idx_psr_projectid_startdate_enddate",
                table: "project_status_reports");

            migrationBuilder.CreateIndex(
                name: "idx_psr_startdate_enddate",
                table: "project_status_reports",
                columns: new[] { "start_date", "end_date" });

            migrationBuilder.CreateIndex(
                name: "ix_project_status_reports_project_id",
                table: "project_status_reports",
                column: "project_id");
        }
    }
}