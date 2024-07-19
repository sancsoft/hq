using Asp.Versioning;

using FluentResults.Extensions.AspNetCore;

using HQ.Abstractions.Common;
using HQ.Abstractions.Plan;
using HQ.Abstractions.Staff;
using HQ.API;
using HQ.Server.Authorization;
using HQ.Server.Services;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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

        public PlanControllerV1(PlanServiceV1 PlanService)
        {
            _PlanService = PlanService;
        }
        [Authorize(HQAuthorizationPolicies.Staff)]
        [HttpPost(nameof(GetPlanV1))]
        [ProducesResponseType<GetPlanV1.Response>(StatusCodes.Status200OK)]
        public Task<ActionResult> GetPlanV1([FromBody] GetPlanV1.Request request, CancellationToken ct = default) =>
            _PlanService.GetPlanV1(request, ct)
            .ToActionResult(new HQResultEndpointProfile());

        [Authorize(HQAuthorizationPolicies.Staff)]
        [HttpPost(nameof(UpsertPlanV1))]
        [ProducesResponseType<UpsertPlanV1.Response>(StatusCodes.Status201Created)]
        public Task<ActionResult> UpsertPlanV1([FromBody] UpsertPlanV1.Request request, CancellationToken ct = default) =>
            _PlanService.UpsertPlanV1(request, ct)
            .ToActionResult(new HQResultEndpointProfile());

    

       
    
    }
}