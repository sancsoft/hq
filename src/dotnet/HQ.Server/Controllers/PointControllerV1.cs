using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;

using Asp.Versioning;

using FluentResults.Extensions.AspNetCore;

using Hangfire;

using HQ.Abstractions.Common;
using HQ.Abstractions.Points;
using HQ.API;
using HQ.Server.Authorization;
using HQ.Server.Data.Models;
using HQ.Server.Services;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace HQ.Server.Controllers
{
    [Authorize]
    [ApiController]
    [ApiVersion(1.0)]
    [Tags("Point")]
    [Route("v{version:apiVersion}/Point")]
    [ProducesResponseType<List<ErrorSummaryV1>>(StatusCodes.Status400BadRequest)]
    public class PointControllerV1 : ControllerBase
    {
        private readonly PointServiceV1 _pointService;
        private readonly IAuthorizationService _authorizationService;
        private readonly IBackgroundJobClient _backgroundJobClient;


        public PointControllerV1(PointServiceV1 pointService, IAuthorizationService authorizationService, IBackgroundJobClient backgroundJobClient)
        {
            _pointService = pointService;
            _authorizationService = authorizationService;

            _backgroundJobClient = backgroundJobClient;
        }

        [Authorize(HQAuthorizationPolicies.Staff)]
        [HttpPost(nameof(GetPointsV1))]
        [ProducesResponseType<GetPointsV1.Response>(StatusCodes.Status200OK)]
        public async Task<ActionResult> GetPointsV1([FromBody] GetPointsV1.Request request, CancellationToken ct = default) =>
            await _pointService.GetPointsV1(request, ct)
            .ToActionResult(new HQResultEndpointProfile());

        [Authorize(HQAuthorizationPolicies.Staff)]
        [HttpPost(nameof(GetPointSummaryV1))]
        [ProducesResponseType<GetPointSummaryV1.Response>(StatusCodes.Status200OK)]
        public async Task<ActionResult> GetPointSummaryV1([FromBody] GetPointSummaryV1.Request request, CancellationToken ct = default) =>
            await _pointService.GetPointSummaryV1(request, ct)
            .ToActionResult(new HQResultEndpointProfile());

        [Authorize(HQAuthorizationPolicies.Administrator)]
        [HttpPost(nameof(GenerateHolidayPlanningPointsV1))]
        public async Task GenerateHolidayPlanningPointsV1([FromBody] GenerateHolidayPointsV1.Request request, CancellationToken ct = default) =>
           await _pointService.GenerateHolidayPlanningPointsV1(request, ct);

        [Authorize(HQAuthorizationPolicies.Staff)]
        [HttpPost(nameof(UpsertPointV1))]
        [ProducesResponseType<UpsertPointsV1.Response>(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult> UpsertPointV1([FromBody] UpsertPointsV1.Request request, CancellationToken ct = default)
        {
            if (!request.StaffId.HasValue)
            {
                return Forbid();
            }

            var authorizationResult = await _authorizationService
                .AuthorizeAsync(User, new Data.Models.Point() { StaffId = request.StaffId.Value, Date = request.Date }, PointsOperation.UpsertPoints);

            if (!authorizationResult.Succeeded)
            {
                return Forbid();
            }
            var result = await _pointService.UpsertPointV1(request, ct);

            if (request.StaffId.HasValue)
            {
                if (request.StaffId != User.GetStaffId() && result.IsSuccess)
                {
                    _backgroundJobClient.Enqueue<EmailMessageService>(t => t.SendUpdatedPlanningPointsEmail(request.StaffId.Value, User.GetStaffId()!.Value, request.Date, CancellationToken.None));
                }
            }
            return result.ToActionResult(new HQResultEndpointProfile());
        }

    }
}