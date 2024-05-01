using FluentResults;
using HQ.Abstractions;
using HQ.Abstractions.Clients;
using HQ.Abstractions.Common;
using HQ.Abstractions.Projects;
using HQ.Abstractions.Staff;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http.Json;
using System.Net.Mime;
using System.Text;
using System.Threading.Tasks;

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
    }
}
