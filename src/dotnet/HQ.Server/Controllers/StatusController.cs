using Asp.Versioning;

using FluentResults.Extensions.AspNetCore;

using HQ.Abstractions.Common;
using HQ.Abstractions.Status;
using HQ.Abstractions.Staff;
using HQ.API;
using HQ.Server.Authorization;
using HQ.Server.Data;
using HQ.Server.Data.Models;
using HQ.Server.Services;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HQ.Server.Controllers
{
    [Authorize]
    [ApiController]
    [ApiVersion(1.0)]
    [Tags("Status")]
    [Route("v{version:apiVersion}/Status")]
    [ProducesResponseType<List<ErrorSummaryV1>>(StatusCodes.Status400BadRequest)]
    public class StatusControllerV1 : ControllerBase
    {
        private readonly StatusServiceV1 _StatusService;
        private readonly HQDbContext _context;
        private readonly IAuthorizationService _authorizationService;


        public StatusControllerV1(StatusServiceV1 StatusService, HQDbContext context, IAuthorizationService authorizationService)
        {
            _StatusService = StatusService;
            _context = context;
            _authorizationService = authorizationService;

        }
        [Authorize(HQAuthorizationPolicies.Staff)]
        [HttpPost(nameof(GetStatusV1))]
        [ProducesResponseType<GetStatusV1.Response>(StatusCodes.Status200OK)]
        public Task<ActionResult> GetStatusV1([FromBody] GetStatusV1.Request request, CancellationToken ct = default) =>
            _StatusService.GetStatusV1(request, ct)
            .ToActionResult(new HQResultEndpointProfile());

        [Authorize(HQAuthorizationPolicies.Staff)]
        [HttpPost(nameof(UpsertStatusV1))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType<UpsertStatusV1.Response>(StatusCodes.Status201Created)]
        public async Task<ActionResult> UpsertStatusV1([FromBody] UpsertStatusV1.Request request, CancellationToken ct = default)
        {
            if (request.Id.HasValue)
            {
                var Status = await _context.Plans
                    .AsNoTracking()
                    .SingleOrDefaultAsync(t => t.Id == request.Id);

                if (Status == null)
                {
                    return NotFound();
                }
                var authorizationResult = await _authorizationService
                    .AuthorizeAsync(User, Status, PlanOperation.UpsertPlan);

                if (!authorizationResult.Succeeded)
                {
                    return Forbid();
                }
            }
            else
            {
                var staffId = User.GetStaffId();
                if (!staffId.HasValue)
                {
                    return Forbid();
                }
                request.StaffId = staffId.Value;

                var authorizationResult = await _authorizationService
                    .AuthorizeAsync(User, new Plan() { StaffId = request.StaffId, Status = request.Status }, PlanOperation.UpsertPlan);

                if (!authorizationResult.Succeeded)
                {
                    return Forbid();
                }
            }
            return await _StatusService.UpsertStatusV1(request, ct)
            .ToActionResult(new HQResultEndpointProfile());
        }





    }
}