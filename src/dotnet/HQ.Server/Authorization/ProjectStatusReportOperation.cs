﻿using Microsoft.AspNetCore.Authorization.Infrastructure;

namespace HQ.Server.Authorization;

public class ProjectStatusReportOperation
{
    public static OperationAuthorizationRequirement ApproveTime = new OperationAuthorizationRequirement { Name = nameof(ApproveTime) };
    public static OperationAuthorizationRequirement RejectTime = new OperationAuthorizationRequirement { Name = nameof(RejectTime) };
    public static OperationAuthorizationRequirement UpdateTime = new OperationAuthorizationRequirement { Name = nameof(UpdateTime) };
}