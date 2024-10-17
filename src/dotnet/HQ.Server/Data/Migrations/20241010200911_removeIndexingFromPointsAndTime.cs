using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HQ.Server.Data.Migrations
{
    /// <inheritdoc />
    public partial class removeIndexingFromPointsAndTime : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "idx_time_chargecodeid_hours_hoursapproved",
                table: "times");

            migrationBuilder.DropIndex(
                name: "idx_point_staffId_date",
                table: "points");

            migrationBuilder.CreateIndex(
                name: "ix_times_charge_code_id",
                table: "times",
                column: "charge_code_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_times_charge_code_id",
                table: "times");

            migrationBuilder.CreateIndex(
                name: "idx_time_chargecodeid_hours_hoursapproved",
                table: "times",
                columns: new[] { "charge_code_id", "hours", "hours_approved" });

            migrationBuilder.CreateIndex(
                name: "idx_point_staffId_date",
                table: "points",
                columns: new[] { "staff_id", "date" });
        }
    }
}