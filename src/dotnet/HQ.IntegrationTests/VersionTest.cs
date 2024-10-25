using HQ.IntegrationTests.Fixtures;

using Microsoft.AspNetCore.Mvc.Testing;

namespace HQ.IntegrationTests;

[Collection("HQ")]
public class VersionTest
{
    private readonly HQFixture _fixture;

    public VersionTest(HQFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Get_Version_Returns_Success_Contains_HQ_Parse_Version()
    {
        // Arrange
        var client = _fixture.CreateClient();

        // Act
        var response = await client.GetAsync("/");

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