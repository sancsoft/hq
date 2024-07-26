using System;

using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HQ.Server.Data.Migrations
{
    /// <inheritdoc />
    public partial class NullableRelationTimeHolidayAdded : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "holiday_id",
                table: "times",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "ix_times_holiday_id",
                table: "times",
                column: "holiday_id");

            migrationBuilder.AddForeignKey(
                name: "fk_times_holidays_holiday_id",
                table: "times",
                column: "holiday_id",
                principalTable: "holidays",
                principalColumn: "id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_times_holidays_holiday_id",
                table: "times");

            migrationBuilder.DropIndex(
                name: "ix_times_holiday_id",
                table: "times");

            migrationBuilder.DropColumn(
                name: "holiday_id",
                table: "times");
        }
    }
}
