using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HQ.Server.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddIndexTimeChargeCodeIdHoursHoursApproved : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_times_charge_code_id",
                table: "times");

            migrationBuilder.CreateIndex(
                name: "idx_time_chargecodeid_hours_hoursapproved",
                table: "times",
                columns: new[] { "charge_code_id", "hours", "hours_approved" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "idx_time_chargecodeid_hours_hoursapproved",
                table: "times");

            migrationBuilder.CreateIndex(
                name: "ix_times_charge_code_id",
                table: "times",
                column: "charge_code_id");
        }
    }
}
