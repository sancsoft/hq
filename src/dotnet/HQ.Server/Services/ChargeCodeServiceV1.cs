using CsvHelper;
using CsvHelper.Configuration;
using FluentResults;
using HQ.Abstractions.ChargeCodes;
using HQ.Abstractions.Enumerations;
using HQ.Abstractions.Projects;
using HQ.Server.Data;
using HQ.Server.Data.Models;
using Microsoft.EntityFrameworkCore;
using System.Formats.Asn1;
using System.Globalization;

namespace HQ.Server.Services;

public class ChargeCodeServiceV1
{
    private readonly HQDbContext _context;

    public ChargeCodeServiceV1(HQDbContext context)
    {
        _context = context;
    }

    public async Task<Result<GetChargeCodesV1.Response>> GetChargeCodesV1(GetChargeCodesV1.Request request, CancellationToken ct = default)
    {
        var records = _context.ChargeCodes
            .AsNoTracking()
            .OrderByDescending(t => t.CreatedAt)
            .AsQueryable();

        var total = await records.CountAsync(ct);

        if (!string.IsNullOrEmpty(request.Search))
        {
            records = records.Where(t =>
                t.Code.ToLower().Contains(request.Search.ToLower()) ||
                t.Quote != null && t.Quote.Name.ToLower().Contains(request.Search.ToLower()) ||
                t.Project != null && t.Project.Name.ToLower().Contains(request.Search.ToLower()) ||
                t.ServiceAgreement != null && t.ServiceAgreement.Name.ToLower().Contains(request.Search.ToLower())
            );
        }

        if (request.Id.HasValue)
        {
            records = records.Where(t => t.Id == request.Id.Value);
        }

        if (request.Active.HasValue)
        {
            records = records.Where(t => t.Active == request.Active.Value);
        }

        if (request.Billable.HasValue)
        {
            records = records.Where(t => t.Billable == request.Billable.Value);
        }

        var sortMap = new Dictionary<GetChargeCodesV1.SortColumn, string>()
        {
            { Abstractions.ChargeCodes.GetChargeCodesV1.SortColumn.Code, "Code" },
            { Abstractions.ChargeCodes.GetChargeCodesV1.SortColumn.Billable, "Billable" },
            { Abstractions.ChargeCodes.GetChargeCodesV1.SortColumn.Active, "Active" },
            { Abstractions.ChargeCodes.GetChargeCodesV1.SortColumn.ProjectName, "Project.Name" },
            { Abstractions.ChargeCodes.GetChargeCodesV1.SortColumn.QuoteName, "Quote.Name" },
            { Abstractions.ChargeCodes.GetChargeCodesV1.SortColumn.ServiceAgreementName, "ServiceAgreement.Name" },
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

        var mapped = records.Select(t => new GetChargeCodesV1.Record()
        {
            Id = t.Id,
            Code = t.Code,
            Activity = t.Activity,
            Active = t.Active,
            Billable = t.Billable,
            ProjectName = t.Project != null ? t.Project.Name : null,
            QuoteName = t.Quote != null ? t.Quote.Name : null,
            ServiceAgreementName = t.ServiceAgreement != null ? t.ServiceAgreement.Name : null,
            Description = t.Description
        });

        var response = new GetChargeCodesV1.Response()
        {
            Records = await mapped.ToListAsync(ct),
            Total = total
        };

        return response;
    }

    public async Task<string> GenerateNewChargeCode(WorkType workType)
    {
        using var transaction = await _context.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable);
        string prefix = workType switch
        {
            WorkType.Project => "P",
            WorkType.Quote => "Q",
            WorkType.Service => "S",
            _ => throw new ArgumentOutOfRangeException(nameof(workType), workType, null)
        };
        try
        {
            var latestChargeCode = await _context.ChargeCodes
            .Where(c => c.Code.StartsWith(prefix))
                    .OrderByDescending(c => c.Code)
                    .FirstOrDefaultAsync();
            string nextChargeCode = "";
            if (latestChargeCode == null)
            {
                switch (workType)
                {
                    case WorkType.Project:
                        nextChargeCode = "P0000";
                        break;
                    case WorkType.Quote:
                        nextChargeCode = "Q0000";
                        break;
                    case WorkType.Service:
                        nextChargeCode = "S0000";
                        break;

                }
            }
            else
            {
                var latestChargeNumber = int.Parse(latestChargeCode.Code.Substring(1));
                var nextChargeNumber = latestChargeNumber + 1;
                switch (workType)
                {
                    case WorkType.Project:
                        nextChargeCode = "P" + nextChargeNumber;
                        break;
                    case WorkType.Quote:
                        nextChargeCode = "Q" + nextChargeNumber;
                        break;
                    case WorkType.Service:
                        nextChargeCode = "S" + nextChargeNumber;
                        break;
                }
            }
            await transaction.CommitAsync();
            return nextChargeCode;
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }
}

public enum WorkType
{
    Project,
    Quote,
    Service
}