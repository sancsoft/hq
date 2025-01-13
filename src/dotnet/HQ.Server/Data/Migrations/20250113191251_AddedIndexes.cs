using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HQ.Server.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddedIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_times_charge_code_id",
                table: "times");

            migrationBuilder.DropIndex(
                name: "ix_projects_client_id",
                table: "projects");

            migrationBuilder.DropIndex(
                name: "ix_project_status_reports_project_id",
                table: "project_status_reports");

            migrationBuilder.CreateIndex(
                name: "ix_times_charge_code_id_date",
                table: "times",
                columns: new[] { "charge_code_id", "date" },
                descending: new[] { false, true })
                .Annotation("Npgsql:IndexInclude", new[] { "hours", "hours_approved" });

            migrationBuilder.CreateIndex(
                name: "ix_times_charge_code_id_status_date",
                table: "times",
                columns: new[] { "charge_code_id", "status", "date" },
                descending: new[] { false, false, true });

            migrationBuilder.CreateIndex(
                name: "ix_times_date",
                table: "times",
                column: "date",
                descending: new bool[0]);

            migrationBuilder.CreateIndex(
                name: "ix_projects_client_id_project_manager_id",
                table: "projects",
                columns: new[] { "client_id", "project_manager_id" });

            migrationBuilder.CreateIndex(
                name: "ix_project_status_reports_project_id_start_date_end_date",
                table: "project_status_reports",
                columns: new[] { "project_id", "start_date", "end_date" },
                descending: new[] { false, true, true });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_times_charge_code_id_date",
                table: "times");

            migrationBuilder.DropIndex(
                name: "ix_times_charge_code_id_status_date",
                table: "times");

            migrationBuilder.DropIndex(
                name: "ix_times_date",
                table: "times");

            migrationBuilder.DropIndex(
                name: "ix_projects_client_id_project_manager_id",
                table: "projects");

            migrationBuilder.DropIndex(
                name: "ix_project_status_reports_project_id_start_date_end_date",
                table: "project_status_reports");

            migrationBuilder.CreateIndex(
                name: "ix_times_charge_code_id",
                table: "times",
                column: "charge_code_id");

            migrationBuilder.CreateIndex(
                name: "ix_projects_client_id",
                table: "projects",
                column: "client_id");

            migrationBuilder.CreateIndex(
                name: "ix_project_status_reports_project_id",
                table: "project_status_reports",
                column: "project_id");
        }
    }
}
