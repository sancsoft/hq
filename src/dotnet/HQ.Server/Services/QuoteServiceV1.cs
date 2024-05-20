using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FluentResults;
using HQ.Abstractions.Quotes;
using HQ.Server.Data;
using Microsoft.EntityFrameworkCore;

namespace HQ.Server.Services
{
    public class QuoteServiceV1
    {
        private readonly HQDbContext _context;
        public QuoteServiceV1(HQDbContext context)
        {
            this._context = context;
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
    }
}