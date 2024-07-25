using System.Formats.Asn1;
using System.Globalization;

using CsvHelper;
using CsvHelper.Configuration;

using FluentResults;

using HQ.Abstractions;

using HQ.Abstractions.Enumerations;
using HQ.Abstractions.Points;
using HQ.Server.Data;
using HQ.Server.Data.Models;

using Microsoft.EntityFrameworkCore;

namespace HQ.Server.Services;

public class PointServiceV1
{
    private readonly HQDbContext _context;

    public PointServiceV1(HQDbContext context)
    {
        _context = context;
    }
    public async Task<Result<GetPointsV1.Response>> GetPointsV1(GetPointsV1.Request request, CancellationToken ct = default)
    {
        var records = _context.Points
                .AsNoTracking()
                .Include(t => t.ChargeCode)
                .Include(t => t.ChargeCode.Project)
                .OrderByDescending(t => t.CreatedAt)
                .AsQueryable();
        if (request.Id != null)
        {
            records = records.Where(t => t.Id == request.Id);

        }
        var startDate = request.Date.GetPeriodStartDate(Period.Week);
        var endDate = request.Date.GetPeriodEndDate(Period.Week);

        records = records
                .Where(p => p.StaffId == request.StaffId && p.Date >= startDate && p.Date <= endDate);
        var points = await records.ToListAsync(ct);

        var _points = points.Select(t => new Abstractions.Points.Point
        {
            ChargeCodeId = t.ChargeCodeId,
            Id = t.Id,
            Sequence = t.Sequence,
            ChargeCode = t.ChargeCode?.Code,
            ProjectName = t.ChargeCode?.Project?.Name,
            ProjectId = t.ChargeCode?.Project?.Id
        }).OrderBy(t => t.Sequence).ToList();

        for (int i = 0; i < 10; i++)
        {
            var sequence = i + 1;
            var point = _points.Find(p => p.Sequence == sequence);
            if (point == null)
            {
                var nullPoint = new Abstractions.Points.Point
                {
                    ChargeCodeId = null,
                    Id = null,
                    Sequence = sequence,
                    ChargeCode = null,
                    ProjectName = null,
                    ProjectId = null
                };
                _points.Insert(i, nullPoint);
            }
        }

        var response = new GetPointsV1.Response()
        {
            StaffId = request.StaffId,
            Date = request.Date,
            Points = _points.ToArray(),
            DisplayDate = startDate.AddPeriod(Period.Today, 2),
            PreviousDate = request.Date.AddPeriod(Period.Week, -1),
            NextDate = request.Date.AddPeriod(Period.Week, 1)
        };

        return response;

    }
    public async Task<Result<UpsertPointsV1.Response>> UpsertPointV1(UpsertPointsV1.Request request, CancellationToken ct = default)
    {
        using (var transaction = await _context.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable, ct))
        {
            try
            {
                var validationResult = Result.Merge(
                    Result.FailIf(request.Points?.Length != 10, "10 Points required."),
                    Result.FailIf(!request.StaffId.HasValue, "staff id is required")
                );

                if (validationResult.IsFailed)
                {
                    return validationResult;
                }

                var pointIds = new List<Guid>();
                var startDate = request.Date.GetPeriodStartDate(Period.Week);
                var endDate = request.Date.GetPeriodEndDate(Period.Week);
                var points = await _context.Points
                        .Where(p => p.StaffId == request.StaffId && p.Date >= startDate && p.Date <= endDate).ToListAsync();
                foreach (var p in points)
                {
                    _context.Points.Remove(p);

                }
                if (request.Points == null)
                {
                    return Result.Fail("Points can't be null");
                }
                for (int i = 0; i < request.Points.Length; i++)
                {
                    var point = request.Points[i];
                    if (point == null)
                        continue;
                    if (point.ChargeCodeId == null)
                    {
                        return Result.Fail("Point charge code can't be null");
                    }
                    var _Point = new Data.Models.Point();
                    _context.Points.Add(_Point);

                    pointIds.Add(_Point.Id);
                    _Point.ChargeCodeId = point.ChargeCodeId.Value;
                    _Point.StaffId = request.StaffId!.Value;
                    _Point.Sequence = i + 1;
                    _Point.Date = request.Date;
                }

                await _context.SaveChangesAsync(ct);
                await transaction.CommitAsync(ct);

                return new UpsertPointsV1.Response()
                {
                    PointIds = pointIds.ToArray()
                };
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync(ct);
                return Result.Fail(new Error("An error occurred while upserting the Points. " + ex).CausedBy(ex));
            }
        }
    }

}