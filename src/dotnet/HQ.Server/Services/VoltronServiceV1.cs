using ClosedXML.Excel;
using CsvHelper;
using CsvHelper.Configuration;
using FluentResults;
using HQ.Abstractions.Enumerations;
using HQ.Abstractions.Voltron;
using HQ.Server.Data;
using HQ.Server.Data.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Formats.Asn1;
using System.Globalization;

namespace HQ.Server.Services;

public class VoltronServiceV1
{
    private readonly HQDbContext _context;

    public VoltronServiceV1(HQDbContext context)
    {
        _context = context;
    }

    public async Task<Result<ImportVoltronChargeCodesV1.Response>> ImportVoltronChargeCodesV1(ImportVoltronChargeCodesV1.Request request, CancellationToken ct = default)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync(ct);

        var response = new ImportVoltronChargeCodesV1.Response();
        var records = GetChargeCodeRecord(request.File);

        foreach(var chargeCodes in records.GroupBy(t => t.Client.ToLower()))
        {
            var clientName = chargeCodes.First().Client;
            var client = await _context.Clients.SingleOrDefaultAsync(t => t.Name.ToLower() == clientName.ToLower(), ct);
            if(client == null)
            {
                client = new();
                _context.Clients.Add(client);
            }

            client.Name = clientName;

            foreach(var projectRow in chargeCodes)
            {

                var chargeCode = _context.ChargeCodes.SingleOrDefault(t => t.Code == projectRow.Code);
                if (chargeCode == null)
                {
                    chargeCode = new();
                    _context.ChargeCodes.Add(chargeCode);

                    response.ChargeCodesCreated++;
                }
                else
                {
                    response.ChargeCodesUpdated++;
                }

                chargeCode.Code = projectRow.Code;
                chargeCode.Description = projectRow.Description;
                chargeCode.Active = projectRow.Active;
                chargeCode.Billable = projectRow.Billable;

                var chargeCodePrefix = chargeCode.Code.ToUpper()[0];
                switch(chargeCodePrefix)
                {
                    case 'S':
                        chargeCode.Activity = ChargeCodeActivity.General;
                        break;
                    case 'P':
                        chargeCode.Activity = ChargeCodeActivity.Project;
                        break;
                    case 'Q':
                        chargeCode.Activity = ChargeCodeActivity.Quote;
                        break;
                }

                var project = await _context.Projects.SingleOrDefaultAsync(t => t.ClientId == client.Id && t.Name.ToLower() == projectRow.Project.ToLower());
                if (project == null)
                {
                    project = new();
                    _context.Projects.Add(project);

                    response.ProjectsCreated++;
                }
                else
                {
                    response.ProjectsUpdated++;
                }

                project.ClientId = client.Id;
                project.Name = projectRow.Project;

                if(chargeCode.Activity == ChargeCodeActivity.Project && Int32.TryParse(chargeCode.Code.Substring(1), out int projectNumber))
                {
                    project.ProjectNumber = projectNumber;
                }

                if(chargeCode.Activity == ChargeCodeActivity.Quote && Int32.TryParse(chargeCode.Code.Substring(1), out int quoteNumber))
                {
                    var quote = await _context.Quotes.SingleOrDefaultAsync(t => t.QuoteNumber == quoteNumber);
                    if(quote == null)
                    {
                        quote = new();
                        _context.Quotes.Add(quote);

                        response.QuotesCreated++;
                    }
                    else
                    {
                        response.QuotesUpdated++;
                    }

                    quote.ClientId = client.Id;
                    quote.QuoteNumber = quoteNumber;
                    quote.Name = projectRow.Project;
                    
                    project.QuoteId = quote.Id;
                    chargeCode.QuoteId = quote.Id;
                }

                chargeCode.ProjectId = project.Id;
            }
        }

        await _context.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);

        return response;
    }

    private List<ChargeCodeRecord> GetChargeCodeRecord(Stream stream)
    {
        var chargeCodes = new List<ChargeCodeRecord>();

        using var workbook = new XLWorkbook(stream);

        var sheet = workbook.Worksheets.Single(t => t.Name == "Charge Codes");

        foreach (var row in sheet.Rows().Skip(1))
        {
            var client = row.Cell(1).Value.ToString().Trim();
            var project = row.Cell(2).Value.ToString().Trim();
            var code = row.Cell(3).Value.ToString().Trim();
            var billable = row.Cell(4).Value.ToString().Trim() == "Yes";
            var active = row.Cell(5).Value.ToString().Trim() == "Yes";
            var description = row.Cell(6).Value.ToString().Trim();

            if (chargeCodes.Any(t => t.Code == code))
            {
                continue;
            }

            chargeCodes.Add(new ChargeCodeRecord(code, client, project, billable, active, description));
        }

        return chargeCodes;
    }

    private record ChargeCodeRecord(string Code, string Client, string Project, bool Billable, bool Active, string? Description);
}
