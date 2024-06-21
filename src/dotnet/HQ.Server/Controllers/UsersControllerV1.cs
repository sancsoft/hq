using Asp.Versioning;

using FluentResults.Extensions.AspNetCore;

using HQ.Abstractions.Common;
using HQ.Abstractions.Users;
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
    [Tags("Users")]
    [Route("v{version:apiVersion}/Users")]
    [ProducesResponseType<List<ErrorSummaryV1>>(StatusCodes.Status400BadRequest)]
    public class UsersControllerV1 : ControllerBase
    {
        private readonly UserServiceV1 _userService;

        public UsersControllerV1(UserServiceV1 userService)
        {
            _userService = userService;
        }

        [Authorize(HQAuthorizationPolicies.Staff)]
        [HttpPost(nameof(GetUsersV1))]
        [ProducesResponseType<GetUsersV1.Response>(StatusCodes.Status200OK)]
        public Task<ActionResult> GetUsersV1([FromBody] GetUsersV1.Request request, CancellationToken ct = default) =>
             _userService.GetUsersV1(request, ct)
            .ToActionResult(new HQResultEndpointProfile());

        [Authorize(HQAuthorizationPolicies.Administrator)]
        [HttpPost(nameof(UpsertUserV1))]
        [ProducesResponseType<UpsertUserV1.Response>(StatusCodes.Status200OK)]
        public Task<ActionResult> UpsertUserV1([FromBody] UpsertUserV1.Request request, CancellationToken ct = default) =>
             _userService.UpsertUserV1(request, ct)
            .ToActionResult(new HQResultEndpointProfile());

        [Authorize(HQAuthorizationPolicies.Administrator)]
        [HttpPost(nameof(ImportUsersV1))]
        [Consumes("multipart/form-data")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        public Task<ActionResult> ImportUsersV1(IFormFile file, CancellationToken ct = default)
        {
            var request = new ImportUsersV1.Request();
            var stream = file.OpenReadStream();

            request.File = stream;

            return _userService.ImportUsersV1(request, ct)
                .ToActionResult(new HQResultEndpointProfile());
        }
    }
}