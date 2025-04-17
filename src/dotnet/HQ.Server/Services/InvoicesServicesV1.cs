using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using FluentResults;

using HQ.Abstractions.Invoices;
using HQ.Server.Data;
using HQ.Server.Data.Models;

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
                    Total = t.Total,
                    TotalApprovedHours = t.TotalApprovedHours
                }).SingleOrDefaultAsync(ct);


            if (response != null)
            {
                var times = await _context.Times
                    .AsNoTracking()
                    .Where(t => t.InvoiceId == request.Id)
                    .ToListAsync();
                // Console.WriteLine($"{times.Count} Times");

                var chargeCodeIds = times.Select(t => t.ChargeCodeId);

                var chargeCodes = await _context.ChargeCodes
                    .AsNoTracking()
                    .Where(t => chargeCodeIds.Contains(t.Id))
                    .ToListAsync();

                // Console.WriteLine($"{chargeCodes.Count} charge codes");

                decimal totalHours = 0;
                decimal billableHours = 0;
                decimal acceptedHours = 0;
                decimal acceptedBillableHours = 0;
                decimal invoicedHours = 0;

                Console.WriteLine("==========");
                foreach (Time time in times)
                {
                    var code = chargeCodes.Find(c => c.Id == time.ChargeCodeId);
                    totalHours += time.Hours;
                    if (code != null)
                    {
                        if (code.Billable)
                        {
                            billableHours += time.Hours;
                        }
                        if (time.HoursApproved.HasValue)
                        {
                            acceptedHours += time.HoursApproved ?? 0;
                        }
                        if (code.Billable && time.HoursApproved.HasValue)
                        {
                            acceptedBillableHours += time.HoursApproved ?? 0;
                        }
                        if (time.HoursInvoiced.HasValue)
                        {
                            invoicedHours += time.HoursInvoiced ?? 0;
                        }
                        Console.WriteLine(time.Date);
                        Console.WriteLine($"  hrs: {time.Hours}, hrsAppr: {time.HoursApproved}, hrsBill: " + (code.Billable ? time.Hours : 0) + $", hrsInv: {time.HoursInvoiced}");
                    }
                }

                List<string> projectIds = new List<string>();
                List<string> quoteIds = new List<string>();
                foreach (ChargeCode code in chargeCodes)
                {
                    if (code.ProjectId != null)
                    {
                        projectIds.Add(code.ProjectId.ToString());
                    }
                    if (code.QuoteId != null)
                    {
                        quoteIds.Add(code.QuoteId.ToString());
                    }
                }

                var quotes = await _context.Quotes
                    .AsNoTracking()
                    .Where(t => quoteIds.Contains(t.Id.ToString()))
                    .ToListAsync();

                var projects = await _context.Projects
                    .AsNoTracking()
                    .Where(t => projectIds.Contains(t.Id.ToString()))
                    .ToListAsync();

                foreach (ChargeCode code in chargeCodes)
                {
                    if (code.ProjectId != null)
                    {
                        code.Project = projects.Find(p => p.Id == code.ProjectId);
                    }
                    if (code.QuoteId != null)
                    {
                        code.Quote = quotes.Find(q => q.Id == code.QuoteId);
                    }
                }

                response.ChargeCodes = chargeCodes
                    .Select(t => new GetInvoiceDetailsV1.ChargeCode()
                    {
                        Id = t.Id,
                        Code = t.Code,
                        Billable = t.Billable,
                        Active = t.Active,
                        QuoteName = t.Quote != null ? t.Quote.Name : null,
                        ProjectName = t.Project != null ? t.Project.Name : null,
                        ProjectId = t.ProjectId,
                        QuoteId = t.QuoteId,
                    })
                    .Distinct()
                    .ToList();

                response.TotalHours = totalHours;
                response.BillableHours = billableHours;
                response.AcceptedHours = acceptedHours;
                response.AcceptedBillableHours = acceptedBillableHours;
                response.InvoicedHours = invoicedHours;
            }
            if (response == null)
            {
                Console.WriteLine("Null response");
            }
            return response;
        }

        public async Task<Result<UpsertInvoiceV1.Response>> UpsertInvoiceV1(UpsertInvoiceV1.Request request, CancellationToken ct = default)
        {
            Console.WriteLine("Upserting invoice");
            var validationResult = Result.Merge(
                Result.FailIf(!request.ClientId.HasValue, "Client is required."),
                Result.FailIf(!await _context.Clients.AnyAsync(t => t.Id == request.ClientId), "No client found."),
                Result.FailIf(await _context.Invoices.AnyAsync(t => t.Id != request.Id && t.InvoiceNumber == request.InvoiceNumber), "An invoice already exists with that invoice number.")
            );

            if (validationResult.IsFailed)
            {
                return validationResult;
            }
            Console.WriteLine("  Passed validation");
            var invoice = await _context.Invoices.FindAsync(request.Id);
            if (invoice == null)
            {
                invoice = new();
                Console.WriteLine("  making new invoice" + invoice.Id);
                _context.Invoices.Add(invoice);
            }
            Console.WriteLine("  Invoice found/made");

            var client = await _context.Clients.FindAsync(request.ClientId);
            Console.WriteLine("  Got client");
            invoice.ClientId = request.ClientId ?? Guid.Empty;
            invoice.Date = request.Date;
            invoice.Total = request.Total;
            invoice.TotalApprovedHours = request.TotalApprovedHours;
            invoice.InvoiceNumber = request.InvoiceNumber;

            Console.WriteLine("  Passed invoice number");

            await _context.SaveChangesAsync(ct);

            return new UpsertInvoiceV1.Response()
            {
                Id = invoice.Id
            };
        }
    }
}