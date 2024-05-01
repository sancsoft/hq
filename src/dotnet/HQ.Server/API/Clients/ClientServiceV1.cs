using CsvHelper;
using FluentResults;
using HQ.Abstractions.Clients;
using HQ.Server.Data;
using HQ.Server.Data.Models;
using Microsoft.EntityFrameworkCore;
using System.Formats.Asn1;
using System.Globalization;

namespace HQ.Server.API.Clients;

public class ClientServiceV1
{
    private readonly HQDbContext _context;

    public ClientServiceV1(HQDbContext context)
    {
        _context = context;
    }

    public async Task<Result<UpsertClientV1.Response>> UpsertClientV1(UpsertClientV1.Request request, CancellationToken ct = default)
    {
        var validationResult = Result.Merge(
            Result.FailIf(String.IsNullOrEmpty(request.Name), "Name is required."),
            Result.FailIf(!request.Id.HasValue && await _context.Clients.AnyAsync(t => t.Name == request.Name, ct), "Name must be unique."),
            Result.FailIf(request.Id.HasValue && await _context.Clients.AnyAsync(t => t.Id != request.Id && t.Name == request.Name, ct), "Name must be unique.")
        );

        if(validationResult.IsFailed)
        {
            return validationResult;
        }

        var client = await _context.Clients.FindAsync(request.Id);
        if(client == null)
        {
            client = new();
            _context.Clients.Add(client);
        }

        client.Name = request.Name;
        client.OfficialName = request.OfficialName;
        client.BillingEmail = request.BillingEmail;
        client.HourlyRate = request.HourlyRate;

        await _context.SaveChangesAsync(ct);

        return new UpsertClientV1.Response()
        {
            Id = client.Id
        };
    }

    public async Task<Result<DeleteClientV1.Response?>> DeleteClientV1(DeleteClientV1.Request request, CancellationToken ct = default)
    {
        var client = await _context.Clients.FindAsync(request.Id, ct);
        if (client == null)
        {
            return Result.Ok<DeleteClientV1.Response?>(null);
        }

        _context.Clients.Remove(client);

        await _context.SaveChangesAsync(ct);

        return new DeleteClientV1.Response();
    }

    public async Task<Result<GetClientsV1.Response>> GetClientsV1(GetClientsV1.Request request, CancellationToken ct = default)
    {
        var records = _context.Clients
            .AsNoTracking()
            .OrderByDescending(t => t.CreatedAt)
            .AsQueryable();

        var total = await records.CountAsync(ct);

        if (!string.IsNullOrEmpty(request.Search))
        {
            records = records.Where(t =>
                t.Name.Contains(request.Search) ||
                t.OfficialName != null && t.OfficialName.Contains(request.Search) ||
                t.BillingEmail != null && t.BillingEmail.Contains(request.Search)
            );
        }

        if (request.Id.HasValue)
        {
            records = records.Where(t => t.Id == request.Id.Value);
        }

        if (request.Skip.HasValue)
        {
            records = records.Skip(request.Skip.Value);
        }

        if (request.Take.HasValue)
        {
            records = records.Take(request.Take.Value);
        }

        var mapped = records.Select(t => new GetClientsV1.Record()
        {
            Id = t.Id,
            CreatedAt = t.CreatedAt,
            Name = t.Name,
            OfficialName = t.OfficialName,
            BillingEmail = t.BillingEmail,
            HourlyRate = t.HourlyRate,
        });

        var response = new GetClientsV1.Response()
        {
            Records = await mapped.ToListAsync(ct),
            Total = total
        };

        return response;
    }

    public async Task<Result<ImportClientsV1.Response>> ImportClientsV1(ImportClientsV1.Request request, CancellationToken ct = default)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync(ct);
        using var reader = new StreamReader(request.File);
        using var csv = new CsvReader(reader, CultureInfo.InvariantCulture);

        csv.Context.Configuration.HeaderValidated = null;

        var allClients = await _context.Clients.ToListAsync(ct);
        var clientsById = allClients.ToDictionary(t => t.Id);
        var clientsByName = allClients.ToDictionary(t => t.Name, StringComparer.OrdinalIgnoreCase);

        var records = csv.GetRecords<UpsertClientV1.Request>()
            .OrderByDescending(t => t.Id.HasValue)
            .ToList();

        var created = 0;
        var updated = 0;

        foreach(var record in records)
        {
            Client client;
            if(record.Id.HasValue && clientsById.ContainsKey(record.Id.Value))
            {
                client = clientsById[record.Id.Value];
                if(client.Name != record.Name)
                {
                    clientsByName.Remove(client.Name);
                    clientsByName[record.Name] = client;
                }

                updated++;
            }
            else if (clientsByName.ContainsKey(record.Name))
            {
                client = clientsByName[record.Name];

                updated++;
            }
            else
            {
                client = new();
                _context.Clients.Add(client);

                created++;
            }

            client.Name = record.Name;
            client.OfficialName = record.OfficialName;
            client.BillingEmail = record.BillingEmail;
            client.HourlyRate = record.HourlyRate;

            clientsById[client.Id] = client;
            clientsByName[client.Name] = client;
        }

        await _context.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);

        return new ImportClientsV1.Response()
        {
            Created = created,
            Updated = updated
        };
    }
}
