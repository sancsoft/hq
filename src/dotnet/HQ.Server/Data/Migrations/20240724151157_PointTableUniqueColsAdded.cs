using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HQ.Server.Data.Migrations
{
    /// <inheritdoc />
    public partial class PointTableUniqueColsAdded : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_points_staff_id",
                table: "points");

            migrationBuilder.CreateIndex(
                name: "ix_points_staff_id_sequence_date",
                table: "points",
                columns: new[] { "staff_id", "sequence", "date" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_points_staff_id_sequence_date",
                table: "points");

            migrationBuilder.CreateIndex(
                name: "ix_points_staff_id",
                table: "points",
                column: "staff_id");
        }
    }
}