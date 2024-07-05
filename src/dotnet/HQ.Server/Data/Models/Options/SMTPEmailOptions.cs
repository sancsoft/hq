using System.ComponentModel.DataAnnotations;

namespace HQ.Server.Data.Models;

public class SMTPEmailOptions
{
    public const string Email = nameof(Email);

    [Required]
    public string Server { get; set; } = null!;

    [Required]
    public int Port { get; set; }

    [Required]
    public string Account { get; set; } = null!;

    [Required]
    public string Password { get; set; } = null!;

    [Required]
    public string Sender { get; set; } = null!;

    [Required]
    public string From { get; set; } = null!;

    [Required]
    public string FromDisplayName { get; set; } = null!;

    [Required]
    public string ReplyTo { get; set; } = null!;

    public bool IsDebug { get; set; }
    public string? DebugAddress { get; set; }
}