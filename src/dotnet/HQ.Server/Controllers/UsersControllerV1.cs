﻿using Asp.Versioning;
using FluentResults.Extensions.AspNetCore;
using HQ.Abstractions.Users;
using HQ.Abstractions.Common;
using HQ.API;
using HQ.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HQ.Server.Authorization;

namespace HQ.Server.Controllers
{
    [Authorize]
    [ApiController]
    [ApiVersion(1.0)]
    [Tags("Users")]
    [Route("v{version:apiVersion}/Users")]
    [ProducesResponseType<List<ErrorSummaryV1>>(StatusCodes.Status400BadRequest)]
    public class UsersControllerV1 : ControllerBase
    {
        private readonly UserServiceV1 _userService;

        public UsersControllerV1(UserServiceV1 userService)
        {
            _userService = userService;
        }

        [Authorize(HQAuthorizationPolicies.Staff)]
        [HttpPost(nameof(GetUsersV1))]
        [ProducesResponseType<GetUsersV1.Response>(StatusCodes.Status200OK)]
        public Task<ActionResult> GetUsersV1([FromBody] GetUsersV1.Request request, CancellationToken ct = default) =>
             _userService.GetUsersV1(request, ct)
            .ToActionResult(new HQResultEndpointProfile());
    }
}