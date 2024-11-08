using HQ.Abstractions.Clients;

using HQ.IntegrationTests.Fixtures;
using HQ.SDK;

namespace HQ.IntegrationTests;
public class ClientsControllerIntegrationTests : IClassFixture<HQWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly HQServiceV1 hqService;


    public ClientsControllerIntegrationTests(HQWebApplicationFactory factory)
    {
        _client = factory.CreateClientWithBaseUrl();
        hqService = new HQServiceV1(_client);
    }

    [Fact]
    public async Task GetClientsV1_Should_Return_Client_When_Searching_By_Seeded_Name()
    {
        // Arrange
        var seededClientName = "Seeded Client 1";
        var request = new GetClientsV1.Request
        {
            Search = seededClientName
        };

        // Act
        var result = await hqService.GetClientsV1(request);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Value);
        Assert.NotEmpty(result.Value!.Records);
        Assert.Contains(result.Value.Records, client => client.Name == seededClientName);

        foreach (var client in result.Value.Records)
        {
            Console.WriteLine($"Client Name: {client.Name}, Official Name: {client.OfficialName}");
        }
    }

    [Fact]
    public async Task GetClientsV1_Should_Return_All_Clients_When_Request_Is_Empty()
    {
        // Arrange
        var request = new GetClientsV1.Request();

        // Act
        var result = await hqService.GetClientsV1(request);

        // Assert

        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Value);
        Assert.NotEmpty(result.Value!.Records);

        Console.WriteLine($"Total clients returned: {result.Value!.Records.Count}");
    }


    [Fact]
    public async Task UpsertClientV1_Should_Update_Existing_Client()
    {
        // Arrange
        var createRequest = new UpsertClientV1.Request
        {
            Id = null,
            Name = "ExistingClient",
            OfficialName = "Existing Client Official",
            BillingEmail = "existingclient@example.com",
            HourlyRate = 150.0m
        };
        var createResult = await hqService.UpsertClientV1(createRequest);
        Assert.True(createResult.IsSuccess);
        var createdClientId = createResult.Value!.Id;

        // Update the client
        var updateRequest = new UpsertClientV1.Request
        {
            Id = createdClientId,
            Name = "UpdatedClient",
            OfficialName = "Updated Client Official",
            BillingEmail = "updatedclient@example.com",
            HourlyRate = 200.0m
        };

        // Act
        var updateResult = await hqService.UpsertClientV1(updateRequest);

        // Assert
        Assert.True(updateResult.IsSuccess);
        Assert.Equal(createdClientId, updateResult.Value!.Id);
    }

    [Fact]
    public async Task DeleteClientV1_Should_Remove_Client()
    {
        // Arrange
        var createRequest = new UpsertClientV1.Request
        {
            Id = null,
            Name = "ClientToDelete",
            OfficialName = "Client To Delete Official",
            BillingEmail = "deleteclient@example.com",
            HourlyRate = 120.0m
        };
        var createResult = await hqService.UpsertClientV1(createRequest);
        Assert.True(createResult.IsSuccess);
        var createdClientId = createResult.Value!.Id;

        // Act
        var deleteRequest = new DeleteClientV1.Request { Id = createdClientId };
        var deleteResult = await hqService.DeleteClientV1(deleteRequest);

        // Assert
        Assert.True(deleteResult.IsSuccess);

        // Verify that the client is deleted
        var getRequest = new GetClientsV1.Request { Id = createdClientId };
        var getResult = await hqService.GetClientsV1(getRequest);
        Assert.True(getResult.IsSuccess);
        Assert.Empty(getResult.Value!.Records);
    }
}
