using Asp.Versioning;
using FluentResults.Extensions.AspNetCore;
using HQ.Abstractions.Staff;
using HQ.Abstractions.Common;
using HQ.API;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HQ.Server.Services;

namespace HQ.Server.Controllers
{
    [Authorize]
    [ApiController]
    [ApiVersion(1.0)]
    [Tags("Staff")]
    [Route("v{version:apiVersion}/Staff")]
    [ProducesResponseType<List<ErrorSummaryV1>>(StatusCodes.Status400BadRequest)]
    public class StaffControllerV1 : ControllerBase
    {
        private readonly StafferviceV1 _staffervice;

        public StaffControllerV1(StafferviceV1 staffervice)
        {
            _staffervice = staffervice;
        }

        [HttpPost(nameof(GetStaffV1))]
        [ProducesResponseType<GetStaffV1.Response>(StatusCodes.Status200OK)]
        public Task<ActionResult> GetStaffV1([FromBody] GetStaffV1.Request request, CancellationToken ct = default) =>
            _staffervice.GetStaffV1(request, ct)
            .ToActionResult(new HQResultEndpointProfile());

        [HttpPost(nameof(UpsertStaffV1))]
        [ProducesResponseType<UpsertStaffV1.Response>(StatusCodes.Status201Created)]
        public Task<ActionResult> UpsertStaffV1([FromBody] UpsertStaffV1.Request request, CancellationToken ct = default) =>
            _staffervice.UpsertStaffV1(request, ct)
            .ToActionResult(new HQResultEndpointProfile());

        [HttpPost(nameof(DeleteStaffV1))]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public Task<ActionResult> DeleteStaffV1([FromBody] DeleteStaffV1.Request request, CancellationToken ct = default) =>
            _staffervice.DeleteStaffV1(request, ct)
            .ToActionResult(new HQResultEndpointProfile());

        [HttpPost(nameof(ImportStaffV1))]
        [Consumes("multipart/form-data")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        public Task<ActionResult> ImportStaffV1(IFormFile file, CancellationToken ct = default)
        {
            var request = new ImportStaffV1.Request();
            var stream = file.OpenReadStream();

            request.File = stream;

            return _staffervice.ImportStaffV1(request, ct)
                .ToActionResult(new HQResultEndpointProfile());
        }
    }
}
