using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HQ.Server.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddedProjectType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "type",
                table: "projects",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.Sql("UPDATE projects p SET type = 1 FROM charge_codes c WHERE p.id = c.project_id AND c.code LIKE 'S%'");
            migrationBuilder.Sql("UPDATE projects p SET type = 2 FROM charge_codes c WHERE p.id = c.project_id AND c.code LIKE 'P%'");
            migrationBuilder.Sql("UPDATE projects p SET type = 3 FROM charge_codes c WHERE p.id = c.project_id AND c.code LIKE 'Q%'");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "type",
                table: "projects");
        }
    }
}