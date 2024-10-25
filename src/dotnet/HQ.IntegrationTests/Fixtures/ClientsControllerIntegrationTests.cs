using System.Net.Http.Headers;

using HQ.IntegrationTests.Fixtures;

using Microsoft.AspNetCore.Authentication;

using Microsoft.AspNetCore.Mvc.Testing;

namespace HQ.IntegrationTests;
public class ClientsControllerIntegrationTests : IClassFixture<HQWebApplicationFactory>
{
    private readonly HttpClient _client;

    public ClientsControllerIntegrationTests(HQWebApplicationFactory factory)
    {
        _client = factory.CreateClientWithBaseUrl();

    }

    [Fact]
    public async Task GetClientsV1_Should_Return_Clients()
    {
        var response = await _client.PostAsync("/v1.0/Clients/GetClientsV1", new StringContent("{}", System.Text.Encoding.UTF8, "application/json"));

        response.EnsureSuccessStatusCode();
    }
}
