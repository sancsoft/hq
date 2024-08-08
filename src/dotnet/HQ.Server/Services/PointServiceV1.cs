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

        var _points = points.Select(t => new GetPointsV1.Point
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
                var nullPoint = new GetPointsV1.Point
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
            Points = _points,
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
                    Result.FailIf(request.Points?.Count != 10, "10 Points required."),
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

                request.Points = request.Points.OrderBy(t => t.Sequence).ToList();
                var holidayChargeCode = await _context.ChargeCodes.Where(t => t.Project!.Name.ToLower().Contains("holiday")).FirstOrDefaultAsync(ct);
                var vacationChargeCode = await _context.ChargeCodes.Where(t => t.Project!.Name.ToLower().Contains("vacation")).FirstOrDefaultAsync(ct);
                var sickChargeCode = await _context.ChargeCodes.Where(t => t.Project!.Name.ToLower().Contains("sick")).FirstOrDefaultAsync(ct);
                if (holidayChargeCode == null || vacationChargeCode == null || sickChargeCode == null)
                {
                    return Result.Fail("Can't find valid chargecodes for sick or vacation or holiday");
                }

                var pointsToMove = request.Points.Where(p => p.ChargeCodeId.HasValue && (p.ChargeCodeId.Value == holidayChargeCode.Id || p.ChargeCodeId.Value == sickChargeCode.Id || p.ChargeCodeId.Value == vacationChargeCode.Id)).ToList();
                request.Points.RemoveAll(p => pointsToMove.Contains(p));
                request.Points.AddRange(pointsToMove);
                //  Update the sequence for each point after pushing sick, vacation, holiday to the end
                for (int i = 0; i < request.Points.Count; i++)
                {
                    var point = request.Points[i];
                    point.Sequence = i + 1;
                }
                var DB_points = new List<Point>([]);
                for (int i = 0; i < request.Points.Count; i++)
                {
                    var point = request.Points[i];
                    if (point == null || point.ChargeCodeId == null)
                        continue;
                    var _Point = new Data.Models.Point();
                    DB_points.Add(_Point);
                    // _context.Points.Add(_Point);

                    pointIds.Add(_Point.Id);
                    _Point.ChargeCodeId = point.ChargeCodeId.Value;
                    _Point.StaffId = request.StaffId!.Value;
                    _Point.Sequence = i + 1;
                    _Point.Date = startDate;
                }



                await _context.AddRangeAsync(DB_points);
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

    public async Task<Result<GetPointSummaryV1.Response>> GetPointSummaryV1(GetPointSummaryV1.Request request, CancellationToken ct = default)
    {
        var today = request.Date;
        var startDate = today.GetPeriodStartDate(Period.Week);
        var endDate = today.GetPeriodEndDate(Period.Week);

        var response = new GetPointSummaryV1.Response()
        {
            Date = request.Date,
            DisplayDate = startDate.AddDays(2),
            PreviousDate = request.Date.AddPeriod(Period.Week, -1),
            NextDate = request.Date.AddPeriod(Period.Week, 1),
        };

        var allStaffPoints = await _context.Points
            .AsNoTracking()
            .Include(t => t.ChargeCode)
            .ThenInclude(t => t!.Project)
            .ThenInclude(t => t!.Client)
            .Where(t => t.Date == startDate)
            .GroupBy(t => t.StaffId)
            .ToDictionaryAsync(t => t.Key, t => t.ToDictionary(t => t.Sequence), ct);

        var allStaff = await _context.Staff
            .AsNoTracking()
            .Where(t => t.EndDate == null)
            .OrderBy(t => t.Name)
            .ToListAsync(ct);

        var allStaffTimeSummary = await _context.Times
            .AsNoTracking()
            .Where(t => t.Date >= startDate && t.Date <= endDate)
            .GroupBy(t => t.StaffId)
            .ToDictionaryAsync(t => t.Key, t => t.GroupBy(x => x.ChargeCodeId).ToDictionary(x => x.Key, x => x.Sum(y => y.Hours)));

        foreach (var staff in allStaff)
        {
            var summary = new GetPointSummaryV1.StaffSummary()
            {
                StaffId = staff.Id,
                StaffName = staff.Name
            };

            var staffPoints = allStaffPoints.ContainsKey(staff.Id) ? allStaffPoints[staff.Id] : new Dictionary<int, Data.Models.Point>();
            var staffTimeSummary = allStaffTimeSummary.ContainsKey(staff.Id) ? allStaffTimeSummary[staff.Id] : new Dictionary<Guid, decimal>();
            for (var i = 0; i < 10; i++)
            {
                var planningPoint = new GetPointSummaryV1.StaffSummary.PlanningPoint()
                {
                    Sequence = i + 1,
                };

                if (staffPoints.ContainsKey(i + 1))
                {
                    var point = staffPoints[i + 1];
                    planningPoint.ChargeCodeId = point.ChargeCodeId;
                    planningPoint.ChargeCode = point.ChargeCode.Code;
                    planningPoint.ProjectId = point.ChargeCode.ProjectId;
                    planningPoint.ProjectName = point.ChargeCode.Project?.Name;
                    planningPoint.ClientId = point.ChargeCode.Project?.ClientId;
                    planningPoint.ClientName = point.ChargeCode.Project?.Client?.Name;
                    if (staffTimeSummary.ContainsKey(point.ChargeCodeId) && staffTimeSummary[point.ChargeCodeId] >= 4)
                    {
                        planningPoint.Completed = true;
                        staffTimeSummary[point.ChargeCodeId] -= 4;
                    }
                }

                summary.Points.Add(planningPoint);
                summary.Completed = summary.Points.Where(t => t.ChargeCodeId.HasValue).Count() == 10;
            }

            response.Staff.Add(summary);
        }

        if (!String.IsNullOrEmpty(request.Search))
        {
            response.Staff = response.Staff
                .Where(staff =>
                    staff.StaffName.ToLower().Contains(request.Search.ToLower()) ||
                    staff.Points.Any(point => point.ChargeCode?.ToLower()?.Contains(request.Search.ToLower()) ?? false) ||
                    staff.Points.Any(point => point.ClientName?.ToLower()?.Contains(request.Search.ToLower()) ?? false) ||
                    staff.Points.Any(point => point.ProjectName?.ToLower()?.Contains(request.Search.ToLower()) ?? false)
                ).ToList();
        }

        response.TotalPoints = response.Staff.Sum(t => t.Points.Where(x => x.ChargeCodeId.HasValue).Count());
        response.EmptyPoints = response.Staff.Count * 10 - response.TotalPoints;

        return response;
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

                for (int i = points.Count - 1; i >= points.Count - (upcomingHolidays.Count * 2); i--)
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