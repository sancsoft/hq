using FluentResults;

using HQ.Abstractions.Plan;
using HQ.Abstractions.Staff;

using HQ.Server.Data;

using Microsoft.EntityFrameworkCore;

namespace HQ.Server.Services;
public class PlanServiceV1
{
    private readonly HQDbContext _context;

    public PlanServiceV1(HQDbContext context)
    {
        _context = context;
    }

    public async Task<Result<UpsertPlanV1.Response>> UpsertPlanV1(UpsertPlanV1.Request request, CancellationToken ct = default)
    {
        var validationResult = Result.Merge(
Result.FailIf(string.IsNullOrEmpty(request.Body), "Body is required."));

        if (validationResult.IsFailed)
        {
            return validationResult;
        }

        var plan = await _context.Plans.FindAsync(request.Id);
        if (plan == null)
        {
            plan = new();
            _context.Plans.Add(plan);
        }

        plan.Date = request.Date;
        plan.StaffId = request.StaffId;
        plan.Body = request.Body;

        await _context.SaveChangesAsync(ct);

        return new UpsertPlanV1.Response()
        {
            Id = plan.Id
        };
    }
    public async Task<Result<GetPlanV1.Response>> GetPlanV1(GetPlanV1.Request request, CancellationToken ct = default)
    {
        var records = _context.Plans
            .AsNoTracking()
            .OrderByDescending(t => t.CreatedAt)
            .AsQueryable();

        if (request.Id.HasValue)
        {
            records = records.Where(t => t.Id == request.Id.Value);
        }

        records = records.Where(t => t.Date == request.Date && t.StaffId == request.StaffId);

        var record = await records.Select(t => new GetPlanV1.Response()
        {
            Id = t.Id,
            StaffId = t.StaffId,
            Body = t.Body,
            Date = t.Date
        }).FirstOrDefaultAsync(ct);

        if (record == null)
        {
            return new GetPlanV1.Response()
            {
                StaffId = request.StaffId,
                Body = "",
                Date = request.Date
            };
        }
        return record;
    }
}