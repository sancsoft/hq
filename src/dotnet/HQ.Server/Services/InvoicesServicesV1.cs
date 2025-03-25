using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using FluentResults;

using HQ.Abstractions.Invoices;
using HQ.Server.Data;

using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace HQ.Server.Invoices
{
    public class InvoicesServiceV1
    {
        private readonly HQDbContext _context;
        public InvoicesServiceV1(HQDbContext context)
        {
            this._context = context;
        }

        public async Task<Result<GetInvoicesV1.Response>> GetInvoicesV1(GetInvoicesV1.Request request, CancellationToken ct = default)
        {
            var records = _context.Invoices
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
                    t.InvoiceNumber.ToLower().Contains(request.Search.ToLower()) ||
                    t.Client.Name.ToLower().Contains(request.Search.ToLower())
                );
            }

            if (request.Id.HasValue)
            {
                records = records.Where(t => t.Id == request.Id.Value);
            }

            var mapped = records.Select(t => new GetInvoicesV1.Record()
            {
                Id = t.Id,
                ClientId = t.ClientId,
                ClientName = t.Client.Name,
                Date = t.Date,
                InvoiceNumber = t.InvoiceNumber,
                Total = t.Total,
                TotalApprovedHours = t.TotalApprovedHours
            });

            var sortMap = new Dictionary<GetInvoicesV1.SortColumn, string>() {
                { Abstractions.Invoices.GetInvoicesV1.SortColumn.ClientName, "ClientName" },
                { Abstractions.Invoices.GetInvoicesV1.SortColumn.Total, "Total" },
                { Abstractions.Invoices.GetInvoicesV1.SortColumn.TotalApprovedHours, "TotalApprovedHours" },
                { Abstractions.Invoices.GetInvoicesV1.SortColumn.Date, "Date" },
                { Abstractions.Invoices.GetInvoicesV1.SortColumn.InvoiceNumber, "InvoiceNumber" }
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

            var response = new GetInvoicesV1.Response()
            {
                Records = await mapped.ToListAsync(ct),
                Total = total
            };

            return response;


        }

        public async Task<Result<GetInvoiceDetailsV1.Response>> GetInvoiceDetailsV1(GetInvoiceDetailsV1.Request request, CancellationToken ct = default)
        {
            var response = await _context.Invoices
                .Where(t => t.Id == request.Id)
                .Select(t => new GetInvoiceDetailsV1.Response()
                {
                    Id = t.Id,
                    ClientId = t.ClientId,
                    ClientName = t.Client.Name,
                    Date = t.Date,
                    InvoiceNumber = t.InvoiceNumber,
                    Total = t.Total
                }).SingleOrDefaultAsync(ct);

            response.ChargeCodes = await _context.Times
                .AsNoTracking()
                .Where(t => t.InvoiceId == request.Id)
                .Select(t => {
                    // calculate hour sums
                    response.TotalHours += t.TotalHours;
                    repsonse.BillableHours += t.BillableHours;
                    response.AcceptedHours += t.AcceptedHours;
                    response.AcceptedBillableHours += t.AcceptedBillableHours;

                    return new GetInvoiceDetailsV1.ChargeCode() {
                        Id = t.Id,
                        Code = t.Code,
                        Billable = t.Billable,
                        Active = t.Active,
                        ProjectName = t.ProjectName,
                        QuoteName = t.QuoteName,
                        ProjectId = t.ProjectId,
                        QuoteId = t.QuoteId,
                    };
                })
                .Distinct()
                .ToListAsync();

            return response;
        }
    }
}