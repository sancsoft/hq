using Asp.Versioning;

using FluentResults.Extensions.AspNetCore;

using HQ.Abstractions.Common;
using HQ.Abstractions.Projects;
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
    [Tags("Projects")]
    [Route("v{version:apiVersion}/Projects")]
    [ProducesResponseType<List<ErrorSummaryV1>>(StatusCodes.Status400BadRequest)]
    public class ProjectsControllerV1 : ControllerBase
    {
        private readonly ProjectServiceV1 _projectService;

        public ProjectsControllerV1(ProjectServiceV1 projectService)
        {
            _projectService = projectService;
        }

        [Authorize(HQAuthorizationPolicies.Staff)]
        [HttpPost(nameof(GetProjectsV1))]
        [ProducesResponseType<GetProjectsV1.Response>(StatusCodes.Status200OK)]
        public Task<ActionResult> GetProjectsV1([FromBody] GetProjectsV1.Request request, CancellationToken ct = default) =>
            _projectService.GetProjectsV1(request, ct)
            .ToActionResult(new HQResultEndpointProfile());

        [Authorize(HQAuthorizationPolicies.Staff)]
        [HttpPost(nameof(GetProjectActivitiesV1))]
        [ProducesResponseType<GetProjectActivitiesV1.Response>(StatusCodes.Status200OK)]
        public Task<ActionResult> GetProjectActivitiesV1([FromBody] GetProjectActivitiesV1.Request request, CancellationToken ct = default) =>
            _projectService.GetProjectActivitiesV1(request, ct)
            .ToActionResult(new HQResultEndpointProfile());

        [Authorize(HQAuthorizationPolicies.Manager)]
        [HttpPost(nameof(UpsertProjectV1))]
        [ProducesResponseType<UpsertProjectV1.Response>(StatusCodes.Status201Created)]
        public Task<ActionResult> UpsertProjectV1([FromBody] UpsertProjectV1.Request request, CancellationToken ct = default) =>
            _projectService.UpsertProjectV1(request, ct)
            .ToActionResult(new HQResultEndpointProfile());

        [Authorize(HQAuthorizationPolicies.Manager)]
        [HttpPost(nameof(UpsertProjectActivityV1))]
        [ProducesResponseType<UpsertProjectActivityV1.Response>(StatusCodes.Status201Created)]
        public Task<ActionResult> UpsertProjectActivityV1([FromBody] UpsertProjectActivityV1.Request request, CancellationToken ct = default) =>
            _projectService.UpsertProjectActivityV1(request, ct)
            .ToActionResult(new HQResultEndpointProfile());

        [Authorize(HQAuthorizationPolicies.Manager)]
        [HttpPost(nameof(DeleteProjectV1))]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public Task<ActionResult> DeleteProjectV1([FromBody] DeleteProjectV1.Request request, CancellationToken ct = default) =>
            _projectService.DeleteProjectV1(request, ct)
            .ToActionResult(new HQResultEndpointProfile());


        [Authorize(HQAuthorizationPolicies.Manager)]
        [HttpPost(nameof(DeleteProjectActivityV1))]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public Task<ActionResult> DeleteProjectActivityV1([FromBody] DeleteProjectActivityV1.Request request, CancellationToken ct = default) =>
            _projectService.DeleteProjectActivityV1(request, ct)
            .ToActionResult(new HQResultEndpointProfile());

        [Authorize(HQAuthorizationPolicies.Manager)]
        [HttpPost(nameof(AddProjectMemberV1))]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public Task<ActionResult> AddProjectMemberV1([FromBody] AddProjectMemberV1.Request request, CancellationToken ct = default) =>
            _projectService.AddProjectMemberV1(request, ct)
            .ToActionResult(new HQResultEndpointProfile());

        [Authorize(HQAuthorizationPolicies.Manager)]
        [HttpPost(nameof(RemoveProjectMemberV1))]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public Task<ActionResult> RemoveProjectMemberV1([FromBody] RemoveProjectMemberV1.Request request, CancellationToken ct = default) =>
            _projectService.RemoveProjectMemberV1(request, ct)
            .ToActionResult(new HQResultEndpointProfile());

        [Authorize(HQAuthorizationPolicies.Administrator)]
        [HttpPost(nameof(ImportProjectsV1))]
        [Consumes("multipart/form-data")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        public Task<ActionResult> ImportProjectsV1(IFormFile file, CancellationToken ct = default)
        {
            var request = new ImportProjectsV1.Request();
            var stream = file.OpenReadStream();

            request.File = stream;

            return _projectService.ImportProjectsV1(request, ct)
                .ToActionResult(new HQResultEndpointProfile());
        }
    }
}