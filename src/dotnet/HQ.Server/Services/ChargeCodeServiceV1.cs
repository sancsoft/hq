using System.Formats.Asn1;
using System.Globalization;

using CsvHelper;
using CsvHelper.Configuration;

using FluentResults;

using HQ.Abstractions.ChargeCodes;
using HQ.Abstractions.Enumerations;
using HQ.Abstractions.Projects;
using HQ.Abstractions.Staff;
using HQ.Server.Data;
using HQ.Server.Data.Models;

using Microsoft.EntityFrameworkCore;

namespace HQ.Server.Services;

public class ChargeCodeServiceV1
{
    private readonly HQDbContext _context;

    public ChargeCodeServiceV1(HQDbContext context)
    {
        _context = context;
    }
    public async Task<Result<UpsertChargeCodeV1.Response>> UpsertChargeCodeV1(UpsertChargeCodeV1.Request request, CancellationToken ct = default)
    {
        using (var transaction = await _context.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable, ct))
        {

            try
            {
                var chargecode = await _context.ChargeCodes.FindAsync(request.Id);
                if (chargecode == null)
                {
                    chargecode = new();
                    _context.ChargeCodes.Add(chargecode);
                    switch (request.Activity)
                    {
                        case (ChargeCodeActivity.General):
                            var maxGeneralCode = _context.ChargeCodes
                         .Where(g => g.Code.StartsWith("G"))
                         .Select(g => g.Code.Substring(1))
                         .Select(int.Parse)
                         .DefaultIfEmpty(0)
                         .Max();
                            var newCodeNumber = maxGeneralCode + 1;
                            var formattedNewCode = $"G{newCodeNumber:0000}";
                            chargecode.Code = formattedNewCode;
                            break;
                        case (ChargeCodeActivity.Project):
                            var latestProjectNumber = _context.Projects.Max((p) => p.ProjectNumber);
                            var newProjectNumber = latestProjectNumber + 1;
                            var newCode = "P" + newProjectNumber;
                            chargecode.Code = newCode;
                            break;
                        case (ChargeCodeActivity.Quote):
                            var latestQuoteNumber = _context.Quotes.Max((q) => q.QuoteNumber);
                            var newQuoteNumber = latestQuoteNumber + 1;
                            newCode = "Q" + newQuoteNumber;
                            chargecode.Code = newCode;
                            break;
                        case (ChargeCodeActivity.Service):
                            var latestServiceAgreementNumber = _context.ServiceAgreements.Max((s) => s.ServiceNumber);
                            var newServiceAgreementNumber = latestServiceAgreementNumber + 1;
                            newCode = "S" + newServiceAgreementNumber;
                            chargecode.Code = newCode;
                            break;
                    }
                }

                chargecode.Activity = request.Activity;
                chargecode.Billable = request.Billable;
                chargecode.Active = request.Active;
                chargecode.Description = request.Description;
                chargecode.QuoteId = request.QuoteId;
                chargecode.ProjectId = request.ProjectId;
                chargecode.ServiceAgreementId = request.ServiceAgreementId;



                await _context.SaveChangesAsync(ct);
                await transaction.CommitAsync(ct);


                return new UpsertChargeCodeV1.Response()
                {
                    Id = chargecode.Id
                };
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync(ct);
                return Result.Fail(new Error("An error occurred while upserting the Chargecode.").CausedBy(ex));
            }
        }
    }

    public async Task<Result<GetChargeCodesV1.Response>> GetChargeCodesV1(GetChargeCodesV1.Request request, CancellationToken ct = default)
    {
        var records = _context.ChargeCodes
            .AsNoTracking()
            .OrderByDescending(t => t.CreatedAt)
            .AsQueryable();


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

        if (request.ProjectId.HasValue)
        {
            records = records.Where(t => t.ProjectId.Equals(request.ProjectId));
        }

        if (request.ClientId.HasValue)
        {
            records = records.Where(t => t.Project!.ClientId == request.ClientId.Value);
        }
        var mapped = records.Select(t => new GetChargeCodesV1.Record()
        {
            Id = t.Id,
            Code = t.Code,
            Activity = t.Activity,
            Active = t.Active,
            Billable = t.Billable,
            ProjectName = t.Project != null ? t.Project.Name : null,
            ProjectId = t.Project != null ? t.Project.Id : null,
            ClientName = t.Project != null ? t.Project.Client.Name : null,
            ClientId = t.Project != null ? t.Project.Client.Id : null,

            QuoteName = t.Quote != null ? t.Quote.Name : null,
            ServiceAgreementName = t.ServiceAgreement != null ? t.ServiceAgreement.Name : null,
            QuoteId = t.QuoteId != null ? t.QuoteId : null,
            ServiceAgreementId = t.ServiceAgreementId != null ? t.ServiceAgreementId : null,
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

        var total = await records.CountAsync(ct);

        var response = new GetChargeCodesV1.Response()
        {
            Records = await mapped.ToListAsync(ct),
            Total = total
        };

        return response;
    }
}