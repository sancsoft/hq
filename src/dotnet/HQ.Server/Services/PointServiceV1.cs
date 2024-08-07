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
                .Where(p => p.StaffId == request.StaffId && p.Date == startDate);
        var points = await records.ToListAsync(ct);
        var times = _context.Times.AsNoTracking().AsQueryable().Where(t => t.StaffId == request.StaffId && t.Date >= startDate && t.Date <= endDate);
        var pointTime = 4m; // A point represents 4 hours of logged work
        var timesDictionary = await times
        .GroupBy(x => x.ChargeCodeId)
        .ToDictionaryAsync(g => g.Key, g => g.Sum(x => x.Hours));

        var _points = points.Select(t => new Abstractions.Points.Point
        {
            ChargeCodeId = t.ChargeCodeId,
            Id = t.Id,
            Sequence = t.Sequence,
            ChargeCode = t.ChargeCode?.Code,
            ProjectName = t.ChargeCode?.Project?.Name,
            ProjectId = t.ChargeCode?.Project?.Id,
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
                    Completed = false,
                    ChargeCode = null,
                    ProjectName = null,
                    ProjectId = null
                };
                _points.Insert(i, nullPoint);
            }
            else
            {
                if (!point.ChargeCodeId.HasValue) continue;
                var hours = timesDictionary.GetValueOrDefault(point.ChargeCodeId.Value, 0);
                if (hours < pointTime) continue;
                point.Completed = true;
                timesDictionary[point.ChargeCodeId.Value] -= pointTime;
            }

        }

        var response = new GetPointsV1.Response()
        {
            StaffId = request.StaffId,
            Date = request.Date,
            Points = _points.ToArray(),
            DisplayDate = startDate.AddDays(2),
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
                var points = await _context.Points
                        .Where(p => p.StaffId == request.StaffId && p.Date == startDate).ToListAsync();
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
                    if (point == null || point.ChargeCodeId == null)
                        continue;
                    var _Point = new Data.Models.Point();
                    _context.Points.Add(_Point);

                    pointIds.Add(_Point.Id);
                    _Point.ChargeCodeId = point.ChargeCodeId.Value;
                    _Point.StaffId = request.StaffId!.Value;
                    _Point.Sequence = i + 1;
                    _Point.Date = startDate;
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

    public async Task BackgroundAutoGenerateHolidayPlanningPointsV1(CancellationToken ct)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var generateHolidayPlanningPointsResponse = await GenerateHolidayPlanningPointsV1(new()
        {
            ForDate = today
        }, ct);
    }
    public async Task<Result<GenerateHolidayPointsV1.Response>> GenerateHolidayPlanningPointsV1(GenerateHolidayPointsV1.Request request, CancellationToken ct = default)
    {
        var today = request.ForDate;
        var startDate = today.GetPeriodStartDate(Period.Week);
        var endDate = today.GetPeriodEndDate(Period.Week);

        var holidays = _context.Holidays
        .AsNoTracking()
        .AsQueryable();
        var jurisdicitons = Enum.GetValues(typeof(Jurisdiciton));
        var holidayChargeCode = await _context.ChargeCodes.Where(t => t.Project!.Name.ToLower().Contains("holiday")).FirstOrDefaultAsync(ct);
        if (holidayChargeCode == null)
        {
            return Result.Fail("Unable to find holiday chargecode");
        }
        foreach (Jurisdiciton jurisdiciton in jurisdicitons)
        {
            var upcomingHolidays = await holidays.Where(t => t.Date >= startDate && t.Date <= endDate && t.Jurisdiciton == jurisdiciton).ToListAsync(ct);
            var staff = await _context.Staff.
                AsNoTracking()
                .AsQueryable().Where(t => t.EndDate == null && t.Jurisdiciton == jurisdiciton).ToListAsync(ct);

            foreach (var staffMember in staff)
            {
                var getPointsRequest = new GetPointsV1.Request
                {
                    StaffId = staffMember.Id,
                    Date = startDate
                };

                var staffPointsResponse = await GetPointsV1(getPointsRequest, ct);
                var points = staffPointsResponse.Value.Points;

                for (int i = points.Length - 1; i >= points.Length - (upcomingHolidays.Count * 2); i--)
                {
                    if (points[i].ChargeCodeId == null)
                    {
                        points[i].ChargeCodeId = holidayChargeCode.Id;
                        points[i].Completed = true;

                    }

                }
                var upsertPointsRequest = new UpsertPointsV1.Request
                {
                    StaffId = staffMember.Id,
                    Date = startDate,
                    Points = points
                };

                var upsertPointsResponse = await UpsertPointV1(upsertPointsRequest, ct);

            }

        }
        return new GenerateHolidayPointsV1.Response()
        {
        };
    }

}