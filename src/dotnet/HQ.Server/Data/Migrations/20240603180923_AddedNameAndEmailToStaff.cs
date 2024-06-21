using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HQ.Server.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddedNameAndEmailToStaff : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_times_project_activity_activity_id",
                table: "times");

            migrationBuilder.AddColumn<string>(
                name: "email",
                table: "staff",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "first_name",
                table: "staff",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "last_name",
                table: "staff",
                type: "text",
                nullable: true);

            migrationBuilder.AddForeignKey(
                name: "fk_times_project_activities_activity_id",
                table: "times",
                column: "activity_id",
                principalTable: "project_activities",
                principalColumn: "id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_times_project_activities_activity_id",
                table: "times");

            migrationBuilder.DropColumn(
                name: "email",
                table: "staff");

            migrationBuilder.DropColumn(
                name: "first_name",
                table: "staff");

            migrationBuilder.DropColumn(
                name: "last_name",
                table: "staff");

            migrationBuilder.AddForeignKey(
                name: "fk_times_project_activity_activity_id",
                table: "times",
                column: "activity_id",
                principalTable: "project_activities",
                principalColumn: "id");
        }
    }
}