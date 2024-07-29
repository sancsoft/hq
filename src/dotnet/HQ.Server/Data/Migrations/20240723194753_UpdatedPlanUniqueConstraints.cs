using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HQ.Server.Data.Migrations
{
    /// <inheritdoc />
    public partial class UpdatedPlanUniqueConstraints : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_plans_date",
                table: "plans");

            migrationBuilder.DropIndex(
                name: "ix_plans_staff_id",
                table: "plans");

            migrationBuilder.CreateIndex(
                name: "ix_plans_staff_id_date",
                table: "plans",
                columns: new[] { "staff_id", "date" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_plans_staff_id_date",
                table: "plans");

            migrationBuilder.CreateIndex(
                name: "ix_plans_date",
                table: "plans",
                column: "date",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_plans_staff_id",
                table: "plans",
                column: "staff_id");
        }
    }
}