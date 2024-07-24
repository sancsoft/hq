using Microsoft.AspNetCore.Authorization.Infrastructure;

namespace HQ.Server.Authorization;

public class PointsOperation
{
    public static OperationAuthorizationRequirement UpsertPoints = new OperationAuthorizationRequirement { Name = nameof(UpsertPoints) };



}