using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using FluentResults;

using HQ.Abstractions.Enumerations;
using HQ.Abstractions.Quotes;
using HQ.Abstractions.Services;
using HQ.Server.Data;
using HQ.Server.Data.Models;

using Microsoft.EntityFrameworkCore;

namespace HQ.Server.Services;
public class QuoteServiceV1
{
    private readonly HQDbContext _context;
    private readonly IStorageService _storageService;

    public QuoteServiceV1(HQDbContext context, IStorageService storageService)
    {
        this._context = context;
        _storageService = storageService;
    }

    public async Task<Result<UpsertQuotestV1.Response>> UpsertQuoteV1(UpsertQuotestV1.Request request, CancellationToken ct = default)
    {
        using (var transaction = await _context.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable, ct))
        {
            try
            {
                var validationResult = Result.Merge(
                    Result.FailIf(string.IsNullOrEmpty(request.Name), "Name is required.")
                );

                if (validationResult.IsFailed)
                {
                    return validationResult;
                }

                var quote = await _context.Quotes.FindAsync(request.Id);
                if (quote == null)
                {
                    quote = new Quote();
                    _context.Quotes.Add(quote);
                }

                quote.ClientId = request.ClientId;
                quote.Name = request.Name;
                quote.Value = request.Value;
                quote.Date = request.Date;
                quote.Status = request.Status;


                var latestQuoteNumber = _context.Quotes.Max((q) => q.QuoteNumber);
                var newQuoteNumber = latestQuoteNumber + 1;
                var newCode = "Q" + newQuoteNumber;
                var newChargeCode = new ChargeCode
                {
                    Code = newCode,
                    Billable = true,
                    Active = true,
                    QuoteId = quote.Id,
                    Activity = ChargeCodeActivity.Quote
                };
                quote.ChargeCode = newChargeCode;
                quote.QuoteNumber = newQuoteNumber;
                _context.ChargeCodes.Add(newChargeCode);
                await _context.SaveChangesAsync(ct);
                await transaction.CommitAsync(ct);

                var response = new UpsertQuotestV1.Response()
                {
                    Id = quote.Id,
                };
                return Result.Ok(response);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync(ct);
                return Result.Fail(new Error("An error occurred while upserting the quote.").CausedBy(ex));
            }
        }
    }

    public async Task<Result<GetQuotesV1.Response>> GetQuotesV1(GetQuotesV1.Request request, CancellationToken ct = default)
    {
        var records = _context.Quotes
            .AsNoTracking()
            .OrderByDescending(t => t.CreatedAt)
            .AsQueryable();

        if (request.clientId.HasValue)
        {
            records = records.Where(t => t.ClientId == request.clientId);
        }

        if (!string.IsNullOrEmpty(request.Search))
        {
            records = records.Where(t =>
                t.Name.ToLower().Contains(request.Search.ToLower()) ||
                t.Client.Name.ToLower().Contains(request.Search.ToLower()) ||
                (t.ChargeCode != null ? t.ChargeCode.Code.ToLower().Contains(request.Search.ToLower()) : false)
            );
        }

        if (request.Id.HasValue)
        {
            records = records.Where(t => t.Id == request.Id.Value);
        }

        var mapped = records.Select(t => new GetQuotesV1.Record()
        {
            Id = t.Id,
            ChargeCode = t.ChargeCode != null ? t.ChargeCode.Code : null,
            ClientId = t.ClientId,
            ClientName = t.Client.Name,
            Name = t.Name,
            QuoteNumber = t.QuoteNumber,
            Value = t.Value,
            Status = t.Status,
            Date = t.Date

        });

        var sortMap = new Dictionary<GetQuotesV1.SortColumn, string>()
        {
            { Abstractions.Quotes.GetQuotesV1.SortColumn.QuoteName, "Name" },
            { Abstractions.Quotes.GetQuotesV1.SortColumn.ClientName, "ClientName" },
            { Abstractions.Quotes.GetQuotesV1.SortColumn.Value, "Value" },
            { Abstractions.Quotes.GetQuotesV1.SortColumn.Status, "Status" },
        };

        var sortProperty = sortMap[request.SortBy];

        mapped = request.SortDirection == Abstractions.Enumerations.SortDirection.Asc ?
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

        var response = new GetQuotesV1.Response()
        {
            Records = await mapped.ToListAsync(ct),
            Total = total
        };

        return response;


    }

    private string GetQuotePDFPath(Quote quote) => $"quotes/{quote.Id}.pdf";

    public async Task<Result<UploadQuotePDFV1.Response>> UploadQuotePDFV1(UploadQuotePDFV1.Request request, CancellationToken ct = default)
    {
        var quote = await _context.Quotes.FindAsync(request.Id, ct);
        if (quote == null)
        {
            return Result.Fail("Unable to find quote.");
        }

        var path = GetQuotePDFPath(quote);
        if (request.File == null)
        {
            await _storageService.DeleteAsync(path, ct);
        }
        else
        {
            await _storageService.WriteAsync(path, request.ContentType, request.File, ct);
        }

        return new UploadQuotePDFV1.Response();
    }

    public async Task<Result<GetQuotePDFV1.Response>> GetQuotePDFV1(GetQuotePDFV1.Request request, CancellationToken ct = default)
    {
        var quote = await _context.Quotes.FindAsync(request.Id, ct);
        if (quote == null)
        {
            return Result.Fail("Unable to find quote.");
        }

        var path = GetQuotePDFPath(quote);
        var blob = await _storageService.ReadAsync(path);
        if (blob == null)
        {
            return Result.Fail("Unable to read file from storage service.");
        }

        return new GetQuotePDFV1.Response()
        {
            File = blob.Value.Stream,
            ContentType = blob.Value.ContentType,
            FileName = $"Q{quote.QuoteNumber}.pdf"
        };
    }
}