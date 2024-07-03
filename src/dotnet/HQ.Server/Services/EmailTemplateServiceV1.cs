using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;

using CsvHelper;
using CsvHelper.Configuration;

using FluentResults;

using HQ.Abstractions.Enumerations;
using HQ.Abstractions.EmailTemplates;
using HQ.Abstractions.Services;
using HQ.Server.Data;
using HQ.Server.Data.Models;

using Microsoft.EntityFrameworkCore;
using HQ.Abstractions.Emails;
using Mjml.Net;

namespace HQ.Server.Services;
public class EmailTemplateServiceV1
{
    private readonly HQDbContext _context;
    private readonly ILogger<EmailTemplateServiceV1> _logger;
    private readonly IRazorViewToStringRendererService _razorViewToStringRendererService;

    public EmailTemplateServiceV1(HQDbContext context, ILogger<EmailTemplateServiceV1> logger, IRazorViewToStringRendererService razorViewToStringRendererService)
    {
        _context = context;
        _logger = logger;
        _razorViewToStringRendererService = razorViewToStringRendererService;
    }

    public async Task<Result<GetEmailTemplateV1.Response>> GetEmailTemplateV1<T>(GetEmailTemplateV1.Request<T> request, CancellationToken ct = default) where T : BaseEmail
    {
        var response = new GetEmailTemplateV1.Response();

        var mjmlRenderer = new MjmlRenderer();
        var mjmlOptions = new MjmlOptions();

        var text = await _razorViewToStringRendererService.RenderViewToStringAsync($"/Views/Emails/Text/{request.EmailMessage}.cshtml", request.Model, ct);
        var mjml = await _razorViewToStringRendererService.RenderViewToStringAsync($"/Views/Emails/HTML/{request.EmailMessage}.cshtml", request.Model, ct);
        var (html, errors) = mjmlRenderer.Render(mjml, mjmlOptions);
        if (errors.Any())
        {
            return Result.Fail(errors.Select(t => t.Error));
        }

        response.MJML = mjml;
        response.HTML = html;
        response.Text = text;

        return response;
    }
}