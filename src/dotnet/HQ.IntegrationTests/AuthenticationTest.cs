using DotNet.Testcontainers.Builders;
using DotNet.Testcontainers.Configurations;

using HQ.IntegrationTests.Fixtures;

namespace HQ.IntegrationTests;

[Collection("HQ")]
public class AuthenticationTest
{
    private readonly HQFixture _fixture;

    public AuthenticationTest(HQFixture fixture)
    {
        _fixture = fixture;
    }

    // [Fact]
    // public async Task Authenticate_As_Staff()
    // {
    //     await Task.Delay(100);
    //     var container = _fixture.TestContainer;
    //     if (container == null)
    //     {
    //         return;
    //     }

    //     // Create a new instance of HttpClient to send HTTP requests.
    //     var httpClient = new HttpClient();

    //     // Construct the request URI by specifying the scheme, hostname, assigned random host port, and the endpoint "uuid".
    //     var requestUri = new UriBuilder(Uri.UriSchemeHttp, container.Hostname, container.GetMappedPublicPort(8080), "uuid").Uri;

    //     // Send an HTTP GET request to the specified URI and retrieve the response as a string.
    //     var guid = await httpClient.GetStringAsync(requestUri);

    //     // Ensure that the retrieved UUID is a valid GUID.
    //     Assert.True(Guid.TryParse(guid, out _));
    // }
}