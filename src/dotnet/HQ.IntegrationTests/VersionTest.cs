using HQ.IntegrationTests.Fixtures;

using Microsoft.AspNetCore.Mvc.Testing;

namespace HQ.IntegrationTests;

public class VersionTest : IClassFixture<HQWebApplicationFactory>
{
    private readonly HttpClient _client;

    public VersionTest(HQWebApplicationFactory factory)
    {
        _client = factory.CreateClientWithBaseUrl();

    }

    [Fact]
    public async Task Get_Version_Returns_Success_Contains_HQ_Parse_Version()
    {

        // Act
        var response = await _client.GetAsync("/");

        // Assert
        response.EnsureSuccessStatusCode();

        var content = await response.Content.ReadAsStringAsync();

        Assert.Contains("HQ", content);

        var versionString = content.Split("HQ").Last();
        if (Version.TryParse(versionString, out Version? version))
        {
            Assert.NotNull(version);
        }
    }
}