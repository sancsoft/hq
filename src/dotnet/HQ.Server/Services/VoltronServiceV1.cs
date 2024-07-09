using System.Formats.Asn1;
using System.Globalization;
using System.IO;
using System.Text.RegularExpressions;

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

namespace HQ.Server.Services;

public class VoltronServiceV1
{
    private readonly HQDbContext _context;
    private readonly ILogger<VoltronServiceV1> _logger;

    public VoltronServiceV1(HQDbContext context, ILogger<VoltronServiceV1> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<ImportVoltronTimeSheetsV1.Response>> ImportVoltronTimeSheetsV1(ImportVoltronTimeSheetsV1.Request request, CancellationToken ct = default)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync(ct);

        var staffNameRegex = new Regex("[^a-zA-Z]");
        var chargeCodes = await _context.ChargeCodes.ToDictionaryAsync(t => t.Code, t => t, ct);
        var staffLookup = await _context.Staff.ToDictionaryAsync(t => t.Name, t => t, ct);

        // TODO: Validation and logging

        var response = new ImportVoltronTimeSheetsV1.Response();
        foreach (var file in request.Files)
        {
            var staffName = staffNameRegex.Replace(Path.GetFileNameWithoutExtension(file.FileName), String.Empty);
            if (!staffLookup.ContainsKey(staffName))
            {
                response.SkippedMissingStaff++;
                if (!response.UnknownStaff.Contains(staffName))
                {
                    response.UnknownStaff.Add(staffName);
                }
                continue;
            }

            var staff = staffLookup[staffName];

            var staffTime = GetTimeRecord(file.FileName, file.Stream)
                .Where(t => t.Date >= request.From && t.Date <= request.To);

            // Remove any existing entries during the time period for the given staff member
            if (staffTime.Any() && request.Replace)
            {
                var toDelete = _context.Times
                    .Where(t => t.StaffId == staff.Id && t.Date >= request.From && t.Date <= request.To);

                response.TimeDeleted += await toDelete.CountAsync(ct);

                _context.Times.RemoveRange(toDelete);
            }

            foreach (var timeRecord in staffTime)
            {
                if (!chargeCodes.ContainsKey(timeRecord.ChargeCode))
                {
                    response.SkippedMissingChargeCode++;
                    if (!response.UnknownChargeCodes.Contains(timeRecord.ChargeCode))
                    {
                        response.UnknownChargeCodes.Add(timeRecord.ChargeCode);
                    }

                    continue;
                }

                var time = new Time();
                time.Status = request.Status;
                time.Staff = staff;
                time.ChargeCode = chargeCodes[timeRecord.ChargeCode];
                time.Date = timeRecord.Date;
                time.Hours = timeRecord.Hours;
                time.Notes = timeRecord.Notes;

                if (request.Status == TimeStatus.Accepted)
                {
                    time.HoursApproved = time.Hours;
                }

                if (String.IsNullOrEmpty(time.Notes))
                {
                    time.Notes = null;
                }

                // ^\((?<reference>[0-9]+)\)
                // ^(?<reference>#([0-9]+))
                // ^(?<reference>#([0-9]+))|(\((?<reference>[0-9]+)\))
                // ^(?<reference>#([0-9]+))|(\((?<reference>[0-9]+)\))|(?<reference>[0-9]+)

                _context.Times.Add(time);

                response.TimeCreated++;
            }
        }

        await _context.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);

