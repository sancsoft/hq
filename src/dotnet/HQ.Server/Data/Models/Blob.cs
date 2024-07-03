namespace HQ.Server.Data.Models;

public class Blob : Base
{
    public string Key { get; set; } = null!;
    public byte[] Data { get; set; } = [];
    public string ETag { get; set; } = null!;
    public string ContentType { get; set; } = null!;
    public long Size { get; set; }
}