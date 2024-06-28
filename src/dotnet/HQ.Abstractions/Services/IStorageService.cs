namespace HQ.Abstractions.Services;

public interface IStorageService
{
    Task WriteAsync(string path, string contentType, Stream stream, CancellationToken ct = default);
    Task<(Stream Stream, string ContentType, string ETag)?> ReadAsync(string path, CancellationToken ct = default);
    Task DeleteAsync(string path, CancellationToken ct = default);
    Task<bool> ExistsAsync(string path, CancellationToken ct = default);
}
