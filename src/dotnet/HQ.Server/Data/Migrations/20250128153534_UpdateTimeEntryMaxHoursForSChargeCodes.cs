using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HQ.Server.Data.Migrations
{
    /// <inheritdoc />
    public partial class UpdateTimeEntryMaxHoursForSChargeCodes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
            UPDATE ""projects"" AS p
            SET ""time_entry_max_hours"" = 24
            FROM ""charge_codes"" AS c
            WHERE p.""id"" = c.""project_id""
            AND c.""code"" LIKE 'S%';
        ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
