﻿using FluentResults;
using HQ.Abstractions;
using HQ.Abstractions.Clients;
using HQ.Abstractions.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http.Json;
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

        private async Task<Result<TResponse?>> ExecuteRequest<TResponse>(string url, object request, CancellationToken ct = default)
        {
            var response = await _httpClient.PostAsJsonAsync(url, request, ct);
            if (!response.IsSuccessStatusCode)
            {
                var responseBody = await response.Content.ReadAsStringAsync();
                var errors = new List<string>();
                switch (response.StatusCode)
                {
                    case HttpStatusCode.BadRequest:
                        var badRequest = await response.Content.ReadFromJsonAsync<List<ErrorSummaryV1>>(ct);
                        if(badRequest != null)
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

            return await response.Content.ReadFromJsonAsync<TResponse>(ct);
        }

        public Task<Result<GetClientsV1.Response?>> GetClientsV1(GetClientsV1.Request request, CancellationToken ct = default)
            => ExecuteRequest<GetClientsV1.Response>("/v1/clients/GetClientsV1", request, ct);
    }
}
