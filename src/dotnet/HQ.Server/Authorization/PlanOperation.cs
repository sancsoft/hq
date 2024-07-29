using Microsoft.AspNetCore.Authorization.Infrastructure;

namespace HQ.Server.Authorization;

public class PlanOperation
{
    public static OperationAuthorizationRequirement UpsertPlan = new OperationAuthorizationRequirement { Name = nameof(UpsertPlan) };
    public static OperationAuthorizationRequirement GetPlan = new OperationAuthorizationRequirement { Name = nameof(GetPlan) };


}