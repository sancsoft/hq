using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;

using Asp.Versioning;

using FluentResults.Extensions.AspNetCore;

using HQ.Abstractions.Common;
using HQ.Abstractions.Times;
using HQ.API;
using HQ.Server.Authorization;
using HQ.Server.Data;
using HQ.Server.Data.Models;
using HQ.Server.Services;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace HQ.Server.Controllers
{
    [Authorize]
    [ApiController]
    [ApiVersion(1.0)]
    [Tags("TimeEntries")]
    [Route("v{version:apiVersion}/TimeEntries")]
    [ProducesResponseType<List<ErrorSummaryV1>>(StatusCodes.Status400BadRequest)]
    public class TimeEntriesControllerV1 : ControllerBase
    {
        private readonly TimeEntryServiceV1 _TimeEntryServiceV1;
        private readonly HQDbContext _context;
        private readonly IAuthorizationService _authorizationService;

        public TimeEntriesControllerV1(TimeEntryServiceV1 TimeEntryServiceV1, HQDbContext context, IAuthorizationService authorizationService)
        {
            _TimeEntryServiceV1 = TimeEntryServiceV1;
            _context = context;
            _authorizationService = authorizationService;
        }
        [Authorize(HQAuthorizationPolicies.Staff)]
        [HttpPost(nameof(UpsertTimeV1))]
        [ProducesResponseType<UpsertTimeV1.Response>(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult> UpsertTimeV1([FromBody] UpsertTimeV1.Request request, CancellationToken ct = default)
        {
            if (request.Id.HasValue)
            {
                var time = await _context.Times
                    .AsNoTracking()
                    .SingleOrDefaultAsync(t => t.Id == request.Id);

                if (time == null)
                {
                    return NotFound();
                }
                time.Date = request.Date;
                var authorizationResult = await _authorizationService
                    .AuthorizeAsync(User, time, TimeEntryOperation.UpsertTime);

                if (!authorizationResult.Succeeded)
                {
                    return Forbid();
                }
            }
            else
            {
                if (!request.StaffId.HasValue)
                {
                    return Forbid();
                }

                var authorizationResult = await _authorizationService
                    .AuthorizeAsync(User, new Time() { StaffId = request.StaffId.Value, Date = request.Date }, TimeEntryOperation.UpsertTime);

                if (!authorizationResult.Succeeded)
                {
                    return Forbid();
                }
            }

            return await _TimeEntryServiceV1.UpsertTimeV1(request, ct)
                .ToActionResult(new HQResultEndpointProfile());
        }

        [Authorize(HQAuthorizationPolicies.Staff)]
        [HttpPost(nameof(UpsertTimeDescriptionV1))]
        [ProducesResponseType<UpsertTimeDescriptionV1.Response>(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult> UpsertTimeDescriptionV1([FromBody] UpsertTimeDescriptionV1.Request request, CancellationToken ct = default)
        {
            var staffId = User.GetStaffId();
            var staff = await _context.Staff
                .AsNoTracking()
                .SingleOrDefaultAsync(t => t.Id == staffId);

            if (staff == null)
            {
                return NotFound();
            }

            return await _TimeEntryServiceV1.UpsertTimeDescriptionV1(request, ct)
                .ToActionResult(new HQResultEndpointProfile());
        }

        [Authorize(HQAuthorizationPolicies.Administrator)]
        [HttpPost(nameof(UpsertTimeHoursInvoicedV1))]
        [ProducesResponseType<UpsertTimeHoursInvoicedV1.Response>(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult> UpsertTimeHoursInvoicedV1([FromBody] UpsertTimeHoursInvoicedV1.Request request, CancellationToken ct = default)
        {
            Console.WriteLine(" Updating invoice hours");
            var staffId = User.GetStaffId();
            var staff = await _context.Staff
                .AsNoTracking()
                .SingleOrDefaultAsync(t => t.Id == staffId);

            if (staff == null)
            {
                return NotFound();
            }

            return await _TimeEntryServiceV1.UpsertTimeHoursInvoicedV1(request, ct)
                .ToActionResult(new HQResultEndpointProfile());
        }

        [Authorize(HQAuthorizationPolicies.Staff)]
        [HttpPost(nameof(UpsertTimeChargecodeV1))]
        [ProducesResponseType<UpsertTimeChargeCodeV1.Response>(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult> UpsertTimeChargecodeV1([FromBody] UpsertTimeChargeCodeV1.Request request, CancellationToken ct = default)
        {
            var staffId = User.GetStaffId();
            var staff = await _context.Staff
                .AsNoTracking()
                .SingleOrDefaultAsync(t => t.Id == staffId);

            if (staff == null)
            {
                return NotFound();
            }

            return await _TimeEntryServiceV1.UpsertTimeChargecodeV1(request, ct)
                .ToActionResult(new HQResultEndpointProfile());
        }

        [Authorize(HQAuthorizationPolicies.Staff)]
        [HttpPost(nameof(UpsertTimeDateV1))]
        [ProducesResponseType<UpsertTimeDateV1.Response>(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult> UpsertTimeDateV1([FromBody] UpsertTimeDateV1.Request request, CancellationToken ct = default)
        {
            var staffId = User.GetStaffId();
            var staff = await _context.Staff
                .AsNoTracking()
                .SingleOrDefaultAsync(t => t.Id == staffId);

            if (staff == null)
            {
                return NotFound();
            }

            return await _TimeEntryServiceV1.UpsertTimeDateV1(request, ct)
                .ToActionResult(new HQResultEndpointProfile());
        }
        [Authorize(HQAuthorizationPolicies.Staff)]
        [HttpPost(nameof(UpsertTimeTaskV1))]
        [ProducesResponseType<UpsertTimeDateV1.Response>(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult> UpsertTimeTaskV1([FromBody] UpsertTimeTaskV1.Request request, CancellationToken ct = default)
        {
            var staffId = User.GetStaffId();
            var staff = await _context.Staff
                .AsNoTracking()
                .SingleOrDefaultAsync(t => t.Id == staffId);

            if (staff == null)
            {
                return NotFound();
            }

            return await _TimeEntryServiceV1.UpsertTimeTaskV1(request, ct)
                .ToActionResult(new HQResultEndpointProfile());
        }
        [Authorize(HQAuthorizationPolicies.Staff)]
        [HttpPost(nameof(AddTimeToInvoiceV1))]
        [ProducesResponseType<AddTimeToInvoiceV1.Response>(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult> AddTimeToInvoiceV1([FromBody] AddTimeToInvoiceV1.Request request, CancellationToken ct = default)
        {
            var staffId = User.GetStaffId();
            var staff = await _context.Staff
                .AsNoTracking()
                .SingleOrDefaultAsync(t => t.Id == staffId);

            if (staff == null)
            {
                return NotFound();
            }

            return await _TimeEntryServiceV1.AddTimeToInvoiceV1(request, ct)
                .ToActionResult(new HQResultEndpointProfile());
        }
        [Authorize(HQAuthorizationPolicies.Staff)]
        [HttpPost(nameof(AddTimesToInvoiceV1))]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult> AddTimesToInvoiceV1([FromBody] AddTimesToInvoiceV1.Request request, CancellationToken ct = default)
        {
            var staffId = User.GetStaffId();
            var staff = await _context.Staff
                .AsNoTracking()
                .SingleOrDefaultAsync(t => t.Id == staffId);

            if (staff == null)
            {
                return NotFound();
            }

            Console.WriteLine("    Made it through controller");
            return await _TimeEntryServiceV1.AddTimesToInvoiceV1(request, ct)
                .ToActionResult(new HQResultEndpointProfile());
        }

        [Authorize(HQAuthorizationPolicies.Administrator)]
        [HttpPost(nameof(RemoveTimeFromInvoiceV1))]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult> RemoveTimeFromInvoiceV1([FromBody] RemoveTimeFromInvoiceV1.Request request, CancellationToken ct = default)
        {
            Console.WriteLine("In controller");
            var staffId = User.GetStaffId();
            var staff = await _context.Staff
                .AsNoTracking()
                .SingleOrDefaultAsync(t => t.Id == staffId);

            if (staff == null)
            {
                return NotFound();
            }

            return await _TimeEntryServiceV1.RemoveTimeFromInvoiceV1(request, ct)
                .ToActionResult(new HQResultEndpointProfile());
        }


        [Authorize(HQAuthorizationPolicies.Staff)]
        [HttpPost(nameof(GetTimesV1))]
        [ProducesResponseType<GetTimesV1.Response>(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult> GetTimesV1([FromBody] GetTimesV1.Request request, CancellationToken ct = default)
        {
            return await _TimeEntryServiceV1.GetTimesV1(request, ct)
                .ToActionResult(new HQResultEndpointProfile());
        }


        [Authorize(HQAuthorizationPolicies.Administrator)]
        [HttpPost(nameof(CaptureUnsubmittedTimeV1))]
        [ProducesResponseType<CaptureUnsubmittedTimeV1.Response>(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult> CaptureUnsubmittedTimeV1([FromBody] CaptureUnsubmittedTimeV1.Request request, CancellationToken ct = default)
        {
            return await _TimeEntryServiceV1.CaptureUnsubmittedTimeV1(request, ct)
                .ToActionResult(new HQResultEndpointProfile());
        }

        [Authorize(HQAuthorizationPolicies.Staff)]
        [HttpPost(nameof(DeleteTimeV1))]
        [ProducesResponseType<DeleteTimeV1.Response>(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult> DeleteTimeV1([FromBody] DeleteTimeV1.Request request, CancellationToken ct = default)
        {
            var time = await _context.Times
                .AsNoTracking()
                .SingleOrDefaultAsync(t => t.Id == request.Id);

            if (time == null)
            {
                return NotFound();
            }

            var authorizationResult = await _authorizationService
                .AuthorizeAsync(User, time, TimeEntryOperation.DeleteTime);

            if (!authorizationResult.Succeeded)
            {
                return Forbid();
            }

            return await _TimeEntryServiceV1.DeleteTimeV1(request, ct)
                .ToActionResult(new HQResultEndpointProfile());
        }


        [Authorize(HQAuthorizationPolicies.Staff)]
        [HttpPost(nameof(GetDashboardTimeV1))]
        [ProducesResponseType<GetDashboardTimeV1.Response>(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult> GetDashboardTimeV1([FromBody] GetDashboardTimeV1.Request request, CancellationToken ct = default)
        {
            return await _TimeEntryServiceV1.GetDashboardTimeV1(request, ct)
                .ToActionResult(new HQResultEndpointProfile());
        }

        [Authorize(HQAuthorizationPolicies.Staff)]
        [HttpPost(nameof(SubmitTimesV1))]
        [ProducesResponseType<GetDashboardTimeV1.Response>(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult> SubmitTimesV1([FromBody] SubmitTimesV1.Request request, CancellationToken ct = default)
        {
            var times = _context.Times.Where(t => request.Ids.Contains(t.Id));
            if (times == null)
            {
                return NotFound();
            }

            var authorizationResult = await _authorizationService
                    .AuthorizeAsync(User, times.FirstOrDefault(), TimeEntryOperation.SubmitTimes);

            if (!authorizationResult.Succeeded)
            {
                return Forbid();
            }
            return await _TimeEntryServiceV1.SubmitTimesV1(request, ct)
                .ToActionResult(new HQResultEndpointProfile());
        }


        [Authorize(HQAuthorizationPolicies.Staff)]
        [HttpPost(nameof(ExportTimesV1))]
        [ProducesResponseType<FileResult>(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult> ExportTimesV1([FromBody] ExportTimesV1.Request request, CancellationToken ct = default)
        {
            var result = await _TimeEntryServiceV1.ExportTimesV1(request, ct);
            if (!result.IsSuccess)
            {
                return result.ToActionResult(new HQResultEndpointProfile());
            }

            var value = result.Value;

            return File(value.File, value.ContentType, value.FileName);
        }


    }
}