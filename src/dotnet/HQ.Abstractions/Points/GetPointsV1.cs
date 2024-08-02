using HQ.Abstractions.Points;

public class GetPointsV1
{
    public class Request
    {
        public Guid? Id { get; set; }
        public Guid StaffId { get; set; }
        public DateOnly Date { get; set; }
    }
    public class Response
    {
        public DateOnly Date { get; set; }
        public Guid StaffId { get; set; }
        public Point[] Points { get; set; } = null!;
        public DateOnly DisplayDate { get; set; }
        public DateOnly PreviousDate { get; set; }
        public DateOnly NextDate { get; set; }
    }
}