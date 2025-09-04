using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using FluentResults;

using HQ.Abstractions;
using HQ.Abstractions.Enumerations;
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
        private readonly ILogger<InvoicesServiceV1> _logger;
        public InvoicesServiceV1(HQDbContext context, ILogger<InvoicesServiceV1> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<Result<GetInvoicesV1.Response>> GetInvoicesV1(GetInvoicesV1.Request request, CancellationToken ct = default)
        {
            if (request.Period.HasValue && request.Period == Period.Custom)
            {
                if (request.StartDate.HasValue && request.EndDate.HasValue && request.StartDate.Value > request.EndDate.Value)
                {
                    return Result.Fail("Invalid date range.");
                }
            }
            else if (request.Period.HasValue)
            {
                request.StartDate = DateOnly.FromDateTime(DateTime.Today).GetPeriodStartDate(request.Period.Value);
                request.EndDate = DateOnly.FromDateTime(DateTime.Today).GetPeriodEndDate(request.Period.Value);
            }

            var records = _context.Invoices
                .AsNoTracking()
                .OrderByDescending(t => t.CreatedAt)
                .AsQueryable();

            if (request.clientId.HasValue)
            {
                records = records.Where(t => t.ClientId == request.clientId);
            }

            if (request.StartDate.HasValue)
            {
                records = records.Where(t => t.Date >= request.StartDate);
            }

            if (request.EndDate.HasValue)
            {
                records = records.Where(t => t.Date <= request.EndDate);
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
                }).AsNoTracking()
                .SingleOrDefaultAsync(ct);


            if (response == null)
            {
                return Result.Fail("Invoice not found");
            }
            else
            {
                var times = await _context.Times
                    .AsNoTracking()
                    .Where(time => time.InvoiceId == request.Id)
                    .Include(time => time.ChargeCode)
                    .ThenInclude(chargeCode => chargeCode.Quote)
                    .Include(time => time.ChargeCode)
                    .ThenInclude(chargeCode => chargeCode.Project)
                    .ToListAsync(ct);

                var chargeCodes = times.Select(t => t.ChargeCode).ToList();


                decimal totalHours = times.Sum(t => t.HoursApproved ?? t.Hours);
                decimal billableHours = times.Sum(t => t.ChargeCode.Billable ? t.HoursApproved ?? t.Hours : 0);
                decimal acceptedHours = times.Sum(t => t.HoursApproved ?? 0);
                decimal acceptedBillableHours = times.Sum(t => t.ChargeCode.Billable ? t.HoursApproved ?? 0 : 0);
                decimal invoicedHours = times.Sum(t => t.HoursInvoiced ?? 0);

                response.ChargeCodes = chargeCodes
                    .Select(t => new GetInvoiceDetailsV1.ChargeCode()
                    {
                        Id = t.Id,
                        Code = t.Code,
                        Billable = t.Billable,
                        Active = t.Active,
                        QuoteName = t.Quote?.Name,
                        ProjectName = t.Project?.Name,
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
            return Result.Ok(response);
        }

        public async Task<Result<CreateInvoiceV1.Response>> CreateInvoiceV1(CreateInvoiceV1.Request request, CancellationToken ct = default)
        {
            var validationResult = Result.Merge(
                Result.FailIf(!await _context.Clients.AnyAsync(t => t.Id == request.ClientId), "No client found."),
                Result.FailIf(await _context.Invoices.AnyAsync(t => t.InvoiceNumber == request.InvoiceNumber), "An invoice already exists with that invoice number.")
            );

            if (validationResult.IsFailed)
            {
                return validationResult;
            }

            Invoice invoice = new()
            {
                ClientId = request.ClientId,
                Date = request.Date,
                Total = request.Total,
                TotalApprovedHours = request.TotalApprovedHours,
                InvoiceNumber = request.InvoiceNumber
            };

            _context.Invoices.Add(invoice);

            await _context.SaveChangesAsync(ct);

            return new CreateInvoiceV1.Response()
            {
                Id = invoice.Id
            };
        }

        public async Task<Result<UpdateInvoiceV1.Response>> UpdateInvoiceV1(UpdateInvoiceV1.Request request, CancellationToken ct = default)
        {
            _logger.LogInformation("Updating invoice");
            var validationResult = Result.Merge(
                Result.FailIf(request.Id == Guid.Empty, "Invoice Id cannot be empty."),
                Result.FailIf(!await _context.Invoices.AnyAsync(t => t.Id == request.Id), "Invoice could not be found."),
                Result.FailIf(await _context.Invoices.AnyAsync(t => t.Id != request.Id && t.InvoiceNumber == request.InvoiceNumber), "An invoice already exists with that invoice number.")
            );

            if (validationResult.IsFailed)
            {
                return validationResult;
            }
            var invoice = await _context.Invoices.FindAsync(request.Id);

            if (invoice == null)
            {
                return Result.Fail("Invoice could not be found");
            }

            _logger.LogInformation($"  Invoice Number {request.InvoiceNumber}");
            _logger.LogInformation($"  Total {request.Total}");
            _logger.LogInformation($"  Total approved hrs {request.TotalApprovedHours}");

            invoice.Date = request.Date;
            invoice.Total = request.Total;
            invoice.TotalApprovedHours = request.TotalApprovedHours;
            invoice.InvoiceNumber = request.InvoiceNumber;

            await _context.SaveChangesAsync(ct);

            return new UpdateInvoiceV1.Response()
            {
                Id = invoice.Id
            };
        }
    }
}