using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HQ.Server.Data.Migrations
{
    /// <inheritdoc />
    public partial class CompleteInactiveQuotesChargeCodes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("UPDATE projects p SET status = 7 FROM charge_codes c WHERE p.id = c.project_id AND c.active = false");
            migrationBuilder.Sql("UPDATE quotes q SET status = 7 FROM charge_codes c WHERE q.id = c.quote_id AND c.active = false");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}