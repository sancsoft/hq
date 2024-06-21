using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;

using Asp.Versioning;

using FluentResults.Extensions.AspNetCore;

using HQ.Abstractions.Common;
using HQ.Abstractions.Quotes;
using HQ.API;
using HQ.Server.Authorization;
using HQ.Server.Services;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace HQ.Server.Controllers
{
    [Authorize]
    [ApiController]
    [ApiVersion(1.0)]
    [Tags("Quotes")]
    [Route("v{version:apiVersion}/Quotes")]
    [ProducesResponseType<List<ErrorSummaryV1>>(StatusCodes.Status400BadRequest)]
    public class QuotesControllerV1 : ControllerBase
    {
        private readonly QuoteServiceV1 _quoteService;

        public QuotesControllerV1(QuoteServiceV1 quoteService)
        {
            _quoteService = quoteService;
        }

        [Authorize(HQAuthorizationPolicies.Staff)]
        [HttpPost(nameof(GetQuotesV1))]
        [ProducesResponseType<GetQuotesV1.Response>(StatusCodes.Status200OK)]
        public Task<ActionResult> GetQuotesV1([FromBody] GetQuotesV1.Request request, CancellationToken ct = default) =>
            _quoteService.GetQuotesV1(request, ct)
            .ToActionResult(new HQResultEndpointProfile());

        [Authorize(HQAuthorizationPolicies.Staff)]
        [HttpPost(nameof(UpsertQuotesV1))]
        [ProducesResponseType<UpsertQuotestV1.Response>(StatusCodes.Status200OK)]
        public Task<ActionResult> UpsertQuotesV1([FromBody] UpsertQuotestV1.Request request, CancellationToken ct = default) =>
        _quoteService.UpsertQuoteV1(request, ct)
        .ToActionResult(new HQResultEndpointProfile());
    }
}