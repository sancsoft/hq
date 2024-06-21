using FluentResults;
using FluentResults.Extensions.AspNetCore;

using HQ.Abstractions.Common;

using Microsoft.AspNetCore.Mvc;

namespace HQ.API;

public class HQResultEndpointProfile : IAspNetCoreResultEndpointProfile
{
    public ActionResult TransformFailedResultToActionResult(FailedResultToActionResultTransformationContext context)
    {
        var result = context.Result;

        var errorDtos = result.Errors.Select(e => new ErrorSummaryV1
        {
            Message = e.Message
        });

        return new BadRequestObjectResult(errorDtos);
    }

    public ActionResult TransformOkNoValueResultToActionResult(OkResultToActionResultTransformationContext<Result> context)
    {
        return new OkResult();
    }

    public ActionResult TransformOkValueResultToActionResult<T>(OkResultToActionResultTransformationContext<Result<T>> context)
    {
        var value = context.Result.ValueOrDefault;
        if (value == null)
        {
            return new NotFoundResult();
        }

        if (value is NoContentResponseV1)
        {
            return new NoContentResult();
        }

        return new OkObjectResult(value);
    }
}