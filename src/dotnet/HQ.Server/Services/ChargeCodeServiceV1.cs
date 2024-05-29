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

        var sortMap = new Dictionary<GetChargeCodesV1.SortColumn, string>()
        {
            { Abstractions.ChargeCodes.GetChargeCodesV1.SortColumn.Code, "Code" },
            { Abstractions.ChargeCodes.GetChargeCodesV1.SortColumn.Billable, "Billable" },
            { Abstractions.ChargeCodes.GetChargeCodesV1.SortColumn.Active, "Active" },
            { Abstractions.ChargeCodes.GetChargeCodesV1.SortColumn.ProjectName, "ProjectName" },
            { Abstractions.ChargeCodes.GetChargeCodesV1.SortColumn.QuoteName, "QuoteName" },
            { Abstractions.ChargeCodes.GetChargeCodesV1.SortColumn.ServiceAgreementName, "ServiceAgreementName" },
        };

        var sortProperty = sortMap[request.SortBy];

        mapped = request.SortDirection == SortDirection.Asc ?
            mapped.OrderBy(t => EF.Property<object>(t, sortProperty)) :
            mapped.OrderByDescending(t => EF.Property<object>(t, sortProperty));

        if (request.Skip.HasValue)
        {
            mapped = mapped.Skip(request.Skip.Value);
        }

        if (request.Take.HasValue)
        {
            mapped = mapped.Take(request.Take.Value);
        }



        var response = new GetChargeCodesV1.Response()
        {
            Records = await mapped.ToListAsync(ct),
            Total = total
        };

        return response;
    }
}
