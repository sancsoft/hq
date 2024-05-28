using System.Text.Json.Serialization;
using System.Web;
using FluentResults;
using HQ.Abstractions.Users;
using HQ.Server.Data.Models;

namespace HQ.Server.Services;

public class UserServiceV1
{
    private readonly HttpClient _httpClient;

    public UserServiceV1(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<Result<UpsertUserV1.Response>> UpsertUserV1(UpsertUserV1.Request request, CancellationToken ct = default)
    {
    
        return new UpsertUserV1.Response()
        {
        };
    }

    public async Task<Result<GetUsersV1.Response>> GetUsersV1(GetUsersV1.Request request, CancellationToken ct = default)
    {
        var query = HttpUtility.ParseQueryString(string.Empty);
        if(!String.IsNullOrEmpty(request.Search))
        {
            query["search"] = request.Search;
        }

        if(request.Skip.HasValue)
        {
            query["first"] = request.Skip.Value.ToString();
        }

        if(request.Take.HasValue)
        {
            query["max"] = request.Take.Value.ToString();
        }

        var qs = query.ToString();

        var listResponse = await _httpClient.GetAsync($"users?{qs}", ct);
        var countResponse = await _httpClient.GetAsync($"users/count?{qs}", ct);

        if(!listResponse.IsSuccessStatusCode || !countResponse.IsSuccessStatusCode)
        {
            return Result.Fail("Error reading users from auth server.");
        }

        var count = await countResponse.Content.ReadFromJsonAsync<int>(ct);
        var users = await listResponse.Content.ReadFromJsonAsync<List<KeycloakUserList>>(ct);
        if(users == null)
        {
            return Result.Fail("Error parsing users response from auth server.");
        }

        // TODO: Optimize this to run in parallel
        var records = new List<GetUsersV1.Record>();
        foreach(var user in users)
        {
            var record = new GetUsersV1.Record() {
                Id = user.Id,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Enabled = user.Enabled
            };

            if(user.Attributes.ContainsKey("staff_id") && user.Attributes["staff_id"].Count == 1 && Guid.TryParse(user.Attributes["staff_id"].Single(), out Guid staffId))
            {
                record.StaffId = staffId;
            }

            var groupsResponse = await _httpClient.GetAsync($"users/{user.Id}/groups", ct);
            if(!groupsResponse.IsSuccessStatusCode)
            {
                return Result.Fail("Error reading groups from auth server.");
            }

            var groups = await groupsResponse.Content.ReadFromJsonAsync<List<KeycloakGroupList>>(ct);
            if(groups == null)
            {
                return Result.Fail("Error parsing groups response from auth server.");
            }

            record.IsAdministrator = groups.Any(t => t.Name == "administrator");
            record.IsExecutive = groups.Any(t => t.Name == "executive");
            record.IsPartner = groups.Any(t => t.Name == "partner");
            record.IsManager = groups.Any(t => t.Name == "manager");
            record.IsStaff = groups.Any(t => t.Name == "staff");

            records.Add(record);
        }

        return new GetUsersV1.Response()
        {
            Total = count,
            Records = records
        };
    }

    private class KeycloakGroupList
    {
        [JsonPropertyName("id")]
        public Guid Id { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; } = null!;
    }

    private class KeycloakUserList
    {
        [JsonPropertyName("id")]
        public Guid Id { get; set; }

        [JsonPropertyName("username")]
        public string? Username { get; set; }

        [JsonPropertyName("firstName")]
        public string? FirstName { get; set; }

        [JsonPropertyName("lastName")]
        public string? LastName { get; set; }

        [JsonPropertyName("email")]
        public string Email { get; set; } = null!;

        [JsonPropertyName("emailVerified")]
        public bool EmailVerified { get; set; }

        [JsonPropertyName("attributes")]
        public Dictionary<string, List<string>> Attributes { get; set; } = new();

        [JsonPropertyName("createdTimestamp")]
        public long CreatedTimestamp { get; set; }

        [JsonPropertyName("enabled")]
        public bool Enabled { get; set; }
    }
}
