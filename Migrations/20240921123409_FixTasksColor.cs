using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace UI_USM_MVC.Migrations
{
    /// <inheritdoc />
    public partial class FixTasksColor : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "SectionColor",
                table: "Tasks",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SectionColor",
                table: "Tasks");
        }
    }
}
