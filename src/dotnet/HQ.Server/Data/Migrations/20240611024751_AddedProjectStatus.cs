using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HQ.Server.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddedProjectStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "status",
                table: "projects",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.Sql("UPDATE projects p SET status = 5 FROM charge_codes c WHERE p.id = c.project_id AND c.code LIKE 'Q%'");
            migrationBuilder.Sql("UPDATE projects p SET status = 6 FROM charge_codes c WHERE p.id = c.project_id AND c.code LIKE 'P%'");
            migrationBuilder.Sql("UPDATE projects p SET status = 6 FROM charge_codes c WHERE p.id = c.project_id AND c.code LIKE 'S%'");
            migrationBuilder.Sql("UPDATE project_status_reports psr SET status = p.status FROM projects p WHERE p.id = psr.project_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "status",
                table: "projects");
        }
    }
}
