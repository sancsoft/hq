namespace HQ.Abstractions.Emails;

public abstract class BaseEmail
{
    public string? Heading { get; set; }
    public string? Message { get; set; }
}