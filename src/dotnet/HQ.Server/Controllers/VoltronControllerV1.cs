using Asp.Versioning;
using FluentResults.Extensions.AspNetCore;
using HQ.Abstractions.Voltron;
using HQ.Abstractions.Common;
using HQ.API;
using HQ.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HQ.Abstractions.Staff;
using HQ.Server.Authorization;

namespace HQ.Server.Controllers
{
    [Authorize]
    [ApiController]
    [ApiVersion(1.0)]
    [Tags("Voltron")]
    [Route("v{version:apiVersion}/Voltron")]
    [ProducesResponseType<List<ErrorSummaryV1>>(StatusCodes.Status400BadRequest)]
    public class VoltronControllerV1 : ControllerBase
    {
        private readonly VoltronServiceV1 _voltronService;

        public VoltronControllerV1(VoltronServiceV1 VoltronService)
        {
            _voltronService = VoltronService;
        }

        [Authorize(HQAuthorizationPolicies.Administrator)]
        [HttpPost(nameof(ImportVoltronChargeCodesV1))]
        [Consumes("multipart/form-data")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        public Task<ActionResult> ImportVoltronChargeCodesV1(IFormFile file, CancellationToken ct = default)
        {
            var request = new ImportVoltronChargeCodesV1.Request();
            var stream = file.OpenReadStream();

            request.File = stream;

            return _voltronService.ImportVoltronChargeCodesV1(request, ct)
                .ToActionResult(new HQResultEndpointProfile());
        }

        [Authorize(HQAuthorizationPolicies.Administrator)]
        [HttpPost(nameof(ImportVoltronTimeSheetsV1))]
        [Consumes("multipart/form-data")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        public Task<ActionResult> ImportVoltronTimeSheetsV1([FromForm] DateOnly from, [FromForm] DateOnly to, [FromForm] List<IFormFile> files, [FromForm] bool replace, CancellationToken ct = default)
        {
            var request = new ImportVoltronTimeSheetsV1.Request();

            request.From = from;
            request.To = to;
            request.Replace = replace;

            foreach(var file in files)
            {
                request.Files.Add((file.FileName, file.OpenReadStream()));
            }

            return _voltronService.ImportVoltronTimeSheetsV1(request, ct)
                .ToActionResult(new HQResultEndpointProfile());
        }
    }
}
