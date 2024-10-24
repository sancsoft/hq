using Asp.Versioning;

using FluentResults.Extensions.AspNetCore;

using HQ.Abstractions.Common;
using HQ.Abstractions.Holiday;
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
    [Tags("Holiday")]
    [Route("v{version:apiVersion}/Holiday")]
    [ProducesResponseType<List<ErrorSummaryV1>>(StatusCodes.Status400BadRequest)]
    public class HolidayControllerV1 : ControllerBase
    {
        private readonly HolidayServiceV1 _holidayervice;

        public HolidayControllerV1(HolidayServiceV1 holidayervice)
        {
            _holidayervice = holidayervice;
        }

        [Authorize(HQAuthorizationPolicies.Staff)]
        [HttpPost(nameof(GetHolidayV1))]
        [ProducesResponseType<GetHolidayV1.Response>(StatusCodes.Status200OK)]
        public Task<ActionResult> GetHolidayV1([FromBody] GetHolidayV1.Request request, CancellationToken ct = default) =>
            _holidayervice.GetHolidayV1(request, ct)
            .ToActionResult(new HQResultEndpointProfile());

        [Authorize(HQAuthorizationPolicies.Administrator)]
        [HttpPost(nameof(UpsertHolidayV1))]
        [ProducesResponseType<UpsertHolidayV1.Response>(StatusCodes.Status201Created)]
        public Task<ActionResult> UpsertHolidayV1([FromBody] UpsertHolidayV1.Request request, CancellationToken ct = default) =>
            _holidayervice.UpsertHolidayV1(request, ct)
            .ToActionResult(new HQResultEndpointProfile());

        [Authorize(HQAuthorizationPolicies.Administrator)]
        [HttpPost(nameof(GenerateAutoGenerateHolidayTimeEntryV1))]
        public async Task GenerateAutoGenerateHolidayTimeEntryV1(CancellationToken ct = default) =>
            await _holidayervice.BackgroundAutoGenerateHolidayTimeEntryV1(ct);

        [Authorize(HQAuthorizationPolicies.Administrator)]
        [HttpPost(nameof(DeleteHolidayV1))]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public Task<ActionResult> DeleteHolidayV1([FromBody] DeleteHolidayV1.Request request, CancellationToken ct = default) =>
            _holidayervice.DeleteHolidayV1(request, ct)
            .ToActionResult(new HQResultEndpointProfile());



        [Authorize(HQAuthorizationPolicies.Administrator)]
        [HttpPost(nameof(ImportHolidayV1))]
        [Consumes("multipart/form-data")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        public Task<ActionResult> ImportHolidayV1(IFormFile file, CancellationToken ct = default)
        {
            var request = new ImportHolidayV1.Request();
            var stream = file.OpenReadStream();

            request.File = stream;

            return _holidayervice.ImportHolidayV1(request, ct)
                .ToActionResult(new HQResultEndpointProfile());
        }
    }
}