        return response;
    }

    public async Task<Result<ImportVoltronChargeCodesV1.Response>> ImportVoltronChargeCodesV1(ImportVoltronChargeCodesV1.Request request, CancellationToken ct = default)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync(ct);

        var response = new ImportVoltronChargeCodesV1.Response();
        var records = GetChargeCodeRecord(request.File);
        var allStaff = await _context.Staff.ToDictionaryAsync(t => t.Name, t => t);

        foreach (var chargeCodes in records.GroupBy(t => t.Client.ToLower()))
        {
            var clientName = chargeCodes.First().Client;
            var client = await _context.Clients.SingleOrDefaultAsync(t => t.Name.ToLower() == clientName.ToLower(), ct);
            if (client == null)
            {
                client = new();
                _context.Clients.Add(client);
            }

            client.Name = clientName;

            foreach (var projectRow in chargeCodes)
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
                switch (chargeCodePrefix)
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

                var project = await _context.Projects.SingleOrDefaultAsync(t => t.ChargeCode != null && t.ChargeCode.Code == projectRow.Code);
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

                if (!String.IsNullOrEmpty(projectRow.ProjectManager))
                {
                    var staff = allStaff.ContainsKey(projectRow.ProjectManager.ToLower()) ? allStaff[projectRow.ProjectManager.ToLower()] : null;
                    if (staff != null)
                    {
                        project.ProjectManagerId = staff.Id;
                    }
                }

                if (projectRow.HourlyRate.HasValue)
                {
                    project.HourlyRate = projectRow.HourlyRate.Value;
                }

                if (projectRow.HoursPerMonth.HasValue)
                {
                    project.BookingHours = projectRow.HoursPerMonth.Value;
                }

                if (projectRow.QuoteTotalHours.HasValue && projectRow.QuoteTotalHours.Value > 0)
                {
                    project.TotalHours = projectRow.QuoteTotalHours.Value;
                }
                else
                {
                    project.TotalHours = null;
                }

                project.BookingPeriod = Period.Month;
                project.ClientId = client.Id;
                project.Name = projectRow.Project;

                switch (chargeCode.Activity)
                {
                    case ChargeCodeActivity.Project:
                        project.Status = ProjectStatus.Ongoing;
                        break;
                    case ChargeCodeActivity.Quote:
                        project.Status = ProjectStatus.InProduction;
                        break;
                }

                if (chargeCode.Activity == ChargeCodeActivity.Project && Int32.TryParse(chargeCode.Code.Substring(1), out int projectNumber))
                {
                    project.ProjectNumber = projectNumber;
                }

                if (chargeCode.Activity == ChargeCodeActivity.Quote && Int32.TryParse(chargeCode.Code.Substring(1), out int quoteNumber))
                {
                    var quote = await _context.Quotes.SingleOrDefaultAsync(t => t.QuoteNumber == quoteNumber);
                    if (quote == null)
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

    private List<TimeRecord> GetTimeRecord(string fileName, Stream stream)
    {
        var staffNameRegex = new Regex("[^a-zA-Z]");

        List<string> validHeaders = new List<string>() { "Date", "Staff", "Client", "Project", "Quote", "Hours", "Billable", "Notes" };
        List<string> altValidHeaders = new List<string>() { "Date", "User", "Client", "Project", "Quote", "Hours", "Billable", "Notes" }; // Q1-Q2 legacy

        var time = new List<TimeRecord>();

        using var workbook = new XLWorkbook(stream);

        var staff = staffNameRegex.Replace(Path.GetFileNameWithoutExtension(fileName), String.Empty);

        foreach (var sheet in workbook.Worksheets)
        {
            _logger.LogDebug("Processing worksheet {sheet}", sheet.Name);

            if (!DateTime.TryParse(sheet.Name, out DateTime month))
            {
                _logger.LogWarning("Sheet {sheet} in {file} is not parsable to a DateTime.", sheet.Name, fileName);
                continue;
            }

            var headerRow = sheet.Row(1);
            var headers = headerRow.Cells().Select(t => t.Value.ToString()).ToList();
            if ((headers.Count >= validHeaders.Count && !headers.Take(validHeaders.Count).SequenceEqual(validHeaders)) && (headers.Count >= altValidHeaders.Count && !headers.Take(altValidHeaders.Count).SequenceEqual(altValidHeaders)))
            {
                _logger.LogWarning("Sheet {sheet} in {file} contains unexpected headers. Found \"{headers}\" expected \"{validHeaders}\"", sheet.Name, fileName, headers, validHeaders);
                continue;
            }

            int entries = 0;
            foreach (var row in sheet.Rows().Skip(1))
            {
                entries++;

                var dateCell = row.Cell(1).Value;
                string date = "";

                if (dateCell.Type == XLDataType.Text)
                {
                    date = dateCell.GetText();
                }

                if (dateCell.Type == XLDataType.DateTime)
                {
                    date = dateCell.GetDateTime().ToString();
                }

                if (dateCell.Type == XLDataType.Number)
                {
                    date = DateTime.FromOADate(double.Parse(dateCell.ToString())).ToString();
                }

                var client = row.Cell(3).Value.ToString().Trim();
                var project = row.Cell(4).Value.ToString().Trim();
                var quote = row.Cell(5).Value.ToString().ToUpper().Trim();
                var hours = row.Cell(6).Value.ToString().Trim();
                // var billable = row.Cell(7).Value.ToString().ToUpper().Trim();
                var notes = row.Cell(8).Value.ToString().Trim();

                if (String.IsNullOrEmpty(date) && String.IsNullOrEmpty(client) && String.IsNullOrEmpty(project) && String.IsNullOrEmpty(quote) && String.IsNullOrEmpty(hours) && String.IsNullOrEmpty(notes))
                {
                    continue;
                }

                decimal totalHours = 0m;
                DateTime? dateTime = null;

                if (!DateTime.TryParse(date, out DateTime dateTimeParsed))
                {
                    _logger.LogDebug("Unable to parse row {row} date \"{date}\" with notes \"{note}\" in sheet \"{sheet}\" in file \"{file}\"", row.RangeAddress, date, notes, sheet.Name, fileName);
                }
                else
                {
                    dateTime = dateTimeParsed;
                }

                if (!decimal.TryParse(hours, out totalHours))
                {
                    _logger.LogDebug("Unable to parse row {row} hours \"{hours}\" with notes \"{note}\" in sheet \"{sheet}\" in file \"{file}\"", row.RangeAddress, hours, notes, sheet.Name, fileName);
                }

                if (!dateTime.HasValue)
                {
                    continue;
                }

                time.Add(new(staff, DateOnly.FromDateTime(dateTime.Value), quote, totalHours, notes));
            }
        }

        return time;
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
            var projectManager = row.Cell(7).Value.ToString().Trim();
            var hoursPerMonth = ParseDecimal(row.Cell(8).Value.ToString().Trim());
            var quoteTotalHours = ParseDecimal(row.Cell(9).Value.ToString().Trim());
            var hourlyRate = ParseDecimal(row.Cell(10).Value.ToString().Trim());

            if (chargeCodes.Any(t => t.Code == code))
            {
                continue;
            }

            chargeCodes.Add(new ChargeCodeRecord(code, client, project, billable, active, description, projectManager, hoursPerMonth, quoteTotalHours, hourlyRate));
        }

        return chargeCodes;
    }

    private decimal? ParseDecimal(string? stringValue)
    {
        if (!String.IsNullOrEmpty(stringValue) && decimal.TryParse(stringValue, out decimal decimalValue))
        {
            return decimalValue;
        }

        return null;
    }

    private record TimeRecord(string Staff, DateOnly Date, string ChargeCode, decimal Hours, string Notes);
    private record ChargeCodeRecord(string Code, string Client, string Project, bool Billable, bool Active, string? Description, string? ProjectManager, decimal? HoursPerMonth, decimal? QuoteTotalHours, decimal? HourlyRate);
}