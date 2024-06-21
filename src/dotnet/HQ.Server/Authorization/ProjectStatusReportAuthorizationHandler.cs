using HQ.Server.Data;
using HQ.Server.Data.Models;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authorization.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace HQ.Server.Authorization;

public class ProjectStatusReportAuthorizationHandler : AuthorizationHandler<OperationAuthorizationRequirement, ProjectStatusReport>
{
    private readonly HQDbContext _context;

    public ProjectStatusReportAuthorizationHandler(HQDbContext context)
    {
        _context = context;
    }

    protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, OperationAuthorizationRequirement requirement, ProjectStatusReport resource)
    {
        var staffId = context.User.GetStaffId();

        var isManager = context.User.IsInRole("manager");
        var isPartner = context.User.IsInRole("partner");
        var isExecutive = context.User.IsInRole("executive");
        var isAdmin = context.User.IsInRole("administrator");

        switch (requirement.Name)
        {
            case nameof(ProjectStatusReportOperation.ApproveTime):
            case nameof(ProjectStatusReportOperation.UnapproveTime):
            case nameof(ProjectStatusReportOperation.RejectTime):
            case nameof(ProjectStatusReportOperation.UpdateTime):
            case nameof(ProjectStatusReportOperation.SubmitReport):
            case nameof(ProjectStatusReportOperation.UpdateReportMarkdown):
                {
                    if ((staffId.HasValue && resource.ProjectManagerId.HasValue && isManager && staffId == resource.ProjectManagerId) || isPartner || isExecutive || isAdmin)
                    {
                        context.Succeed(requirement);
                    }

                    break;
                }
        }

        return Task.CompletedTask;
    }
}