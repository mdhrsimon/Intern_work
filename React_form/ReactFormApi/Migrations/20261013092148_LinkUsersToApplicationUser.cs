using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ReactFormApi.Migrations
{
    /// <inheritdoc />
    public partial class LinkUsersToApplicationUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                UPDATE Users
                SET ApplicationUserId = NULL
                WHERE ApplicationUserId IS NOT NULL
                  AND ApplicationUserId NOT IN (SELECT Id FROM AspNetUsers);
            ");

            migrationBuilder.AddForeignKey(
                name: "FK_Users_AspNetUsers_ApplicationUserId",
                table: "Users",
                column: "ApplicationUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Users_AspNetUsers_ApplicationUserId",
                table: "Users");
        }
    }
}
