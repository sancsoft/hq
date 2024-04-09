using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Headers;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using System.Net.Http;
using Microsoft.AspNetCore.DataProtection;
using IdentityModel.Client;
using static IdentityModel.OidcConstants;

namespace HQ.CLI
{
    internal class HQApiMessageHandler : DelegatingHandler
    {
        private readonly HQConfig _config;
        private readonly HttpClient _httpClient;
        private readonly IDataProtector _dataProtector;

        public HQApiMessageHandler(HQConfig config, HttpClient httpClient, IDataProtectionProvider dataProtectionProvider)
        {
            _config = config;
            _httpClient = httpClient;
            _dataProtector = dataProtectionProvider.CreateProtector("HQ.CLI");
        }

        private async Task<string> GetTokenAsync(CancellationToken cancellationToken, bool forceRefresh = false)
        {
            var accessToken = _dataProtector.Unprotect(_config.AccessToken);
            var refreshToken = _dataProtector.Unprotect(_config.RefreshToken);

            if ((_config.AccessTokenExpiresAt.HasValue && _config.AccessTokenExpiresAt.Value <= DateTime.UtcNow) || forceRefresh)
            {
                var disco = await _httpClient.GetDiscoveryDocumentAsync(_config.AuthUrl.AbsoluteUri);
                if (disco.IsError) throw new Exception(disco.Error);

                var response = await _httpClient.RequestRefreshTokenAsync(new RefreshTokenRequest
                {
                    Address = disco.TokenEndpoint,

                    ClientId = "hq",
                    RefreshToken = refreshToken
                });

                if (response.IsError) throw new Exception(response.Error);

                accessToken = response.AccessToken;

                _config.RefreshToken = !String.IsNullOrEmpty(response.RefreshToken) ? _dataProtector.Protect(response.RefreshToken) : null;
                _config.AccessToken = !String.IsNullOrEmpty(response.AccessToken) ? _dataProtector.Protect(response.AccessToken) : null; ;
                _config.AccessTokenExpiresAt = DateTime.UtcNow.AddSeconds(response.ExpiresIn);
            }

            return accessToken;
        }

        protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            var token = await GetTokenAsync(cancellationToken);
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var response = await base.SendAsync(request, cancellationToken);
            if (response.StatusCode == HttpStatusCode.Unauthorized)
            {
                token = await GetTokenAsync(cancellationToken, true);
                request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
                response.Dispose();

                response = await base.SendAsync(request, cancellationToken);
            }

            return response;
        }
    }
}
