public class SubmitTimesV1
{
    public class Request
    {
        public required List<Guid> Ids { get; set; }
        public Guid? StaffId { get; set; }

    }

    public class Response
    {

    }
}