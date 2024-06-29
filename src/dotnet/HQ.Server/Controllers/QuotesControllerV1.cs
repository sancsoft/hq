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

        [Authorize(HQAuthorizationPolicies.Administrator)]
        [HttpPost(nameof(UploadQuotePDFV1))]
        [Consumes("multipart/form-data")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        public Task<ActionResult> UploadQuotePDFV1([FromForm] Guid id, IFormFile file, CancellationToken ct = default)
        {
            var request = new UploadQuotePDFV1.Request();
            var stream = file.OpenReadStream();

            request.File = stream;
            request.ContentType = file.ContentType;
            request.Id = id;

            return _quoteService.UploadQuotePDFV1(request, ct)
                .ToActionResult(new HQResultEndpointProfile());
        }


        [Authorize(HQAuthorizationPolicies.Staff)]
        [HttpPost(nameof(GetQuotePDFV1))]
        [ProducesResponseType<FileResult>(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult> GetQuotePDFV1([FromBody] GetQuotePDFV1.Request request, CancellationToken ct = default)
        {
            var result = await _quoteService.GetQuotePDFV1(request, ct);
            if (!result.IsSuccess)
            {
                return result.ToActionResult(new HQResultEndpointProfile());
            }

            var value = result.Value;

            return File(value.File, value.ContentType, value.FileName);
        }

        [Authorize(HQAuthorizationPolicies.Administrator)]
        [HttpPost(nameof(ImportQuotesV1))]
        [Consumes("multipart/form-data")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        public Task<ActionResult> ImportQuotesV1(IFormFile file, CancellationToken ct = default)
        {
            var request = new ImportQuotesV1.Request();
            var stream = file.OpenReadStream();

            request.File = stream;

            return _quoteService.ImportQuotesV1(request, ct)
                .ToActionResult(new HQResultEndpointProfile());
        }
    }
}