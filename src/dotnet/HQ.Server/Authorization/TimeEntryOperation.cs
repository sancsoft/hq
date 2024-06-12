using Microsoft.AspNetCore.Authorization.Infrastructure;

namespace HQ.Server.Authorization;

public class TimeEntryOperation
{
    public static OperationAuthorizationRequirement UpsertTime = new OperationAuthorizationRequirement { Name = nameof(UpsertTime) };
    public static OperationAuthorizationRequirement GetTimes = new OperationAuthorizationRequirement { Name = nameof(GetTimes) };

    public static OperationAuthorizationRequirement DeleteTime = new OperationAuthorizationRequirement { Name = nameof(DeleteTime) };

}
