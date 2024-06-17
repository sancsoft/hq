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
        public async Task<ActionResult> UpsertTime1([FromBody] UpsertTimeV1.Request request, CancellationToken ct = default)
        {
            if(request.Id.HasValue) { 
                var time = await _context.Times
                    .AsNoTracking()
                    .SingleOrDefaultAsync(t => t.Id == request.Id);

                if(time == null)
                {
                    return NotFound();
                }

                var authorizationResult = await _authorizationService
                    .AuthorizeAsync(User, time, TimeEntryOperation.UpsertTime);

                if(!authorizationResult.Succeeded)
                {
                    return Forbid();
                }
            }
            request.StaffId = User.GetStaffId();
            
            return await _TimeEntryServiceV1.UpsertTimeV1(request, ct)
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

            if(time == null)
            {
                return NotFound();
            }

            var authorizationResult = await _authorizationService
                .AuthorizeAsync(User, time, TimeEntryOperation.DeleteTime);

            if(!authorizationResult.Succeeded)
            {
                return Forbid();
            }
            
            return await _TimeEntryServiceV1.DeleteTimeV1(request, ct)
                .ToActionResult(new HQResultEndpointProfile());
        }
    }
}