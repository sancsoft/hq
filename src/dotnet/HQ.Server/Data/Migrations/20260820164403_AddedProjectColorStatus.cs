using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HQ.Server.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddedProjectColorStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "color_status",
                table: "projects",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "color_status",
                table: "project_status_reports",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "color_status",
                table: "projects");

            migrationBuilder.DropColumn(
                name: "color_status",
                table: "project_status_reports");
        }
    }
}