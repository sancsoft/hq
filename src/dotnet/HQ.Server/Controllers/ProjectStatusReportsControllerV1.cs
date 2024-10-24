using Asp.Versioning;

using FluentResults.Extensions.AspNetCore;

using HQ.Abstractions.Common;
using HQ.Abstractions.ProjectStatusReports;
using HQ.API;
using HQ.Server.Authorization;
using HQ.Server.Data;
using HQ.Server.Services;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HQ.Server.Controllers
{
    [Authorize]
    [ApiController]
    [ApiVersion(1.0)]
    [Tags("ProjectStatusReports")]
    [Route("v{version:apiVersion}/ProjectStatusReports")]
    [ProducesResponseType<List<ErrorSummaryV1>>(StatusCodes.Status400BadRequest)]
    public class ProjectStatusReportsControllerV1 : ControllerBase
    {
        private readonly ProjectStatusReportServiceV1 _ProjectStatusReportService;
        private readonly HQDbContext _context;
        private readonly IAuthorizationService _authorizationService;

        public ProjectStatusReportsControllerV1(ProjectStatusReportServiceV1 ProjectStatusReportService, HQDbContext context, IAuthorizationService authorizationService)
        {
            _ProjectStatusReportService = ProjectStatusReportService;
            _context = context;
            _authorizationService = authorizationService;
        }

        [Authorize(HQAuthorizationPolicies.Administrator)]
        [HttpPost(nameof(GenerateWeeklyProjectStatusReportsV1))]
        [ProducesResponseType<GenerateWeeklyProjectStatusReportsV1.Response>(StatusCodes.Status200OK)]
        public Task<ActionResult> GenerateWeeklyProjectStatusReportsV1([FromBody] GenerateWeeklyProjectStatusReportsV1.Request request, CancellationToken ct = default) =>
            _ProjectStatusReportService.GenerateWeeklyProjectStatusReportsV1(request, ct)
            .ToActionResult(new HQResultEndpointProfile());

        [Authorize(HQAuthorizationPolicies.Administrator)]
        [HttpPost(nameof(AutoSubmitWeeklyProjectStatusReportsV1))]
        [ProducesResponseType<AutoSubmitWeeklyProjectStatusReportsV1.Response>(StatusCodes.Status200OK)]
        public Task<ActionResult> AutoSubmitWeeklyProjectStatusReportsV1([FromBody] AutoSubmitWeeklyProjectStatusReportsV1.Request request, CancellationToken ct = default) =>
            _ProjectStatusReportService.AutoSubmitWeeklyProjectStatusReportsV1(request, ct)
            .ToActionResult(new HQResultEndpointProfile());

        [Authorize(HQAuthorizationPolicies.Staff)]
        [HttpPost(nameof(GetProjectStatusReportsV1))]
        [ProducesResponseType<GetProjectStatusReportsV1.Response>(StatusCodes.Status200OK)]
        public Task<ActionResult> GetProjectStatusReportsV1([FromBody] GetProjectStatusReportsV1.Request request, CancellationToken ct = default) =>
            _ProjectStatusReportService.GetProjectStatusReportsV1(request, ct)
            .ToActionResult(new HQResultEndpointProfile());

        [Authorize(HQAuthorizationPolicies.Staff)]
        [HttpPost(nameof(GetPreviousProjectStatusReportsV1))]
        [ProducesResponseType<PreviousProjectStatusReportV1.Response>(StatusCodes.Status200OK)]
        public Task<ActionResult> GetPreviousProjectStatusReportsV1([FromBody] PreviousProjectStatusReportV1.Request request, CancellationToken ct = default) =>
            _ProjectStatusReportService.GetPreviousProjectStatusReportV1(request, ct)
            .ToActionResult(new HQResultEndpointProfile());

        [Authorize(HQAuthorizationPolicies.Staff)]
        [HttpPost(nameof(GetProjectStatusReportTimeV1))]
        [ProducesResponseType<GetProjectStatusReportTimeV1.Response>(StatusCodes.Status200OK)]
        public Task<ActionResult> GetProjectStatusReportTimeV1([FromBody] GetProjectStatusReportTimeV1.Request request, CancellationToken ct = default) =>
            _ProjectStatusReportService.GetProjectStatusReportTimeV1(request, ct)
            .ToActionResult(new HQResultEndpointProfile());

        [Authorize(HQAuthorizationPolicies.Manager)]
        [HttpPost(nameof(ApproveProjectStatusReportTimeRequestV1))]
        [ProducesResponseType<ApproveProjectStatusReportTimeRequestV1.Response>(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult> ApproveProjectStatusReportTimeRequestV1([FromBody] ApproveProjectStatusReportTimeRequestV1.Request request, CancellationToken ct = default)
        {
            var psr = await _context.ProjectStatusReports
                .AsNoTracking()
                .SingleOrDefaultAsync(t => t.Id == request.ProjectStatusReportId);

            if (psr == null)
            {
                return NotFound();
            }

            var authorizationResult = await _authorizationService
                .AuthorizeAsync(User, psr, ProjectStatusReportOperation.ApproveTime);

            if (!authorizationResult.Succeeded)
            {
                return Forbid();
            }

            request.AcceptedById = User.GetStaffId();

            return await _ProjectStatusReportService.ApproveProjectStatusReportTimeRequestV1(request, ct)
                .ToActionResult(new HQResultEndpointProfile());
        }

        [Authorize(HQAuthorizationPolicies.Manager)]
        [HttpPost(nameof(RejectProjectStatusReportTimeV1))]
        [ProducesResponseType<RejectProjectStatusReportTimeV1.Response>(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult> RejectProjectStatusReportTimeV1([FromBody] RejectProjectStatusReportTimeV1.Request request, CancellationToken ct = default)
        {
            var psr = await _context.ProjectStatusReports
                .AsNoTracking()
                .SingleOrDefaultAsync(t => t.Id == request.ProjectStatusReportId);

            if (psr == null)
            {
                return NotFound();
            }

            var authorizationResult = await _authorizationService
                .AuthorizeAsync(User, psr, ProjectStatusReportOperation.RejectTime);

            if (!authorizationResult.Succeeded)
            {
                return Forbid();
            }

            request.RejectedById = User.GetStaffId();

            return await _ProjectStatusReportService.RejectProjectStatusReportTimeV1(request, ct)
                .ToActionResult(new HQResultEndpointProfile());
        }

        [Authorize(HQAuthorizationPolicies.Manager)]
        [HttpPost(nameof(UpdateProjectStatusReportTimeV1))]
        [ProducesResponseType<UpdateProjectStatusReportTimeV1.Response>(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult> UpdateProjectStatusReportTimeV1([FromBody] UpdateProjectStatusReportTimeV1.Request request, CancellationToken ct = default)
        {
            var psr = await _context.ProjectStatusReports
                .AsNoTracking()
                .SingleOrDefaultAsync(t => t.Id == request.ProjectStatusReportId);

            if (psr == null)
            {
                return NotFound();
            }

            var authorizationResult = await _authorizationService
                .AuthorizeAsync(User, psr, ProjectStatusReportOperation.UpdateTime);

            if (!authorizationResult.Succeeded)
            {
                return Forbid();
            }

            return await _ProjectStatusReportService.UpdateProjectStatusReportTimeV1(request, ct)
            .ToActionResult(new HQResultEndpointProfile());
        }

        [Authorize(HQAuthorizationPolicies.Manager)]
        [HttpPost(nameof(UnapproveProjectStatusReportTimeV1))]
        [ProducesResponseType<UnapproveProjectStatusReportTimeV1.Response>(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult> UnapproveProjectStatusReportTimeV1([FromBody] UnapproveProjectStatusReportTimeV1.Request request, CancellationToken ct = default)
        {
            var psr = await _context.ProjectStatusReports
                .AsNoTracking()
                .SingleOrDefaultAsync(t => t.Id == request.ProjectStatusReportId);

            if (psr == null)
            {
                return NotFound();
            }

            var authorizationResult = await _authorizationService
                .AuthorizeAsync(User, psr, ProjectStatusReportOperation.UnapproveTime);

            if (!authorizationResult.Succeeded)
            {
                return Forbid();
            }

            return await _ProjectStatusReportService.UnapproveProjectStatusReportTimeV1(request, ct)
            .ToActionResult(new HQResultEndpointProfile());
        }

        [Authorize(HQAuthorizationPolicies.Manager)]
        [HttpPost(nameof(UpdateProjectStatusReportMarkdownV1))]
        [ProducesResponseType<UpdateProjectStatusReportMarkdownV1.Response>(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult> UpdateProjectStatusReportMarkdownV1([FromBody] UpdateProjectStatusReportMarkdownV1.Request request, CancellationToken ct = default)
        {
            var psr = await _context.ProjectStatusReports
                .AsNoTracking()
                .SingleOrDefaultAsync(t => t.Id == request.ProjectStatusReportId);

            if (psr == null)
            {
                return NotFound();
            }

            var authorizationResult = await _authorizationService
                .AuthorizeAsync(User, psr, ProjectStatusReportOperation.UpdateReportMarkdown);

            if (!authorizationResult.Succeeded)
            {
                return Forbid();
            }

            return await _ProjectStatusReportService.UpdateProjectStatusReportMarkdownV1(request, ct)
            .ToActionResult(new HQResultEndpointProfile());
        }

        [Authorize(HQAuthorizationPolicies.Manager)]
        [HttpPost(nameof(SubmitProjectStatusReportV1))]
        [ProducesResponseType<SubmitProjectStatusReportV1.Response>(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult> SubmitProjectStatusReportV1([FromBody] SubmitProjectStatusReportV1.Request request, CancellationToken ct = default)
        {
            var psr = await _context.ProjectStatusReports
                .AsNoTracking()
                .SingleOrDefaultAsync(t => t.Id == request.ProjectStatusReportId);

            if (psr == null)
            {
                return NotFound();
            }

            var authorizationResult = await _authorizationService
                .AuthorizeAsync(User, psr, ProjectStatusReportOperation.SubmitReport);

            if (!authorizationResult.Succeeded)
            {
                return Forbid();
            }

            return await _ProjectStatusReportService.SubmitProjectStatusReportV1(request, ct)
            .ToActionResult(new HQResultEndpointProfile());
        }
    }
}