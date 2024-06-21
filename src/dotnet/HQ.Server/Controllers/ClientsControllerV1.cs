using Asp.Versioning;

using FluentResults.Extensions.AspNetCore;

using HQ.Abstractions.Clients;
using HQ.Abstractions.Common;
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
    [Tags("Clients")]
    [Route("v{version:apiVersion}/Clients")]
    [ProducesResponseType<List<ErrorSummaryV1>>(StatusCodes.Status400BadRequest)]
    public class ClientsControllerV1 : ControllerBase
    {
        private readonly ClientServiceV1 _clientService;

        public ClientsControllerV1(ClientServiceV1 clientService)
        {
            _clientService = clientService;
        }

        [Authorize(HQAuthorizationPolicies.Staff)]
        [HttpPost(nameof(GetClientsV1))]
        [ProducesResponseType<GetClientsV1.Response>(StatusCodes.Status200OK)]
        public Task<ActionResult> GetClientsV1([FromBody] GetClientsV1.Request request, CancellationToken ct = default) =>
             _clientService.GetClientsV1(request, ct)
            .ToActionResult(new HQResultEndpointProfile());

        [Authorize(HQAuthorizationPolicies.Staff)]
        [HttpPost(nameof(GetClientInvoiceSummaryV1))]
        [ProducesResponseType<GetClientInvoiceSummaryV1.Response>(StatusCodes.Status200OK)]
        public Task<ActionResult> GetClientInvoiceSummaryV1([FromBody] GetClientInvoiceSummaryV1.Request request, CancellationToken ct = default) =>
            _clientService.GetClientInvoiceSummaryV1(request, ct)
            .ToActionResult(new HQResultEndpointProfile());

        [Authorize(HQAuthorizationPolicies.Administrator)]
        [HttpPost(nameof(UpsertClientV1))]
        [ProducesResponseType<UpsertClientV1.Response>(StatusCodes.Status200OK)]
        public Task<ActionResult> UpsertClientV1([FromBody] UpsertClientV1.Request request, CancellationToken ct = default) =>
            _clientService.UpsertClientV1(request, ct)
            .ToActionResult(new HQResultEndpointProfile());

        [Authorize(HQAuthorizationPolicies.Administrator)]
        [HttpPost(nameof(DeleteClientV1))]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public Task<ActionResult> DeleteClientV1([FromBody] DeleteClientV1.Request request, CancellationToken ct = default) =>
            _clientService.DeleteClientV1(request, ct)
            .ToActionResult(new HQResultEndpointProfile());

        [Authorize(HQAuthorizationPolicies.Administrator)]
        [HttpPost(nameof(ImportClientsV1))]
        [Consumes("multipart/form-data")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        public Task<ActionResult> ImportClientsV1(IFormFile file, CancellationToken ct = default)
        {
            var request = new ImportClientsV1.Request();
            var stream = file.OpenReadStream();

            request.File = stream;

            return _clientService.ImportClientsV1(request, ct)
                .ToActionResult(new HQResultEndpointProfile());
        }
    }
}