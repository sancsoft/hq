namespace HQ.Server.Data.Models;
public class EmailSettings
{
    public required string Host { get; set; }
    public required string Account { get; set; }
    public required string Password { get; set; }
    public required string Email { get; set; }
    public required string Protocol { get; set; }
    public int Port { get; set; }
}