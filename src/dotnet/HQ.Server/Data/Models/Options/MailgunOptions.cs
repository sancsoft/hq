using System.ComponentModel.DataAnnotations;

namespace HQ.Server.Data.Models;

public class MailgunOptions
{
    [Required]
    public string ApiKey { get; set; } = null!;
    [Required]
    public string Domain { get; set; } = null!;
    [Required]
    public string BaseUri { get; set; } = null!;
    [Required]
    public string FromDisplayName { get; set; } = null!;
}