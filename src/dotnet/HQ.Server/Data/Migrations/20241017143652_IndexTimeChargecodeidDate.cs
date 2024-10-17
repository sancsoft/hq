using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HQ.Server.Data.Migrations
{
    /// <inheritdoc />
    public partial class IndexTimeChargecodeidDate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "idx_time_chargecodeid__date",
                table: "times",
                columns: new[] { "charge_code_id", "date" })
                .Annotation("Npgsql:IndexInclude", new[] { "hours", "hours_approved" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "idx_time_chargecodeid__date",
                table: "times");
        }
    }
}
