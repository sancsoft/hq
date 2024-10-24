using FluentResults;

using HQ.Abstractions.Staff;
using HQ.Abstractions.Status;
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
        var timezone = TimeZoneInfo.FindSystemTimeZoneById("America/New_York");
        var currentTime = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, timezone);
        var currentDay = DateOnly.FromDateTime(currentTime);
        var status = await _context.Plans.Where((t) => t.Date == currentDay && t.StaffId == request.StaffId).FirstOrDefaultAsync(ct);
        if (status == null)
        {
            status = new();
            _context.Plans.Add(status);
        }

        status.Date = currentDay;
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
        var timezone = TimeZoneInfo.FindSystemTimeZoneById("America/New_York");
        var currentTime = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, timezone);
        var currentDay = DateOnly.FromDateTime(currentTime);
        var records = _context.Plans
            .AsNoTracking()
            .OrderByDescending(t => t.Date)
            .AsQueryable();

        if (request.Id.HasValue)
        {
            records = records.Where(t => t.Id == request.Id.Value);
        }

        records = records.Where(t => t.StaffId == request.StaffId && t.Date == currentDay);

        var record = await records.Select(t => new GetStatusV1.Response()
        {
            Id = t.Id,
            StaffId = t.StaffId,
            Status = t.Status,
        }).FirstOrDefaultAsync(ct);

        if (record == null)
        {
            return new GetStatusV1.Response()
            {
                StaffId = request.StaffId,
                Status = null,
            };
        }



        return record;
    }
}