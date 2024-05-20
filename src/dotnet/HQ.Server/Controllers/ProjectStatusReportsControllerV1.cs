using Asp.Versioning;
using FluentResults.Extensions.AspNetCore;
using HQ.Abstractions.ProjectStatusReports;
using HQ.Abstractions.Common;
using HQ.API;
using HQ.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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

        public ProjectStatusReportsControllerV1(ProjectStatusReportServiceV1 ProjectStatusReportService)
        {
            _ProjectStatusReportService = ProjectStatusReportService;
        }

        [HttpPost(nameof(GenerateWeeklyProjectStatusReportsV1))]
        [ProducesResponseType<GenerateWeeklyProjectStatusReportsV1.Response>(StatusCodes.Status200OK)]
        public Task<ActionResult> GenerateWeeklyProjectStatusReportsV1([FromBody] GenerateWeeklyProjectStatusReportsV1.Request request, CancellationToken ct = default) =>
            _ProjectStatusReportService.GenerateWeeklyProjectStatusReportsV1(request, ct)
            .ToActionResult(new HQResultEndpointProfile());

        [HttpPost(nameof(GetProjectStatusReportsV1))]
        [ProducesResponseType<GetProjectStatusReportsV1.Response>(StatusCodes.Status200OK)]
        public Task<ActionResult> GetProjectStatusReportsV1([FromBody] GetProjectStatusReportsV1.Request request, CancellationToken ct = default) =>
            _ProjectStatusReportService.GetProjectStatusReportsV1(request, ct)
            .ToActionResult(new HQResultEndpointProfile());
    }
}
