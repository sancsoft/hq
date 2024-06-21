namespace HQ.Abstractions.Users;

public class ImportUsersV1
{
    public class Request
    {
        public Stream File { get; set; } = null!;
    }

    public class Response
    {
        public int Created { get; set; }
        public int Updated { get; set; }
        public int Failed { get; set; }
    }
}