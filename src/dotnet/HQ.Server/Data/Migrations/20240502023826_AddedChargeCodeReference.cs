using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HQ.Server.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddedChargeCodeReference : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_charge_codes_services_service_id",
                table: "charge_codes");

            migrationBuilder.DropForeignKey(
                name: "fk_projects_staff_project_manager_id",
                table: "projects");

            migrationBuilder.DropIndex(
                name: "ix_charge_codes_project_id",
                table: "charge_codes");

            migrationBuilder.DropIndex(
                name: "ix_charge_codes_quote_id",
                table: "charge_codes");

            migrationBuilder.DropIndex(
                name: "ix_charge_codes_service_id",
                table: "charge_codes");

            migrationBuilder.RenameColumn(
                name: "service_id",
                table: "charge_codes",
                newName: "service_agreement_id");

            migrationBuilder.AlterColumn<Guid>(
                name: "project_manager_id",
                table: "projects",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.CreateIndex(
                name: "ix_charge_codes_project_id",
                table: "charge_codes",
                column: "project_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_charge_codes_quote_id",
                table: "charge_codes",
                column: "quote_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_charge_codes_service_agreement_id",
                table: "charge_codes",
                column: "service_agreement_id",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "fk_charge_codes_service_agreements_service_agreement_id",
                table: "charge_codes",
                column: "service_agreement_id",
                principalTable: "service_agreements",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "fk_projects_staff_project_manager_id",
                table: "projects",
                column: "project_manager_id",
                principalTable: "staff",
                principalColumn: "id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_charge_codes_service_agreements_service_agreement_id",
                table: "charge_codes");

            migrationBuilder.DropForeignKey(
                name: "fk_projects_staff_project_manager_id",
                table: "projects");

            migrationBuilder.DropIndex(
                name: "ix_charge_codes_project_id",
                table: "charge_codes");

            migrationBuilder.DropIndex(
                name: "ix_charge_codes_quote_id",
                table: "charge_codes");

            migrationBuilder.DropIndex(
                name: "ix_charge_codes_service_agreement_id",
                table: "charge_codes");

            migrationBuilder.RenameColumn(
                name: "service_agreement_id",
                table: "charge_codes",
                newName: "service_id");

            migrationBuilder.AlterColumn<Guid>(
                name: "project_manager_id",
                table: "projects",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "ix_charge_codes_project_id",
                table: "charge_codes",
                column: "project_id");

            migrationBuilder.CreateIndex(
                name: "ix_charge_codes_quote_id",
                table: "charge_codes",
                column: "quote_id");

            migrationBuilder.CreateIndex(
                name: "ix_charge_codes_service_id",
                table: "charge_codes",
                column: "service_id");

            migrationBuilder.AddForeignKey(
                name: "fk_charge_codes_services_service_id",
                table: "charge_codes",
                column: "service_id",
                principalTable: "services",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "fk_projects_staff_project_manager_id",
                table: "projects",
                column: "project_manager_id",
                principalTable: "staff",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
