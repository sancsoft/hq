
using System.ComponentModel.DataAnnotations;
using System.Security.Cryptography;
using System.Text.Json;

using HQ.Abstractions;
using HQ.Abstractions.Services;

using Microsoft.Extensions.Options;

namespace HQ.Server.Services;

public class FilesystemStorageService : IStorageService
{
    private readonly IOptionsMonitor<Options> _options;

    public FilesystemStorageService(IOptionsMonitor<Options> options)
    {
        _options = options;
    }

    private (string File, string MetadataFile) GetFullPath(string path)
    {
        var fullPath = Path.Combine(_options.CurrentValue.Path, path);
        var directory = Path.GetDirectoryName(fullPath);
        if (directory != null && !Directory.Exists(directory))
        {
            Directory.CreateDirectory(directory);
        }

        var metadataFullPath = fullPath + ".metadata.json";

        return (fullPath, metadataFullPath);
    }

    public Task DeleteAsync(string path, CancellationToken ct = default)
    {
        var fullPath = GetFullPath(path);

        File.Delete(fullPath.File);
        File.Delete(fullPath.MetadataFile);

        return Task.CompletedTask;
    }

    public Task<bool> ExistsAsync(string path, CancellationToken ct = default)
    {
        var fullPath = GetFullPath(path);
        return Task.FromResult(File.Exists(fullPath.File) && File.Exists(fullPath.MetadataFile));
    }

    public async Task<(Stream Stream, string ContentType, string ETag)?> ReadAsync(string path, CancellationToken ct = default)
    {
        if (!await ExistsAsync(path, ct))
        {
            return null;
        }

        var fullPath = GetFullPath(path);

        var metadataString = await File.ReadAllTextAsync(fullPath.MetadataFile, ct);
        var metadata = JsonSerializer.Deserialize<Metadata>(metadataString);
        if (metadata == null)
        {
            return null;
        }

        var stream = File.Open(fullPath.File, FileMode.Open, FileAccess.Read, FileShare.Read);

        return (stream, metadata.ContentType, metadata.ETag);
    }

    public async Task WriteAsync(string path, string contentType, Stream stream, CancellationToken ct = default)
    {
        var fullPath = GetFullPath(path);

        var memoryStream = stream as MemoryStream ?? new();
        if (stream is not MemoryStream)
        {
            await stream.CopyToAsync(memoryStream, ct);
        }

        var bytes = memoryStream.ToArray();


        using var sha512 = SHA512.Create();
        var etag = sha512.ComputeHashAsString(bytes);

        var metadata = new Metadata()
        {
            ContentType = contentType,
            Size = stream.Length,
            ETag = etag
        };

        var metadataString = JsonSerializer.Serialize(metadata);

        await File.WriteAllBytesAsync(fullPath.File, bytes, ct);
        await File.WriteAllTextAsync(fullPath.MetadataFile, metadataString, ct);
    }

    private class Metadata
    {
        public string ContentType { get; set; } = null!;
        public string ETag { get; set; } = null!;
        public long Size { get; set; }
    }

    public class Options
    {
        public const string FilesystemStorage = nameof(FilesystemStorage);

        [Required]
        public string Path { get; set; } = null!;
    }

}