using System.Net.Http.Json;
using HQ.Abstractions.Projects;
using HQ.Abstractions.Enumerations;
using HQ.IntegrationTests.Fixtures;
using HQ.SDK;
using Xunit;
using HQ.Abstractions.Staff;
using HQ.Abstractions.Clients;

namespace HQ.IntegrationTests
{
    public class ProjectsControllerIntegrationTests : IClassFixture<HQWebApplicationFactory>
    {
        private readonly HttpClient _client;
        private readonly HQServiceV1 _hqService;

        public ProjectsControllerIntegrationTests(HQWebApplicationFactory factory)
        {
            _client = factory.CreateClientWithBaseUrl();
            _hqService = new HQServiceV1(_client);
        }

        [Fact]
        public async Task GetProjectsV1_Should_Return_All_Projects_When_Empty_Request()
        {
            // Arrange
            var request = new GetProjectsV1.Request { };
            // Act
            var result = await _hqService.GetProjectsV1(request);

            // Assert
            Assert.True(result.IsSuccess, "Expected success response.");
            Assert.NotNull(result.Value);
            Assert.NotEmpty(result.Value!.Records);
        }

        [Fact]
        public async Task UpsertProjectV1_Should_Edit_Existing_Project()
        {
            var projectsResult = await _hqService.GetProjectsV1(new GetProjectsV1.Request { Search = "Seeded Project 1" });
            Assert.True(projectsResult.IsSuccess && projectsResult.Value != null, "Failed to fetch seeded project");
            var existingProject = projectsResult.Value!.Records.FirstOrDefault();
            Assert.NotNull(existingProject);

            var request = new UpsertProjectV1.Request
            {
                Id = existingProject.Id,
                Name = "Updated Project Name",
                ClientId = existingProject.ClientId,
                ProjectManagerId = existingProject.ProjectManagerId,
                StartDate = existingProject.StartDate,
                EndDate = DateOnly.FromDateTime(DateTime.UtcNow.AddMonths(1)),
                Status = ProjectStatus.InProduction,
            };

            // Act
            var response = await _hqService.UpsertProjectV1(request);

            // Assert
            Assert.True(response.IsSuccess, "Upsert operation failed");
            Assert.NotNull(response.Value);
        }
    }
}
