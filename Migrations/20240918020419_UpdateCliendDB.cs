using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace UI_USM_MVC.Migrations
{
    /// <inheritdoc />
    public partial class UpdateCliendDB : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Address1",
                table: "Client",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "Address2",
                table: "Client",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "City",
                table: "Client",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<bool>(
                name: "Notification",
                table: "Client",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "PreferedNottification",
                table: "Client",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "State",
                table: "Client",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "Zip",
                table: "Client",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_Client_OrgId",
                table: "Client",
                column: "OrgId");

            migrationBuilder.AddForeignKey(
                name: "FK_Client_Organization_OrgId",
                table: "Client",
                column: "OrgId",
                principalTable: "Organization",
                principalColumn: "OrgId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Client_Organization_OrgId",
                table: "Client");

            migrationBuilder.DropIndex(
                name: "IX_Client_OrgId",
                table: "Client");

            migrationBuilder.DropColumn(
                name: "Address1",
                table: "Client");

            migrationBuilder.DropColumn(
                name: "Address2",
                table: "Client");

            migrationBuilder.DropColumn(
                name: "City",
                table: "Client");

            migrationBuilder.DropColumn(
                name: "Notification",
                table: "Client");

            migrationBuilder.DropColumn(
                name: "PreferedNottification",
                table: "Client");

            migrationBuilder.DropColumn(
                name: "State",
                table: "Client");

            migrationBuilder.DropColumn(
                name: "Zip",
                table: "Client");
        }
    }
}
