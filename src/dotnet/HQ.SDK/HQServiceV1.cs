using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Net.Mime;
using System.Text;
using System.Threading.Tasks;

using FluentResults;

using HQ.Abstractions;
using HQ.Abstractions.ChargeCodes;
using HQ.Abstractions.Clients;
using HQ.Abstractions.Common;
using HQ.Abstractions.Projects;
using HQ.Abstractions.Quotes;
using HQ.Abstractions.Staff;
using HQ.Abstractions.Times;
using HQ.Abstractions.Voltron;

namespace HQ.SDK
{
    public class HQServiceV1
    {
        private readonly HttpClient _httpClient;

        public HQServiceV1(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        private async Task<Result<TResponse?>> HandleResponse<TResponse>(HttpResponseMessage response, CancellationToken ct = default)
            where TResponse : class
        {
            if (!response.IsSuccessStatusCode)
            {
                var responseBody = await response.Content.ReadAsStringAsync();
                var errors = new List<string>();
                switch (response.StatusCode)
                {
                    case HttpStatusCode.BadRequest:
                        var badRequest = await response.Content.ReadFromJsonAsync<List<ErrorSummaryV1>>(ct);
                        if (badRequest != null)
                        {
                            errors.AddRange(badRequest.Select(t => t.Message));
                        }
                        break;
                    default:
                        errors.Add($"Invalid response code: {response.StatusCode}");
                        break;
                }

                return Result.Fail(errors);
            }

            if (response.Content.Headers.ContentLength.HasValue && response.Content.Headers.ContentLength == 0)
            {
                return Result.Ok<TResponse?>(null);
            }

            return await response.Content.ReadFromJsonAsync<TResponse>(ct);
        }

        private async Task<Result<TResponse?>> ExecuteRequest<TResponse>(string url, object request, CancellationToken ct = default)
            where TResponse : class
        {
            var response = await _httpClient.PostAsJsonAsync(url, request, ct);
            return await HandleResponse<TResponse>(response, ct);
        }

        public Task<Result<GetClientsV1.Response?>> GetClientsV1(GetClientsV1.Request request, CancellationToken ct = default)
            => ExecuteRequest<GetClientsV1.Response>("/v1/clients/GetClientsV1", request, ct);

        public Task<Result<UpsertClientV1.Response?>> UpsertClientV1(UpsertClientV1.Request request, CancellationToken ct = default)
            => ExecuteRequest<UpsertClientV1.Response>("/v1/clients/UpsertClientV1", request, ct);

        public Task<Result<DeleteClientV1.Response?>> DeleteClientV1(DeleteClientV1.Request request, CancellationToken ct = default)
            => ExecuteRequest<DeleteClientV1.Response>("/v1/clients/DeleteClientV1", request, ct);

        public async Task<Result<ImportClientsV1.Response?>> ImportClientsV1(ImportClientsV1.Request request, CancellationToken ct = default)
        {
            using var multipartContent = new MultipartFormDataContent();
            multipartContent.Add(new StreamContent(request.File), "file", "clients.csv");

            var response = await _httpClient.PostAsync("/v1/clients/ImportClientsV1", multipartContent, ct);

            return await HandleResponse<ImportClientsV1.Response>(response, ct);
        }

        public Task<Result<GetStaffV1.Response?>> GetStaffV1(GetStaffV1.Request request, CancellationToken ct = default)
            => ExecuteRequest<GetStaffV1.Response>("/v1/Staff/GetStaffV1", request, ct);

        public Task<Result<UpsertStaffV1.Response?>> UpsertStaffV1(UpsertStaffV1.Request request, CancellationToken ct = default)
            => ExecuteRequest<UpsertStaffV1.Response>("/v1/Staff/UpsertStaffV1", request, ct);

        public Task<Result<DeleteStaffV1.Response?>> DeleteStaffV1(DeleteStaffV1.Request request, CancellationToken ct = default)
            => ExecuteRequest<DeleteStaffV1.Response>("/v1/Staff/DeleteStaffV1", request, ct);

        public async Task<Result<ImportStaffV1.Response?>> ImportStaffV1(ImportStaffV1.Request request, CancellationToken ct = default)
        {
            using var multipartContent = new MultipartFormDataContent();
            multipartContent.Add(new StreamContent(request.File), "file", "Staff.csv");

            var response = await _httpClient.PostAsync("/v1/Staff/ImportStaffV1", multipartContent, ct);

            return await HandleResponse<ImportStaffV1.Response>(response, ct);
        }

        public Task<Result<GetProjectsV1.Response?>> GetProjectsV1(GetProjectsV1.Request request, CancellationToken ct = default)
            => ExecuteRequest<GetProjectsV1.Response>("/v1/Projects/GetProjectsV1", request, ct);

        public Task<Result<UpsertProjectV1.Response?>> UpsertProjectV1(UpsertProjectV1.Request request, CancellationToken ct = default)
            => ExecuteRequest<UpsertProjectV1.Response>("/v1/Projects/UpsertProjectV1", request, ct);

        public Task<Result<DeleteProjectV1.Response?>> DeleteProjectV1(DeleteProjectV1.Request request, CancellationToken ct = default)
            => ExecuteRequest<DeleteProjectV1.Response>("/v1/Projects/DeleteProjectV1", request, ct);

        public async Task<Result<ImportProjectsV1.Response?>> ImportProjectsV1(ImportProjectsV1.Request request, CancellationToken ct = default)
        {
            using var multipartContent = new MultipartFormDataContent();
            multipartContent.Add(new StreamContent(request.File), "file", "Projects.csv");

            var response = await _httpClient.PostAsync("/v1/Projects/ImportProjectsV1", multipartContent, ct);

            return await HandleResponse<ImportProjectsV1.Response>(response, ct);
        }

        public async Task<Result<ImportVoltronTimeSheetsV1.Response?>> ImportVoltronTimeSheetsV1(ImportVoltronTimeSheetsV1.Request request, CancellationToken ct = default)
        {
            using var multipartContent = new MultipartFormDataContent();
            foreach (var file in request.Files)
            {
                multipartContent.Add(new StreamContent(file.Stream), "files", file.FileName);
            }

            multipartContent.Add(new StringContent(request.From.ToString("o"), Encoding.UTF8), nameof(request.From));
            multipartContent.Add(new StringContent(request.To.ToString("o"), Encoding.UTF8), nameof(request.To));
            multipartContent.Add(new StringContent(request.Replace.ToString(), Encoding.UTF8), nameof(request.Replace));

            var response = await _httpClient.PostAsync("/v1/Voltron/ImportVoltronTimeSheetsV1", multipartContent, ct);

            return await HandleResponse<ImportVoltronTimeSheetsV1.Response>(response, ct);
        }

        public async Task<Result<UploadQuotePDFV1.Response?>> UploadQuotePDFV1(UploadQuotePDFV1.Request request, CancellationToken ct = default)
        {
            using var multipartContent = new MultipartFormDataContent();

            var fileContent = new StreamContent(request.File!);
            fileContent.Headers.ContentType = new MediaTypeHeaderValue("application/pdf");

            multipartContent.Add(fileContent, "file", "quote.pdf");
            multipartContent.Add(new StringContent(request.Id.ToString(), Encoding.UTF8), nameof(request.Id));

            var response = await _httpClient.PostAsync("/v1/Quotes/UploadQuotePDFV1", multipartContent, ct);

            return await HandleResponse<UploadQuotePDFV1.Response>(response, ct);
        }

        public Task<Result<GetChargeCodesV1.Response?>> GetChargeCodesV1(GetChargeCodesV1.Request request, CancellationToken ct = default)
            => ExecuteRequest<GetChargeCodesV1.Response>("/v1/ChargeCodes/GetChargeCodesV1", request, ct);

        public Task<Result<GetQuotesV1.Response?>> GetQuotesV1(GetQuotesV1.Request request, CancellationToken ct = default)
            => ExecuteRequest<GetQuotesV1.Response>("/v1/Quotes/GetQuotesV1", request, ct);

        // Time Entries
        public Task<Result<GetTimesV1.Response?>> GetTimeEntriesV1(GetTimesV1.Request request, CancellationToken ct = default)
            => ExecuteRequest<GetTimesV1.Response>("/v1/TimeEntries/GetTimesV1", request, ct);

        public Task<Result<DeleteTimeV1.Response?>> DeleteTimeEntryV1(DeleteTimeV1.Request request, CancellationToken ct = default)
            => ExecuteRequest<DeleteTimeV1.Response>("/v1/TimeEntries/DeleteTimeV1", request, ct);
        public Task<Result<UpsertTimeV1.Response?>> UpsertTimeEntryV1(UpsertTimeV1.Request request, CancellationToken ct = default)
            => ExecuteRequest<UpsertTimeV1.Response>("/v1/TimeEntries/UpsertTimeV1", request, ct);

        public Task<Result<UpsertTimeDescriptionV1.Response?>> UpsertTimeEntryDescriptionV1(UpsertTimeDescriptionV1.Request request, CancellationToken ct = default)
            => ExecuteRequest<UpsertTimeDescriptionV1.Response>("/v1/TimeEntries/UpsertTimeDescriptionV1", request, ct);
        public Task<Result<UpsertTimeHoursV1.Response?>> UpsertTimeEntryHoursV1(UpsertTimeHoursV1.Request request, CancellationToken ct = default)
            => ExecuteRequest<UpsertTimeHoursV1.Response>("/v1/TimeEntries/UpsertTimeHoursV1", request, ct);
        public Task<Result<UpsertTimeActivityV1.Response?>> UpsertTimeEntryActivityV1(UpsertTimeActivityV1.Request request, CancellationToken ct = default)
            => ExecuteRequest<UpsertTimeActivityV1.Response>("/v1/TimeEntries/UpsertTimeActivityV1", request, ct);
        public Task<Result<UpsertTimeChargeCodeV1.Response?>> UpsertTimeEntryChargecodeV1(UpsertTimeChargeCodeV1.Request request, CancellationToken ct = default)
        => ExecuteRequest<UpsertTimeChargeCodeV1.Response>("/v1/TimeEntries/UpsertTimeChargecodeV1", request, ct);

        public Task<Result<UpsertTimeDateV1.Response?>> UpsertTimeEntryDateV1(UpsertTimeDateV1.Request request, CancellationToken ct = default)
        => ExecuteRequest<UpsertTimeDateV1.Response>("/v1/TimeEntries/UpsertTimeDateV1", request, ct);
        public Task<Result<UpsertTimeTaskV1.Response?>> UpsertTimeEntryTaskV1(UpsertTimeTaskV1.Request request, CancellationToken ct = default)
        => ExecuteRequest<UpsertTimeTaskV1.Response>("/v1/TimeEntries/UpsertTimeTaskV1", request, ct);
    }
}