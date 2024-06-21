using Asp.Versioning;

using FluentResults.Extensions.AspNetCore;

using HQ.Abstractions.ChargeCodes;
using HQ.Abstractions.Common;
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
    [Tags("ChargeCodes")]
    [Route("v{version:apiVersion}/ChargeCodes")]
    [ProducesResponseType<List<ErrorSummaryV1>>(StatusCodes.Status400BadRequest)]
    public class ChargeCodesControllerV1 : ControllerBase
    {
        private readonly ChargeCodeServiceV1 _ChargeCodeService;

        public ChargeCodesControllerV1(ChargeCodeServiceV1 ChargeCodeService)
        {
            _ChargeCodeService = ChargeCodeService;
        }

        [Authorize(HQAuthorizationPolicies.Administrator)]
        [HttpPost(nameof(UpsertChargeCodesV1))]
        [ProducesResponseType<UpsertChargeCodeV1.Response>(StatusCodes.Status200OK)]
        public Task<ActionResult> UpsertChargeCodesV1([FromBody] UpsertChargeCodeV1.Request request, CancellationToken ct = default) =>
            _ChargeCodeService.UpsertChargeCodeV1(request, ct)
            .ToActionResult(new HQResultEndpointProfile());

        [Authorize(HQAuthorizationPolicies.Staff)]
        [HttpPost(nameof(GetChargeCodesV1))]
        [ProducesResponseType<GetChargeCodesV1.Response>(StatusCodes.Status200OK)]
        public Task<ActionResult> GetChargeCodesV1([FromBody] GetChargeCodesV1.Request request, CancellationToken ct = default) =>
            _ChargeCodeService.GetChargeCodesV1(request, ct)
            .ToActionResult(new HQResultEndpointProfile());
    }
}