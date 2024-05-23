using Asp.Versioning;
using FluentResults.Extensions.AspNetCore;
using HQ.Abstractions.Projects;
using HQ.Abstractions.Common;
using HQ.API;
using HQ.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HQ.Abstractions.ServicesAgreement;
using HQ.Server.Authorization;

namespace HQ.Server.Controllers
{
    [Authorize]
    [ApiController]
    [ApiVersion(1.0)]
    [Tags("ServicesAgreement")]
    [Route("v{version:apiVersion}/ServicesAgreement")]
    [ProducesResponseType<List<ErrorSummaryV1>>(StatusCodes.Status400BadRequest)]
    public class ServicesAgreementControllerV1 : ControllerBase
    {
        private readonly ServicesAgreementServiceV1 _servicesAgreement;

        public ServicesAgreementControllerV1(ServicesAgreementServiceV1 servicesAgreement)
        {
            _servicesAgreement = servicesAgreement;
        }

        [Authorize(HQAuthorizationPolicies.Staff)]
        [HttpPost(nameof(GetServicesAgreementV1))]
        [ProducesResponseType<GetServicesAgreementV1.Response>(StatusCodes.Status200OK)]
        public Task<ActionResult> ServicesAgreementV1([FromBody] GetServicesAgreementV1.Request request, CancellationToken ct = default) =>
            _servicesAgreement.GetServicesAgreement(request, ct)
            .ToActionResult(new HQResultEndpointProfile());
    }
}