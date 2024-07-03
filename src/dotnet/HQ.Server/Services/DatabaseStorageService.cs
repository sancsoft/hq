
using System.Security.Cryptography;

using HQ.Abstractions;
using HQ.Abstractions.Services;
using HQ.Server.Data;

using Microsoft.EntityFrameworkCore;

namespace HQ.Server;

public class DatabaseStorageService : IStorageService
{
    private readonly HQDbContext _context;

    public DatabaseStorageService(HQDbContext context)
    {
        _context = context;
    }

    public Task DeleteAsync(string path, CancellationToken ct = default)
    {
        return _context.Blobs.Where(t => t.Key == path).ExecuteDeleteAsync(ct);
    }

    public Task<bool> ExistsAsync(string path, CancellationToken ct = default)
    {
        return _context.Blobs
            .AsNoTracking()
            .AnyAsync(t => t.Key == path, ct);
    }

    public async Task<(Stream Stream, string ContentType, string ETag)?> ReadAsync(string path, CancellationToken ct = default)
    {
        var blob = await _context
            .Blobs
            .AsNoTracking()
            .SingleOrDefaultAsync(t => t.Key == path, ct);

        if (blob == null)
        {
            return null;
        }

        return (new MemoryStream(blob.Data), blob.ContentType, blob.ETag);
    }

    public async Task WriteAsync(string path, string contentType, Stream stream, CancellationToken ct = default)
    {
        if (String.IsNullOrEmpty(path))
        {
            throw new ArgumentNullException(nameof(path), "Path must not be null.");
        }

        var blob = await _context.Blobs.SingleOrDefaultAsync(t => t.Key == path, ct);
        if (blob == null)
        {
            blob = new();
            blob.Key = path;

            _context.Blobs.Add(blob);
        }
        else
        {
            blob.UpdatedAt = DateTime.UtcNow;
        }

        var memoryStream = stream as MemoryStream ?? new();
        if (stream is not MemoryStream)
        {
            await stream.CopyToAsync(memoryStream, ct);
        }

        using var sha512 = SHA512.Create();
        blob.ContentType = !String.IsNullOrEmpty(contentType) ? contentType : "application/octet-stream";
        blob.Data = memoryStream.ToArray();
        blob.ETag = sha512.ComputeHashAsString(blob.Data);
        blob.Size = stream.Length;

        await _context.SaveChangesAsync(ct);
    }
}