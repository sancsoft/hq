using Asp.Versioning;

using FluentResults.Extensions.AspNetCore;

using HQ.Abstractions.Common;
using HQ.Abstractions.Plan;
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
    [Tags("Plan")]
    [Route("v{version:apiVersion}/Plan")]
    [ProducesResponseType<List<ErrorSummaryV1>>(StatusCodes.Status400BadRequest)]
    public class PlanControllerV1 : ControllerBase
    {
        private readonly PlanServiceV1 _PlanService;
        private readonly HQDbContext _context;
        private readonly IAuthorizationService _authorizationService;


        public PlanControllerV1(PlanServiceV1 PlanService, HQDbContext context, IAuthorizationService authorizationService)
        {
            _PlanService = PlanService;
            _context = context;
            _authorizationService = authorizationService;

        }
        [Authorize(HQAuthorizationPolicies.Staff)]
        [HttpPost(nameof(GetPlanV1))]
        [ProducesResponseType<GetPlanV1.Response>(StatusCodes.Status200OK)]
        public Task<ActionResult> GetPlanV1([FromBody] GetPlanV1.Request request, CancellationToken ct = default) =>
            _PlanService.GetPlanV1(request, ct)
            .ToActionResult(new HQResultEndpointProfile());

        [Authorize(HQAuthorizationPolicies.Staff)]
        [HttpPost(nameof(UpsertPlanV1))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType<UpsertPlanV1.Response>(StatusCodes.Status201Created)]
        public async Task<ActionResult> UpsertPlanV1([FromBody] UpsertPlanV1.Request request, CancellationToken ct = default)
        {
            if (request.Id.HasValue)
            {
                var plan = await _context.Plans
                    .AsNoTracking()
                    .SingleOrDefaultAsync(t => t.Id == request.Id);

                if (plan == null)
                {
                    return NotFound();
                }
                var authorizationResult = await _authorizationService
                    .AuthorizeAsync(User, plan, PlanOperation.UpsertPlan);

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
                    .AuthorizeAsync(User, new Plan() { StaffId = request.StaffId, Date = request.Date, Body = request.Body, Status = request.Status }, PlanOperation.UpsertPlan);

                if (!authorizationResult.Succeeded)
                {
                    return Forbid();
                }
            }
            return await _PlanService.UpsertPlanV1(request, ct)
            .ToActionResult(new HQResultEndpointProfile());
        }





    }
}