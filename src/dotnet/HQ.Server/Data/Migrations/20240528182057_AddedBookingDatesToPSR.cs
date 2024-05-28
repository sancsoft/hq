using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HQ.Server.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddedBookingDatesToPSR : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateOnly>(
                name: "booking_end_date",
                table: "project_status_reports",
                type: "date",
                nullable: false,
                defaultValue: new DateOnly(1, 1, 1));

            migrationBuilder.AddColumn<int>(
                name: "booking_period",
                table: "project_status_reports",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateOnly>(
                name: "booking_start_date",
                table: "project_status_reports",
                type: "date",
                nullable: false,
                defaultValue: new DateOnly(1, 1, 1));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "booking_end_date",
                table: "project_status_reports");

            migrationBuilder.DropColumn(
                name: "booking_period",
                table: "project_status_reports");

            migrationBuilder.DropColumn(
                name: "booking_start_date",
                table: "project_status_reports");
        }
    }
}
