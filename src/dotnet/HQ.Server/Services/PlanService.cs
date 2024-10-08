using FluentResults;

using Hangfire;

using HQ.Abstractions;
using HQ.Abstractions.Enumerations;
using HQ.Abstractions.Plan;
using HQ.Abstractions.Staff;
using HQ.Server.Data;

using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
namespace HQ.Server.Services;
public class PlanServiceV1
{
    private readonly HQDbContext _context;
    private readonly IBackgroundJobClient _backgroundJobClient;

    public PlanServiceV1(HQDbContext context, IBackgroundJobClient backgroundJobClient)
    {
        _context = context;
        _backgroundJobClient = backgroundJobClient;

    }

    public async Task<Result<UpsertPlanV1.Response>> UpsertPlanV1(UpsertPlanV1.Request request, CancellationToken ct = default)
    {
        var plan = await _context.Plans
            .Where(p => p.Date == request.Date && p.StaffId == request.StaffId)
            .FirstOrDefaultAsync(ct);

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
            .OrderByDescending(t => t.Date)
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

    public async Task<Result<PreviousPlanV1.Response>> PreviousPlanV1(PreviousPlanV1.Request request, CancellationToken ct = default)
    {

        var previousPlan = await _context.Plans.AsNoTracking().Where(t => t.StaffId == request.StaffId && t.Date < request.Date).OrderByDescending(t => t.Date).FirstOrDefaultAsync();

        if (previousPlan == null)
        {
            return Result.Fail("Unable to find previous Plan.");
        }

        return new PreviousPlanV1.Response()
        {
            PlanId = previousPlan.Id,
            body = previousPlan.Body,
            StaffId = previousPlan.StaffId
        };
    }
    public async Task BackgroundSendPlanSubmissionReminderEmail(Period period, CancellationToken ct)
    {
        var date = DateOnly.FromDateTime(DateTime.UtcNow).GetPeriodStartDate(period);
        if (date.DayOfWeek == DayOfWeek.Sunday || date.DayOfWeek == DayOfWeek.Saturday)
        {
            return;
        }

        var plans = _context.Plans.Where(t => t.Date == date);
        var unsubmittedPlansStatus = plans.Where(t => t.Body == null || t.Status == null);
        var holidayChargeCode = await _context.ChargeCodes.Where(t => t.Project!.Name.ToLower().Contains("holiday")).FirstOrDefaultAsync(ct);
        var vacationChargeCode = await _context.ChargeCodes.Where(t => t.Project!.Name.ToLower().Contains("vacation")).FirstOrDefaultAsync(ct);
        if (holidayChargeCode == null || vacationChargeCode == null)
        {
            return;
        }

        var times = _context.Times.Where(t => t.Date == date);
        var holidayVacationTimes = times.Where(t => t.ChargeCodeId == holidayChargeCode.Id || t.ChargeCodeId == vacationChargeCode.Id);

        var staffToNotify = await _context.Staff
            .AsNoTracking()
            .Where(t => t.EndDate == null && holidayVacationTimes.Where(x => x.StaffId == t.Id).Count() == 0 && (plans.Where(x => x.StaffId == t.Id).Count() == 0 || unsubmittedPlansStatus.Where(x => x.StaffId == t.Id).Count() > 0))
            .ToListAsync(ct);

        foreach (var staff in staffToNotify)
        {
            _backgroundJobClient.Enqueue<EmailMessageService>(t => t.SendPlanSubmissionReminderEmail(staff.Id, date, CancellationToken.None));
        }
    }
}