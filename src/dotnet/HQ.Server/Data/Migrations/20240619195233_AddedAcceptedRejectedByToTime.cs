using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HQ.Server.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddedAcceptedRejectedByToTime : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "accepted_at",
                table: "times",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "accepted_by_id",
                table: "times",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "rejected_at",
                table: "times",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "rejected_by_id",
                table: "times",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "ix_times_accepted_by_id",
                table: "times",
                column: "accepted_by_id");

            migrationBuilder.CreateIndex(
                name: "ix_times_rejected_by_id",
                table: "times",
                column: "rejected_by_id");

            migrationBuilder.AddForeignKey(
                name: "fk_times_staff_accepted_by_id",
                table: "times",
                column: "accepted_by_id",
                principalTable: "staff",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "fk_times_staff_rejected_by_id",
                table: "times",
                column: "rejected_by_id",
                principalTable: "staff",
                principalColumn: "id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_times_staff_accepted_by_id",
                table: "times");

            migrationBuilder.DropForeignKey(
                name: "fk_times_staff_rejected_by_id",
                table: "times");

            migrationBuilder.DropIndex(
                name: "ix_times_accepted_by_id",
                table: "times");

            migrationBuilder.DropIndex(
                name: "ix_times_rejected_by_id",
                table: "times");

            migrationBuilder.DropColumn(
                name: "accepted_at",
                table: "times");

            migrationBuilder.DropColumn(
                name: "accepted_by_id",
                table: "times");

            migrationBuilder.DropColumn(
                name: "rejected_at",
                table: "times");

            migrationBuilder.DropColumn(
                name: "rejected_by_id",
                table: "times");
        }
    }
}
