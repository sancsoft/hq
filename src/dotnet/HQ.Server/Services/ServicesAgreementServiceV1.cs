using DocumentFormat.OpenXml.InkML;
using FluentResults;
using HQ.Abstractions.ServicesAgreement;
using HQ.Server.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HQ.Server.Services
{
    public class ServicesAgreementServiceV1 : ControllerBase
    {
        private HQDbContext _context;

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
                ChargeCode = t.ChargeCode.Code ?? null

            });


            var sortMap = new Dictionary<GetServicesAgreementV1.SortColumn, string>()
        {
            { Abstractions.ServicesAgreement.GetServicesAgreementV1.SortColumn.ChargeCode, "ChargeCode" },
            { Abstractions.ServicesAgreement.GetServicesAgreementV1.SortColumn.ClientName, "ClientName" },
            { Abstractions.ServicesAgreement.GetServicesAgreementV1.SortColumn.Name, "Name" },
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

            var response = new GetServicesAgreementV1.Response()
            {
                Records = await mapped.ToListAsync(ct),
                Total = total
            };

            return response;


        }
    }
}