using HQ.Abstractions.Enumerations;

namespace HQ.Abstractions.Staff;

public class BulkSetTimeEntryCutoffV1
{
    public class Request
    {
        public Guid? StaffId { get; set; }
        public Jurisdiciton? Jurisdiciton { get; set; }
        public DateOnly? TimeEntryCutoffDate { get; set; }
    }

    public class Response
    {
        public int Updated { get; set; }
    }
}