using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HQ.Server.Data.Migrations
{
    /// <inheritdoc />
    public partial class UpdateProjectTaskSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "require_task",
                table: "projects");

            migrationBuilder.AddColumn<int>(
                name: "task_requirement",
                table: "projects",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "task_requirement",
                table: "projects");

            migrationBuilder.AddColumn<bool>(
                name: "require_task",
                table: "projects",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }
    }
}