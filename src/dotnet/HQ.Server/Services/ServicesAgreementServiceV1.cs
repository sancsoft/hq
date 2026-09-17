using DocumentFormat.OpenXml.InkML;

using FluentResults;

using HQ.Abstractions;
using HQ.Abstractions.Enumerations;
using HQ.Abstractions.ServicesAgreement;
using HQ.Server.Data;

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HQ.Server.Services
{
    public class ServicesAgreementServiceV1
    {
        private readonly HQDbContext _context;

        public ServicesAgreementServiceV1(HQDbContext context)
        {
            _context = context;
        }
        public async Task<Result<GetServicesAgreementV1.Response>> GetServicesAgreement(GetServicesAgreementV1.Request request, CancellationToken ct = default)
        {
            var records = _context.ServiceAgreements
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

            var mapped = records.Select(t => new GetServicesAgreementV1.Record()
            {
                ClientId = t.ClientId,
                Id = t.Id,
                Name = t.Name,
                ServiceNumber = t.ServiceNumber,
                Description = t.Description,
                QuoteId = t.QuoteId,
                CostValue = t.CostValue,
                CostPeriod = t.CostPeriod,
                PriceValue = t.PriceValue,
                PricePeriod = t.PricePeriod,
                StartDate = t.StartDate,
                EndDate = t.EndDate,
                ChargeCode = (t.ChargeCode != null) ? t.ChargeCode.Code : null,
                ChargeCodeDescription = (t.ChargeCode != null) ? t.ChargeCode.Description : null,
                ProjectStatus = (int?)(t.Quote != null ? t.Quote.Status : (ProjectStatus)1),



            });


            mapped = request.SortDirection == Abstractions.Enumerations.SortDirection.Asc
                ? request.SortBy switch
                {
                    GetServicesAgreementV1.SortColumn.Name => mapped.OrderBy(t => t.Name.ToLower()),
                    GetServicesAgreementV1.SortColumn.chargeCode => mapped.OrderBy(t => t.ChargeCode!.ToLower()),
                    GetServicesAgreementV1.SortColumn.StartDate => mapped.OrderBy(t => t.StartDate),
                    GetServicesAgreementV1.SortColumn.EndDate => mapped.OrderBy(t => t.EndDate),
                    GetServicesAgreementV1.SortColumn.Cost => mapped.OrderBy(t => t.CostValue),
                    GetServicesAgreementV1.SortColumn.Price => mapped.OrderBy(t => t.PriceValue),
                    GetServicesAgreementV1.SortColumn.Status => mapped.OrderBy(t => t.ProjectStatus),
                    _ => mapped,
                }
                : request.SortBy switch
                {
                    GetServicesAgreementV1.SortColumn.Name => mapped.OrderByDescending(t => t.Name.ToLower()),
                    GetServicesAgreementV1.SortColumn.chargeCode => mapped.OrderByDescending(t => t.ChargeCode!.ToLower()),
                    GetServicesAgreementV1.SortColumn.StartDate => mapped.OrderByDescending(t => t.StartDate),
                    GetServicesAgreementV1.SortColumn.EndDate => mapped.OrderByDescending(t => t.EndDate),
                    GetServicesAgreementV1.SortColumn.Cost => mapped.OrderByDescending(t => t.CostValue),
                    GetServicesAgreementV1.SortColumn.Price => mapped.OrderByDescending(t => t.PriceValue),
                    GetServicesAgreementV1.SortColumn.Status => mapped.OrderByDescending(t => t.ProjectStatus),
                    _ => mapped,
                };

            if (request.Skip.HasValue)
            {
                mapped = mapped.Skip(request.Skip.Value);
            }

            if (request.Take.HasValue)
            {
                mapped = mapped.Take(request.Take.Value);
            }

            var total = await records.CountAsync(ct);

            var response = new GetServicesAgreementV1.Response()
            {
                Records = await mapped.ToListAsync(ct),
                Total = total
            };

            return response;


        }
    }
}