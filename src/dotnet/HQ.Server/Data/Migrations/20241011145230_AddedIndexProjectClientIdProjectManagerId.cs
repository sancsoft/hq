using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HQ.Server.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddedIndexProjectClientIdProjectManagerId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_projects_client_id",
                table: "projects");

            migrationBuilder.CreateIndex(
                name: "idx_project_clientid_projectmanagerid",
                table: "projects",
                columns: new[] { "client_id", "project_manager_id" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "idx_project_clientid_projectmanagerid",
                table: "projects");

            migrationBuilder.CreateIndex(
                name: "ix_projects_client_id",
                table: "projects",
                column: "client_id");
        }
    }
}
