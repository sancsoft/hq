using HQ.Server.Data;
using HQ.Server.Data.Models;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authorization.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace HQ.Server.Authorization;

public class ProjectsAuthorizationHandler : AuthorizationHandler<OperationAuthorizationRequirement, Project>
{
    private readonly HQDbContext _context;

    public ProjectsAuthorizationHandler(HQDbContext context)
    {
        _context = context;
    }

    protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, OperationAuthorizationRequirement requirement, Project resource)
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

        if (staffId.Value != resource.ProjectManagerId)
        {
            return;
        }

        var staff = await _context.Staff.FindAsync(staffId.Value);
        if (staff == null)
        {
            return;
        }
        if (requirement.Name == nameof(ProjectsOperation.AddProjectMember))
        {
            context.Succeed(requirement);
            return;
        }
        switch (requirement.Name)
        {
            case nameof(ProjectsOperation.AddProjectMember):
                if (staffId.Value == resource.ProjectManagerId)
                {
                    context.Succeed(requirement);
                }

                break;
            case nameof(ProjectsOperation.DeleteProjectActivity):
                if (staffId.Value == resource.ProjectManagerId)
                {
                    context.Succeed(requirement);
                }

                break;
            case nameof(ProjectsOperation.UpsertProjectActivity):
                {
                    context.Succeed(requirement);
                }
                break;
            case nameof(ProjectsOperation.RemoveProjectMember):
                {
                    context.Succeed(requirement);
                }
                break;
        }

    }
}