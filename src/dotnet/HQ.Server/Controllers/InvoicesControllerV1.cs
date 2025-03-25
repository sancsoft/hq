using Asp.Versioning;

using FluentResults.Extensions.AspNetCore;

using HQ.Abstractions.Common;
using HQ.Abstractions.Invoices;
using HQ.API;
using HQ.Server.Authorization;
using HQ.Server.Invoices;
using HQ.Server.Services;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HQ.Server.Controllers
{
    [Authorize]
    [ApiController]
    [ApiVersion(1.0)]
    [Tags("Invoices")]
    [Route("v{version:apiVersion}/Invoices")]
    [ProducesResponseType<List<ErrorSummaryV1>>(StatusCodes.Status400BadRequest)]
    public class InvoicesControllerV1 : ControllerBase
    {
        private readonly InvoicesServiceV1 _invoicesService;

        public InvoicesControllerV1(InvoicesServiceV1 invoicesService)
        {
            _invoicesService = invoicesService;
        }

        [Authorize(HQAuthorizationPolicies.Staff)]
        [HttpPost(nameof(GetInvoicesV1))]
        [ProducesResponseType<GetInvoicesV1.Response>(StatusCodes.Status200OK)]
        public Task<ActionResult> GetInvoicesV1([FromBody] GetInvoicesV1.Request request, CancellationToken ct = default) =>
            _invoicesService.GetInvoicesV1(request, ct)
            .ToActionResult(new HQResultEndpointProfile());

        [Authorize(HQAuthorizationPolicies.Staff)]
        [HttpPost(nameof(GetInvoiceDetailsV1))]
        [ProducesResponseType<GetInvoiceDetailsV1.Response>(StatusCodes.Status200OK)]
        public Task<ActionResult> GetInvoiceDetailsV1([FromBody] GetInvoiceDetailsV1.Request request, CancellationToken ct = default) =>
            _invoicesService.GetInvoiceDetailsV1(request, ct)
            .ToActionResult(new HQResultEndpointProfile());
    }
}