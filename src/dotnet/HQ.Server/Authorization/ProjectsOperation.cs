using Microsoft.AspNetCore.Authorization.Infrastructure;

namespace HQ.Server.Authorization;

public class ProjectsOperation
{
    public static OperationAuthorizationRequirement RemoveProjectMember = new OperationAuthorizationRequirement { Name = nameof(RemoveProjectMember) };
    public static OperationAuthorizationRequirement AddProjectMember = new OperationAuthorizationRequirement { Name = nameof(AddProjectMember) };
    public static OperationAuthorizationRequirement DeleteProjectActivity = new OperationAuthorizationRequirement { Name = nameof(DeleteProjectActivity) };
    public static OperationAuthorizationRequirement UpsertProjectActivity = new OperationAuthorizationRequirement { Name = nameof(UpsertProjectActivity) };

}