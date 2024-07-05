using HQ.Abstractions.Enumerations;
using HQ.Server.Data;
using HQ.Server.Data.Models;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authorization.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace HQ.Server.Authorization;

public class TimeEntryAuthorizationHandler : AuthorizationHandler<OperationAuthorizationRequirement, Time>
{
    private readonly HQDbContext _context;

    public TimeEntryAuthorizationHandler(HQDbContext context)
    {
        _context = context;
    }

    protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, OperationAuthorizationRequirement requirement, Time resource)
    {
        var staffId = context.User.GetStaffId();
        var isStaff = context.User.IsInRole("staff");
        var isExecutive = context.User.IsInRole("executive");
        var isAdmin = context.User.IsInRole("administrator");

        if (isExecutive || isAdmin)
        {
            context.Succeed(requirement);
            return;
        }

        if (!isStaff)
        {
            return;
        }

        if (!staffId.HasValue)
        {
            return;
        }

        if (staffId.Value != resource.StaffId)
        {
            return;
        }

        var staff = await _context.Staff.FindAsync(staffId.Value);
        if (staff == null)
        {
            return;
        }

        switch (requirement.Name)
        {
            case nameof(TimeEntryOperation.DeleteTime):
                if (!staff.TimeEntryCutoffDate.HasValue || resource.Date >= staff.TimeEntryCutoffDate.Value)
                {
                    context.Succeed(requirement);
                }

                break;
            case nameof(TimeEntryOperation.UpsertTime):
                if (!staff.TimeEntryCutoffDate.HasValue || resource.Date >= staff.TimeEntryCutoffDate.Value || resource.Status == TimeStatus.Rejected)
                {
                    context.Succeed(requirement);
                }

                break;
            case nameof(TimeEntryOperation.GetTimes):
            case nameof(TimeEntryOperation.SubmitTimes):
                {
                    context.Succeed(requirement);
                }
                break;
        }
    }
}