using System.Net.Http.Headers;

using HQ.Abstractions.Clients;

using HQ.IntegrationTests.Fixtures;
using HQ.Server.Data.Models;

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
    [Fact]
    public async Task GetClientsV1_Should_Return_Matching_clients_When_Search_By_Name()
    {
        // Arrange the request
        var request = new GetClientsV1.Request()
        {
            Search = "dencar"
        };
        // Act
        var response = await _client.PostAsJsonAsync("/v1.0/Clients/GetClientsV1", request);

        // Assert
        response.EnsureSuccessStatusCode();

        var responseBody = await response.Content.ReadFromJsonAsync<GetClientsV1.Response>();


        Assert.NotNull(responseBody);
        Assert.NotEmpty(responseBody.Records);
        Assert.All(responseBody.Records, client =>
           Assert.Contains("dencar", client.Name, StringComparison.OrdinalIgnoreCase)
       );
    }
}
