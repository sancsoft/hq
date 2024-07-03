namespace HQ.Email;

public class NotificationEmail : BaseEmail
{
    public string? Heading { get; set; }
    public string? Message { get; set; }
    public string? ButtonLabel { get; set; }
    public Uri? ButtonUrl { get; set; }

    public static NotificationEmail Sample = new()
    {
        Heading = "Notification",
        Message = "This is a notification message.",
        ButtonLabel = "Open HQ",
        ButtonUrl = new Uri("http://hq.localhost:4200")
    };
}