using System.Formats.Asn1;
using System.Globalization;

using CsvHelper;
using CsvHelper.Configuration;

using FluentResults;

using HQ.Abstractions;
using HQ.Abstractions.Clients;
using HQ.Abstractions.Enumerations;
using HQ.Abstractions.Projects;
using HQ.Server.Data;
using HQ.Server.Data.Models;

using Microsoft.EntityFrameworkCore;

namespace HQ.Server.Services;

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
            Result.FailIf(string.IsNullOrEmpty(request.Name), "Name is required."),
            Result.FailIf(await _context.Clients.AnyAsync(t => t.Id != request.Id && t.Name == request.Name, ct), "Name must be unique.")
        );

        if (validationResult.IsFailed)
        {
            return validationResult;
        }

        var client = await _context.Clients.FindAsync(request.Id);
        if (client == null)
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

        if (!string.IsNullOrEmpty(request.Search))
        {
            records = records.Where(t =>
                t.Name.ToLower().Contains(request.Search.ToLower()) ||
                t.OfficialName != null && t.OfficialName.ToLower().Contains(request.Search.ToLower()) ||
                t.BillingEmail != null && t.BillingEmail.ToLower().Contains(request.Search.ToLower())
            );
        }

        if (request.Id.HasValue)
        {
            records = records.Where(t => t.Id == request.Id.Value);
        }

        var total = await records.CountAsync(ct);

        var sortMap = new Dictionary<GetClientsV1.SortColumn, string>()
        {
            { Abstractions.Clients.GetClientsV1.SortColumn.CreatedAt, "CreatedAt" },
            { Abstractions.Clients.GetClientsV1.SortColumn.Name, "Name" },
            { Abstractions.Clients.GetClientsV1.SortColumn.HourlyRate, "HourlyRate" },
            { Abstractions.Clients.GetClientsV1.SortColumn.BillingEmail, "BillingEmail" },
            { Abstractions.Clients.GetClientsV1.SortColumn.OfficialName, "OfficialName" },
        };

        var sortProperty = sortMap[request.SortBy];

        records = request.SortDirection == SortDirection.Asc ?
            records.OrderBy(t => EF.Property<object>(t, sortProperty)) :
            records.OrderByDescending(t => EF.Property<object>(t, sortProperty));

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
        var conf = new CsvConfiguration(CultureInfo.InvariantCulture)
        {
            HasHeaderRecord = true,
            TrimOptions = TrimOptions.Trim,
            MissingFieldFound = null,
            HeaderValidated = null
        };

        await using var transaction = await _context.Database.BeginTransactionAsync(ct);
        using var reader = new StreamReader(request.File);
        using var csv = new CsvReader(reader, conf);

        var allClients = await _context.Clients.ToListAsync(ct);
        var clientsById = allClients.ToDictionary(t => t.Id);

        var records = csv.GetRecords<UpsertClientV1.Request>()
            .OrderByDescending(t => t.Id.HasValue)
            .ToList();

        var created = 0;
        var updated = 0;

        foreach (var record in records)
        {
            // TODO: Validate

            Client client;
            if (record.Id.HasValue && clientsById.ContainsKey(record.Id.Value))
            {
                client = clientsById[record.Id.Value];
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
        }

        await _context.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);

        return new ImportClientsV1.Response()
        {
            Created = created,
            Updated = updated
        };
    }

    public async Task<Result<GetClientInvoiceSummaryV1.Response?>> GetClientInvoiceSummaryV1(GetClientInvoiceSummaryV1.Request request, CancellationToken ct = default)
    {
        var currentMonthStartDate = DateOnly.FromDateTime(DateTime.Today).GetPeriodStartDate(Period.Month);
        var lastMonthStartDate = DateOnly.FromDateTime(DateTime.Today).GetPeriodStartDate(Period.LastMonth);
        var lastMonthEndDate = DateOnly.FromDateTime(DateTime.Today).GetPeriodEndDate(Period.LastMonth);
        var currentYearStartDate = DateOnly.FromDateTime(DateTime.Today).GetPeriodStartDate(Period.Year);

        var response = await _context.Clients
            .Where(t => t.Id == request.Id)
            .Select(client => new GetClientInvoiceSummaryV1.Response()
            {
                MonthToDate = client.Invoices.Where(t => t.Date >= currentMonthStartDate).Sum(t => t.Total),
                LastMonthToDate = client.Invoices.Where(t => t.Date >= lastMonthStartDate && t.Date <= lastMonthEndDate).Sum(t => t.Total),
                YearToDate = client.Invoices.Where(t => t.Date >= currentYearStartDate).Sum(t => t.Total),
                AllTimeToDate = client.Invoices.Sum(t => t.Total)
            })
            .SingleOrDefaultAsync(ct);

        return response;
    }
}