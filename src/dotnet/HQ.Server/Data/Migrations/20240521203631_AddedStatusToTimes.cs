using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HQ.Server.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddedStatusToTimes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "status",
                table: "times",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "status",
                table: "times");
        }
    }
}
