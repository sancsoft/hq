using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HQ.Server.Data.Migrations
{
    /// <inheritdoc />
    public partial class ProjectActivityCleanup : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "activity",
                table: "times");

            migrationBuilder.RenameColumn(
                name: "reference",
                table: "times",
                newName: "task");

            migrationBuilder.AddColumn<Guid>(
                name: "activity_id",
                table: "times",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "ix_times_activity_id",
                table: "times",
                column: "activity_id");

            migrationBuilder.AddForeignKey(
                name: "fk_times_project_activity_activity_id",
                table: "times",
                column: "activity_id",
                principalTable: "project_activities",
                principalColumn: "id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_times_project_activity_activity_id",
                table: "times");

            migrationBuilder.DropIndex(
                name: "ix_times_activity_id",
                table: "times");

            migrationBuilder.DropColumn(
                name: "activity_id",
                table: "times");

            migrationBuilder.RenameColumn(
                name: "task",
                table: "times",
                newName: "reference");

            migrationBuilder.AddColumn<string>(
                name: "activity",
                table: "times",
                type: "text",
                nullable: true);
        }
    }
}
