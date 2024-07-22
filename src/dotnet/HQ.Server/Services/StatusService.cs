using FluentResults;

using HQ.Abstractions.Status;
using HQ.Abstractions.Staff;

using HQ.Server.Data;

using Microsoft.EntityFrameworkCore;

namespace HQ.Server.Services;
public class StatusServiceV1
{
    private readonly HQDbContext _context;

    public StatusServiceV1(HQDbContext context)
    {
        _context = context;
    }

    public async Task<Result<UpsertStatusV1.Response>> UpsertStatusV1(UpsertStatusV1.Request request, CancellationToken ct = default)
    {
        var validationResult = Result.Merge(
Result.FailIf(string.IsNullOrEmpty(request.Status), "Status is required."));

        if (validationResult.IsFailed)
        {
            return validationResult;
        }

        var status = await _context.Plans.FindAsync(request.Id);
        if (status == null)
        {
            status = new();
            _context.Plans.Add(status);
        }

        status.Date = DateOnly.FromDateTime(DateTime.Now);
        status.StaffId = request.StaffId;
        status.Status = request.Status;

        await _context.SaveChangesAsync(ct);

        return new UpsertStatusV1.Response()
        {
            Id = status.Id
        };
    }
    public async Task<Result<GetStatusV1.Response>> GetStatusV1(GetStatusV1.Request request, CancellationToken ct = default)
    {
        var records = _context.Plans
            .AsNoTracking()
            .OrderByDescending(t => t.CreatedAt)
            .AsQueryable();

        if (request.Id.HasValue)
        {
            records = records.Where(t => t.Id == request.Id.Value);
        }

        records = records.Where(t => t.StaffId == request.StaffId);

        var record = await records.Select(t => new GetStatusV1.Response()
        {
            Id = t.Id,
            StaffId = t.StaffId,
            Status = t.Status,
            Date = t.Date
        }).FirstOrDefaultAsync(ct);

        if (record == null)
        {
            return Result.Fail<GetStatusV1.Response>("Record not found");
        }



        return record;
    }
}