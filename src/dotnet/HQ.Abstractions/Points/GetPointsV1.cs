using HQ.Abstractions.Points;

public class GetPointsV1
{
    public class Point
    {
        public Guid? Id { get; set; }
        public Guid? ChargeCodeId { get; set; }
        public String? ChargeCode { get; set; }
        public String? ProjectName { get; set; }
        public Guid? ProjectId { get; set; }
        public int Sequence { get; set; }
        public bool Completed { get; set; }
    }
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
        public List<Point> Points { get; set; } = new List<Point>();
        public DateOnly DisplayDate { get; set; }
        public DateOnly PreviousDate { get; set; }
        public DateOnly NextDate { get; set; }
    }
}