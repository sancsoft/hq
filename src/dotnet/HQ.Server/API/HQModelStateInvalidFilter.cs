using FluentResults;
using HQ.Abstractions.Common;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace HQ.Server.API;

public class HQModelStateInvalidFilter : IActionFilter
{
    public void OnActionExecuted(ActionExecutedContext context)
    {
    }

    public void OnActionExecuting(ActionExecutingContext context)
    {
        if (context.Result == null && !context.ModelState.IsValid)
        {
            var errorDtos = context.ModelState
                .Where(m => m.Value != null && m.Value.Errors.Any())
                .Select(t => t.Value!)
                .SelectMany(e => e.Errors.Select(t => new ErrorSummaryV1
                {
                    Message = t.ErrorMessage
                }));

            context.Result = new BadRequestObjectResult(errorDtos);
        }
    }
}
