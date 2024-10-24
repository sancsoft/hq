namespace HQ.Abstractions.Quotes;

public class UploadQuotePDFV1
{
    public class Request
    {
        public Guid Id { get; set; }
        public string ContentType { get; set; } = null!;
        public Stream File { get; set; } = null!;
    }

    public class Response
    {
    }
}