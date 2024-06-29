namespace HQ.Abstractions.Quotes;

public class GetQuotePDFV1
{
    public class Request
    {
        public Guid Id { get; set; }
    }

    public class Response
    {
        public Stream File { get; set; } = null!;
        public string FileName { get; set; } = null!;
        public string ContentType { get; set; } = null!;
    }
}