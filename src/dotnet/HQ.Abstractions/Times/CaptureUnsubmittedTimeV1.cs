namespace HQ.Abstractions.Times;

public class CaptureUnsubmittedTimeV1
{
    public class Request
    {
        public DateOnly? From { get; set; }
        public DateOnly? To { get; set; }
    }

    public class Response
    {
        public int Captured { get; set; }
    }
}