using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using FluentResults;

using HQ.Abstractions.Invoices;
using HQ.Server.Data;
using HQ.Server.Data.Models;

using Microsoft.EntityFrameworkCore;

namespace HQ.Server.Invoices
{
    public partial class InvoicesServiceV1
    {
        private readonly HQDbContext _context;
        public InvoicesServiceV1(HQDbContext context)
        {
            _context = context;
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

        public async Task<Result<CreateInvoiceV1.Response>> CreateInvoiceV1(CreateInvoiceV1.Request request, CancellationToken ct = default)
        {
            var client = await _context.Clients.FirstOrDefaultAsync(c => c.Id == request.ClientId, ct);
            if (client == null)
            {
                return Result.Fail<CreateInvoiceV1.Response>("Client not found");
            }
            if (string.IsNullOrEmpty(request.InvoiceNumber))
            {
                return Result.Fail<CreateInvoiceV1.Response>("Invoice number is required");
            }

            var existingInvoice = await _context.Invoices.FirstOrDefaultAsync(i => i.InvoiceNumber.Trim().ToLower() == request.InvoiceNumber.Trim().ToLower(), ct);

            if (existingInvoice != null)
            {
                return Result.Fail<CreateInvoiceV1.Response>("Invoice number already exists");
            }

            var invoice = new Invoice
            {
                ClientId = request.ClientId,
                Date = request.Date ?? DateOnly.FromDateTime(DateTime.Today),
                InvoiceNumber = request.InvoiceNumber,
                Total = 0,
                TotalApprovedHours = 0,
                Times = new List<Time>()
            };

            _context.Invoices.Add(invoice);
            await _context.SaveChangesAsync(ct);

            return Result.Ok(new CreateInvoiceV1.Response
            {
                Id = invoice.Id,

            });
        }

        public async Task<Result<AddTimeToInvoiceV1.Response>> AddTimeToInvoiceV1(AddTimeToInvoiceV1.Request request, CancellationToken ct = default)
        {
            using var transaction = await _context.Database.BeginTransactionAsync(ct);

            var invoice = await _context.Invoices
                .Include(i => i.Times)
                .FirstOrDefaultAsync(i => i.Id == request.InvoiceId, ct);

            if (invoice == null)
            {
                return Result.Fail<AddTimeToInvoiceV1.Response>("Invoice not found");
            }

            var timeEntries = await _context.Times
                .Where(t => request.TimeEntryIds.Contains(t.Id))
                .Include(t => t.ChargeCode)
                .ThenInclude(c => c.Project)
                .ToListAsync(ct);

            if (timeEntries.Count != request.TimeEntryIds.Count)
            {
                return Result.Fail<AddTimeToInvoiceV1.Response>("Some time entries were not found");
            }

            foreach (var time in timeEntries)
            {
                if (time.InvoiceId != null)
                {
                    return Result.Fail<AddTimeToInvoiceV1.Response>($"Time entry {time.Id} is already linked to an invoice");
                }
                if (time.ChargeCode.Project?.ClientId != invoice.ClientId)
                {
                    return Result.Fail<AddTimeToInvoiceV1.Response>($"Time entry {time?.Id} does not belong to the client of the invoice");
                }
                time.InvoiceId = invoice.Id;
                invoice.Times.Add(time);
            }


            invoice.Total = invoice.Times.Sum(t => t.Hours);
            invoice.TotalApprovedHours = invoice.Times.Sum(t => t.HoursApproved ?? 0);

            await _context.SaveChangesAsync(ct);
            await transaction.CommitAsync(ct);
            return Result.Ok(new AddTimeToInvoiceV1.Response
            {
                InvoiceId = invoice.Id,
                TimeEntriesAdded = timeEntries.Count
            });
        }

        public async Task<Result<RemoveTimeFromInvoiceV1.Response>> RemoveTimeFromInvoiceV1(RemoveTimeFromInvoiceV1.Request request, CancellationToken ct = default)
        {
            using var transaction = await _context.Database.BeginTransactionAsync(ct);

            var invoice = await _context.Invoices
                .Include(i => i.Times)
                .FirstOrDefaultAsync(i => i.Id == request.InvoiceId, ct);

            if (invoice == null)
            {
                return Result.Fail<RemoveTimeFromInvoiceV1.Response>("Invoice not found");
            }

            var timeEntriesToRemove = await _context.Times
                .Where(t => request.TimeEntryIds.Contains(t.Id) && t.InvoiceId == request.InvoiceId)
                .ToListAsync(ct);

            if (timeEntriesToRemove.Count != request.TimeEntryIds.Count)
            {
                return Result.Fail<RemoveTimeFromInvoiceV1.Response>("Some time entries were not found on this invoice");
            }

            foreach (var timeEntry in timeEntriesToRemove)
            {
                timeEntry.InvoiceId = null;
                invoice.Times.Remove(timeEntry);
            }

            invoice.Total = invoice.Times.Sum(t => t.Hours);
            invoice.TotalApprovedHours = invoice.Times.Sum(t => t.HoursApproved ?? 0);

            await _context.SaveChangesAsync(ct);
            await transaction.CommitAsync(ct);

            return Result.Ok(new RemoveTimeFromInvoiceV1.Response
            {
                InvoiceId = invoice.Id,
            });
        }

        public async Task<Result<UpdateInvoiceV1.Response>> UpdateInvoiceV1(UpdateInvoiceV1.Request request, CancellationToken ct = default)
        {
            using var transaction = await _context.Database.BeginTransactionAsync(ct);

            var invoice = await _context.Invoices
                .Include(i => i.Client)
                .Include(i => i.Times)
                .ThenInclude(t => t.ChargeCode)
                .ThenInclude(c => c.Project)
                .FirstOrDefaultAsync(i => i.Id == request.Id, ct);

            if (invoice == null)
            {
                return Result.Fail<UpdateInvoiceV1.Response>("Invoice not found");
            }

            if (request.ClientId.HasValue && invoice.ClientId != request.ClientId)
            {
                var newClient = await _context.Clients.FirstOrDefaultAsync(c => c.Id == request.ClientId, ct);
                if (newClient == null)
                {
                    return Result.Fail<UpdateInvoiceV1.Response>("Client not found");
                }
                foreach (var timeEntry in invoice.Times.ToList())
                {
                    if (timeEntry.ChargeCode.Project?.ClientId != request.ClientId)
                    {
                        timeEntry.InvoiceId = null;
                        timeEntry.Invoice = null;
                        invoice.Times.Remove(timeEntry);
                    }
                }
                invoice.Client = newClient;
                invoice.ClientId = request.ClientId.Value;

            }

            if (!string.IsNullOrEmpty(request.InvoiceNumber) && invoice.InvoiceNumber != request.InvoiceNumber)
            {
                var existingInvoice = await _context.Invoices
                    .FirstOrDefaultAsync(i => i.Id != request.Id &&
                                        i.InvoiceNumber.Trim().ToLower() == request.InvoiceNumber.Trim().ToLower(), ct);

                if (existingInvoice != null)
                {
                    return Result.Fail<UpdateInvoiceV1.Response>("Invoice number already exists");
                }

                invoice.InvoiceNumber = request.InvoiceNumber;
            }

            if (request.Date.HasValue)
            {
                invoice.Date = request.Date.Value;
            }

            invoice.Total = invoice.Times.Sum(t => t.Hours);
            invoice.TotalApprovedHours = invoice.Times.Sum(t => t.HoursApproved ?? 0);

            await _context.SaveChangesAsync(ct);
            await transaction.CommitAsync(ct);

            return Result.Ok(new UpdateInvoiceV1.Response
            {
                Id = invoice.Id,
                ClientId = invoice.ClientId,
                ClientName = invoice.Client.Name,
                Date = invoice.Date,
                InvoiceNumber = invoice.InvoiceNumber,
                Total = invoice.Total,
                TotalApprovedHours = invoice.TotalApprovedHours,
                TimeEntriesCount = invoice.Times.Count
            });
        }
    }
}