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

    protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, OperationAuthorizationRequirement requirement, Time resource)
    {
        var staffId = context.User.GetStaffId();

        var isManager = context.User.IsInRole("manager");
        var isPartner = context.User.IsInRole("partner");
        var isExecutive = context.User.IsInRole("executive");
        var isAdmin = context.User.IsInRole("administrator");
        var isStaff = context.User.IsInRole("staff");


        switch (requirement.Name)
        {
            case nameof(TimeEntryOperation.GetTimes):
            case nameof(TimeEntryOperation.DeleteTime):
            case nameof(TimeEntryOperation.UpsertTime):
                {
                    if ((isStaff && staffId.HasValue && staffId.Value == resource.StaffId) || isPartner || isExecutive || isAdmin)
                    {
                        context.Succeed(requirement);
                    }

                    break;
                }
        }

        return Task.CompletedTask;
    }
}