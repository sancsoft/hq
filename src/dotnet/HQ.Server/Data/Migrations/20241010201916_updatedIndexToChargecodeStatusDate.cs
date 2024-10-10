using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HQ.Server.Data.Migrations
{
    /// <inheritdoc />
    public partial class updatedIndexToChargecodeStatusDate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "idx_time_status_date",
                table: "times");

            migrationBuilder.DropIndex(
                name: "ix_times_charge_code_id",
                table: "times");

            migrationBuilder.CreateIndex(
                name: "idx_time_chargecodeid_status_date",
                table: "times",
                columns: new[] { "charge_code_id", "status", "date" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "idx_time_chargecodeid_status_date",
                table: "times");

            migrationBuilder.CreateIndex(
                name: "idx_time_status_date",
                table: "times",
                columns: new[] { "status", "date" });

            migrationBuilder.CreateIndex(
                name: "ix_times_charge_code_id",
                table: "times",
                column: "charge_code_id");
        }
    }
}
