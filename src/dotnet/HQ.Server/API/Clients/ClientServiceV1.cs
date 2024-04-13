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

    public async Task<Result<CreateClientV1.Response>> CreateClientV1(CreateClientV1.Request request, CancellationToken ct = default)
    {
        var validationResult = Result.Merge(
            Result.FailIf(String.IsNullOrEmpty(request.Name), "Name is required."),
            Result.FailIf(await _context.Clients.AnyAsync(t => t.Name == request.Name, ct), "Name must be unique.")
        );

        if(validationResult.IsFailed)
        {
            return validationResult;
        }

        var client = new Client();
        client.Name = request.Name;
        client.OfficialName = request.OfficialName;
        client.BillingEmail = request.BillingEmail;
        client.HourlyRate = request.HourlyRate;

        await _context.Clients.AddAsync(client, ct);
        await _context.SaveChangesAsync(ct);

        return new CreateClientV1.Response()
        {
            ClientId = client.Id
        };
    }

    public async Task<Result<UpdateClientV1.Response?>> UpdateClientV1(UpdateClientV1.Request request, CancellationToken ct = default)
    {
        var validationResult = Result.Merge(
            Result.FailIf(String.IsNullOrEmpty(request.Name), "Name is required."),
            Result.FailIf(await _context.Clients.AnyAsync(t => t.Id != request.ClientId && t.Name == request.Name, ct), "Name must be unique.")
        );

        if (validationResult.IsFailed)
        {
            return validationResult;
        }

        var client = await _context.Clients.FindAsync(request.ClientId, ct);
        if (client == null)
        {
            return Result.Ok<UpdateClientV1.Response?>(null);
        }

        client.Name = request.Name;
        client.OfficialName = request.OfficialName;
        client.BillingEmail = request.BillingEmail;
        client.HourlyRate = request.HourlyRate;

        await _context.SaveChangesAsync(ct);

        return new UpdateClientV1.Response();
    }

    public async Task<Result<DeleteClientV1.Response?>> DeleteClientV1(DeleteClientV1.Request request, CancellationToken ct = default)
    {
        var client = await _context.Clients.FindAsync(request.ClientId, ct);
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
            .Select(t => new GetClientsV1.Record()
            {
                ClientId = t.Id,
                CreatedAt = t.CreatedAt,
                Name = t.Name,
                OfficialName = t.OfficialName,
                BillingEmail = t.BillingEmail,
                HourlyRate = t.HourlyRate,
            });

        var total = await records.CountAsync(ct);

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
            records = records.Where(t => t.ClientId == request.ClientId.Value);
        }

        if (request.Skip.HasValue)
        {
            records = records.Skip(request.Skip.Value);
        }

        if (request.Take.HasValue)
        {
            records = records.Take(request.Take.Value);
        }

        var response = new GetClientsV1.Response()
        {
            Records = await records.ToListAsync(ct),
            Total = total
        };

        return response;
    }
}
