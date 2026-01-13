using System.Net.Http.Json;

using HQ.Abstractions.Enumerations;
using HQ.Abstractions.Staff;
using HQ.IntegrationTests.Fixtures;
using HQ.SDK;

using Xunit;

namespace HQ.IntegrationTests;


public class StaffControllerIntegrationTests : IClassFixture<HQWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly HQServiceV1 _hqService;

    public StaffControllerIntegrationTests(HQWebApplicationFactory factory)
    {
        _client = factory.CreateClientWithBaseUrl();
        _hqService = new HQServiceV1(_client);
    }

    [Fact]
    public async Task GetStaffV1_Should_Return_All_Staff_When_Empty_Request()
    {
        // Arrange
        var request = new GetStaffV1.Request();

        // Act
        var response = await _hqService.GetStaffV1(request);

        // Assert
        Assert.True(response.IsSuccess, "Failed to fetch staff.");
        Assert.NotNull(response.Value);
        Assert.NotEmpty(response.Value.Records);
    }

    [Fact]
    public async Task GetStaffV1_Should_Return_Staff_By_Name_Search()
    {
        // Arrange
        var request = new GetStaffV1.Request { Search = "seeded" };

        // Act
        var response = await _hqService.GetStaffV1(request);

        // Assert
        Assert.True(response.IsSuccess, "Failed to search staff by name.");
        Assert.NotNull(response.Value);
        Assert.NotEmpty(response.Value.Records);
        // Assert.Single(response.Value.Records);
        // Assert.Equal("seededStaff1", response.Value.Records.First().Name);
    }

    [Fact]
    public async Task UpsertStaffV1_Should_Add_New_Staff()
    {
        // Arrange
        var newStaffRequest = new UpsertStaffV1.Request
        {
            Name = "New Staff Member",
            FirstName = "John",
            LastName = "Doe",
            Email = "john.doe@example.com",
            WorkHours = 40,
            VacationHours = 10,
            Jurisdiciton = Jurisdiciton.USA,
            StartDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-10)),
            EndDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(10))
        };

        // Act
        var response = await _hqService.UpsertStaffV1(newStaffRequest);

        // Assert
        Assert.True(response.IsSuccess, "Failed to add new staff.");
        Assert.NotNull(response.Value);
        Assert.NotEqual(Guid.Empty, response.Value.Id);
    }

    [Fact]
    public async Task UpsertStaffV1_Should_Edit_Existing_Staff()
    {
        // Arrange
        var staffId = await GetStaffIdByName("SeededStaff1");
        Assert.NotNull(staffId);

        var updateStaffRequest = new UpsertStaffV1.Request
        {
            Id = staffId.Value,
            Name = "SeededStaff1",
            FirstName = "Jane",
            LastName = "Doe Updated",
            Email = "jane.doe.updated@example.com",
            WorkHours = 45,
            VacationHours = 15,
            Jurisdiciton = Jurisdiciton.USA,
            StartDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-20)),
            EndDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(20))
        };

        // Act
        var response = await _hqService.UpsertStaffV1(updateStaffRequest);

        // Assert
        Assert.True(response.IsSuccess, "Failed to update staff.");
        Assert.NotNull(response.Value);
        Assert.Equal(updateStaffRequest.Id, response.Value.Id);
    }

    // [Fact]
    // public async Task DeleteStaffV1_Should_Remove_Staff()
    // {
    //     // Arrange
    //     var staffId = await GetStaffIdByName("SeededStaff2");
    //     Assert.NotNull(staffId);

    //     var deleteRequest = new DeleteStaffV1.Request { Id = staffId.Value };

    //     // Act
    //     var response = await _hqService.DeleteStaffV1(deleteRequest);

    //     // Assert
    //     Assert.True(response.IsSuccess, "Failed to delete staff.");

    //     // Verify deletion
    //     var getResponse = await _hqService.GetStaffV1(new GetStaffV1.Request());
    //     Assert.DoesNotContain(getResponse.Value!.Records, s => s.Id == staffId.Value);
    // }

    private async Task<Guid?> GetStaffIdByName(string name)
    {
        var response = await _hqService.GetStaffV1(new GetStaffV1.Request { Search = name });
        return response.Value?.Records.FirstOrDefault()?.Id;
    }
}