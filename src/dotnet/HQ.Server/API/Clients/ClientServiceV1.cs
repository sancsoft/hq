using FluentResults;
using HQ.Abstractions.Clients;
using HQ.Server.Data;
using HQ.Server.Data.Models;
using Microsoft.EntityFrameworkCore;

namespace HQ.Server.API.Clients;

public class ClientServiceV1
{
    private readonly HQDbContext _context;

    public ClientServiceV1(HQDbContext context)
    {
        _context = context;
    }

    private IQueryable<Client> FilterClientIdOrName(IQueryable<Client> records, string clientIdOrName)
    {
        if (Guid.TryParse(clientIdOrName, out Guid clientId))
        {
            records = records.Where(t => t.Id == clientId);
        }
        else
        {
            records = records.Where(t => t.Name.ToLower() == clientIdOrName.ToLower());
        }

        return records;
    }

    public async Task<Result<UpsertClientV1.Response>> UpsertClientV1(UpsertClientV1.Request request, CancellationToken ct = default)
    {
        var validationResult = Result.Merge(
            Result.FailIf(String.IsNullOrEmpty(request.Name), "Name is required."),
            Result.FailIf(!request.ClientId.HasValue && await _context.Clients.AnyAsync(t => t.Name == request.Name, ct), "Name must be unique."),
            Result.FailIf(request.ClientId.HasValue && await _context.Clients.AnyAsync(t => t.Id != request.ClientId && t.Name == request.Name, ct), "Name must be unique.")
        );

        if(validationResult.IsFailed)
        {
            return validationResult;
        }

        var client = await _context.Clients.FindAsync(request.ClientId);
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
            ClientId = client.Id
        };
    }

    public async Task<Result<DeleteClientV1.Response?>> DeleteClientV1(DeleteClientV1.Request request, CancellationToken ct = default)
    {
        var validationResult = Result.Merge(
            Result.FailIf(String.IsNullOrEmpty(request.ClientIdOrName) && !request.ClientId.HasValue, "ClientIdOrName or ClientId must be specified.")
        );

        if (validationResult.IsFailed)
        {
            return validationResult;
        }

        var records = _context.Clients.AsQueryable();

        if (!String.IsNullOrEmpty(request.ClientIdOrName))
        {
            records = FilterClientIdOrName(records, request.ClientIdOrName);
        }

        if(request.ClientId.HasValue)
        {
            records = records.Where(t => t.Id == request.ClientId.Value);
        }

        var client = await records.SingleOrDefaultAsync(ct);
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

        if(!String.IsNullOrEmpty(request.ClientIdOrName))
        {
            records = FilterClientIdOrName(records, request.ClientIdOrName);
        }

        if (!string.IsNullOrEmpty(request.Search))
        {
            records = records.Where(t =>
                t.Name.Contains(request.Search) ||
                t.OfficialName != null && t.OfficialName.Contains(request.Search) ||
                t.BillingEmail != null && t.BillingEmail.Contains(request.Search)
            );
        }

        if (request.ClientId.HasValue)
        {
            records = records.Where(t => t.Id == request.ClientId.Value);
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
            ClientId = t.Id,
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
        return new ImportClientsV1.Response()
        {
            Created = (int)request.File.Length
        };
    }
}
