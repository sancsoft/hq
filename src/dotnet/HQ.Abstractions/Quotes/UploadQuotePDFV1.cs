namespace HQ.Abstractions.Quotes;

public class UploadQuotePDFV1
{
    public class Request
    {
        public Guid Id { get; set; }
        public string? ContentType { get; set; }
        public Stream? File { get; set; }
    }

    public class Response
    {
    }
}