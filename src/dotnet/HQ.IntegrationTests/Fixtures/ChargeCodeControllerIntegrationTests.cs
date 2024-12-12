using System.Threading.Tasks;

using HQ.Abstractions.ChargeCodes;
using HQ.IntegrationTests.Fixtures;
using HQ.SDK;

using Xunit;

namespace HQ.IntegrationTests;

public class ChargeCodeControllerIntegrationTests : IClassFixture<HQWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly HQServiceV1 hqService;
    public ChargeCodeControllerIntegrationTests(HQWebApplicationFactory factory)
    {
        _client = factory.CreateClientWithBaseUrl();
        hqService = new HQServiceV1(_client);
    }

    [Fact]
    public async Task GetChargeCodesV1_Should_Return_All_ChargeCodes()
    {
        // Arrange
        var request = new GetChargeCodesV1.Request
        {

            Search = null
        };

        // Act
        var result = await hqService.GetChargeCodesV1(request);

        // Assert
        Assert.NotNull(result);
        Assert.True(result.IsSuccess, "Request failed");
        Assert.NotNull(result.Value);
        Assert.NotEmpty(result.Value.Records);
    }

    [Fact]
    public async Task UpsertChargeCodesV1_Should_Add_New_ChargeCode()
    {
        // Arrange
        var request = new Abstractions.Staff.UpsertChargeCodeV1.Request
        {

            Activity = Abstractions.Enumerations.ChargeCodeActivity.General,
            Billable = true,
            Active = true,
            ProjectId = null
        };

        // Act
        var result = await hqService.UpsertChargeCodesV1(request);

        // Assert
        Assert.NotNull(result);
        Assert.True(result.IsSuccess, "Upsert request failed");
        Assert.NotNull(result.Value);
    }
}
