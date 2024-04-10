namespace HQ.Server.Data.Models;

public class Client : Base
{
    public string Name { get; set; } = null!;
    public string? OfficialName { get; set; }
    public string? BillingEmail { get; set; }
    public decimal? HourlyRate { get; set; }
}
