using HQ.Abstractions.Enumerations;
using HQ.Server.Data;
using HQ.Server.Data.Models;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authorization.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace HQ.Server.Authorization;

public class PlanAuthorizationHandler : AuthorizationHandler<OperationAuthorizationRequirement, Plan>
{
    private readonly HQDbContext _context;

    public PlanAuthorizationHandler(HQDbContext context)
    {
        _context = context;
    }

    protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, OperationAuthorizationRequirement requirement, Plan resource)
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

            case nameof(PlanOperation.UpsertPlan):
                {
                    context.Succeed(requirement);
                }

                break;
            case nameof(PlanOperation.GetPlan):
                {
                    context.Succeed(requirement);
                }
                break;
        }
    }
}