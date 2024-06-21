using System.Globalization;
using System.Net;
using System.Text.Json.Serialization;
using System.Web;

using CsvHelper;
using CsvHelper.Configuration;

using FluentResults;

using HQ.Abstractions.Users;
using HQ.Server.Data;
using HQ.Server.Data.Models;

using Microsoft.EntityFrameworkCore;

namespace HQ.Server.Services;

public class UserServiceV1
{
    private readonly HttpClient _httpClient;
    private readonly HQDbContext _context;

    public UserServiceV1(HttpClient httpClient, HQDbContext context)
    {
        _httpClient = httpClient;
        _context = context;
    }

    public async Task<Result<UpsertUserV1.Response>> UpsertUserV1(UpsertUserV1.Request request, CancellationToken ct = default)
    {
        if (request.StaffId.HasValue && !await _context.Staff.AnyAsync(t => t.Id == request.StaffId.Value))
        {
            return Result.Fail("Invalid StaffId");
        }

        var user = new KeycloakUserRepresentation();
        if (request.Id.HasValue)
        {
            var getUserResponse = await _httpClient.GetAsync($"users/{request.Id}", ct);
            if (!getUserResponse.IsSuccessStatusCode)
            {
                return Result.Fail("Error reading user from auth server.");
            }

            user = await getUserResponse.Content.ReadFromJsonAsync<KeycloakUserRepresentation>(ct);
            if (user == null)
            {
                return Result.Fail("Error parsing user from auth server.");
            }
        }

        user.EmailVerified = true;
        user.FirstName = request.FirstName;
        user.LastName = request.LastName;
        user.Username = request.Email;
        user.Email = request.Email;
        user.Enabled = request.Enabled;
        user.Attributes ??= new();

        if (request.StaffId.HasValue)
        {
            user.Attributes["staff_id"] = new List<string>() { request.StaffId.Value.ToString() };
        }
        else if (user.Attributes.ContainsKey("staff_id"))
        {
            user.Attributes.Remove("staff_id");
        }

        var upsertUserResponse = request.Id.HasValue ? await _httpClient.PutAsJsonAsync($"users/{request.Id.Value}", user, ct) : await _httpClient.PostAsJsonAsync("users", user, ct);
        if (!upsertUserResponse.IsSuccessStatusCode)
        {
            if (upsertUserResponse.StatusCode == HttpStatusCode.Conflict)
            {
                var error = await upsertUserResponse.Content.ReadFromJsonAsync<KeycloakError>();
                if (error != null && !String.IsNullOrEmpty(error.ErrorMessage))
                {
                    return Result.Fail(error.ErrorMessage);
                }
            }

            return Result.Fail("Error upserting user.");
        }

        var userId = user.Id;

        // Get user ID if creating a user, because Keycloak doesn't return it in the create response
        if (!request.Id.HasValue)
        {
            var encodedEmail = HttpUtility.UrlEncode(request.Email);
            var listUsersResponse = await _httpClient.GetAsync($"users?email={encodedEmail}", ct);
            if (!listUsersResponse.IsSuccessStatusCode)
            {
                return Result.Fail("Error reading user from auth server.");
            }

            var users = await listUsersResponse.Content.ReadFromJsonAsync<List<KeycloakUserRepresentation>>(ct);
            if (users == null)
            {
                return Result.Fail("Error parsing user from auth server.");
            }

            userId = users.Single().Id;
        }

        // TODO: Clean this up, better error handling
        var allGroups = (await _httpClient.GetFromJsonAsync<List<KeycloakGroupRepresentation>>("groups"))!
            .ToDictionary(t => t.Name, t => t);

        var userGroups = (await _httpClient.GetFromJsonAsync<List<KeycloakGroupRepresentation>>($"users/{userId}/groups"))!
            .ToDictionary(t => t.Name, t => t);

        var administratorGroup = allGroups["administrator"];
        if (request.IsAdministrator && !userGroups.ContainsKey("administrator"))
        {
            await _httpClient.PutAsync($"users/{userId}/groups/{administratorGroup.Id}", null, ct);
        }
        else if (!request.IsAdministrator && userGroups.ContainsKey("administrator"))
        {
            await _httpClient.DeleteAsync($"users/{userId}/groups/{administratorGroup.Id}", ct);
        }

        var executiveGroup = allGroups["executive"];
        if (request.IsExecutive && !userGroups.ContainsKey("executive"))
        {
            await _httpClient.PutAsync($"users/{userId}/groups/{executiveGroup.Id}", null, ct);
        }
        else if (!request.IsExecutive && userGroups.ContainsKey("executive"))
        {
            await _httpClient.DeleteAsync($"users/{userId}/groups/{executiveGroup.Id}", ct);
        }

        var partnerGroup = allGroups["partner"];
        if (request.IsPartner && !userGroups.ContainsKey("partner"))
        {
            await _httpClient.PutAsync($"users/{userId}/groups/{partnerGroup.Id}", null, ct);
        }
        else if (!request.IsPartner && userGroups.ContainsKey("partner"))
        {
            await _httpClient.DeleteAsync($"users/{userId}/groups/{partnerGroup.Id}", ct);
        }

        var managerGroup = allGroups["manager"];
        if (request.IsManager && !userGroups.ContainsKey("manager"))
        {
            await _httpClient.PutAsync($"users/{userId}/groups/{managerGroup.Id}", null, ct);
        }
        else if (!request.IsManager && userGroups.ContainsKey("manager"))
        {
            await _httpClient.DeleteAsync($"users/{userId}/groups/{managerGroup.Id}", ct);
        }

        var staffGroup = allGroups["staff"];
        if (request.IsStaff && !userGroups.ContainsKey("staff"))
        {
            await _httpClient.PutAsync($"users/{userId}/groups/{staffGroup.Id}", null, ct);
        }
        else if (!request.IsStaff && userGroups.ContainsKey("staff"))
        {
            await _httpClient.DeleteAsync($"users/{userId}/groups/{staffGroup.Id}", ct);
        }

        return new UpsertUserV1.Response()
        {
            Id = userId
        };
    }

    public async Task<Result<GetUsersV1.Response>> GetUsersV1(GetUsersV1.Request request, CancellationToken ct = default)
    {
        var query = HttpUtility.ParseQueryString(string.Empty);

        int count = 0;
        List<KeycloakUserRepresentation>? users = [];

        if (request.Id.HasValue)
        {
            var getResponse = await _httpClient.GetAsync($"users/{request.Id}", ct);
            if (getResponse.IsSuccessStatusCode)
            {
                var user = await getResponse.Content.ReadFromJsonAsync<KeycloakUserRepresentation>(ct); ;
                if (user != null)
                {
                    count = 1;
                    users.Add(user);
                }
            }
        }
        else
        {
            if (!String.IsNullOrEmpty(request.Search))
            {
                query["search"] = "*" + request.Search.Replace(" ", "*") + "*";
            }

            if (request.Skip.HasValue)
            {
                query["first"] = request.Skip.Value.ToString();
            }

            if (request.Take.HasValue)
            {
                query["max"] = request.Take.Value.ToString();
            }

            var qs = query.ToString();

            var listResponse = await _httpClient.GetAsync($"users?{qs}", ct);
            var countResponse = await _httpClient.GetAsync($"users/count?{qs}", ct);

            if (!listResponse.IsSuccessStatusCode || !countResponse.IsSuccessStatusCode)
            {
                return Result.Fail("Error reading users from auth server.");
            }

            count = await countResponse.Content.ReadFromJsonAsync<int>(ct);
            users = await listResponse.Content.ReadFromJsonAsync<List<KeycloakUserRepresentation>>(ct);
            if (users == null)
            {
                return Result.Fail("Error parsing users response from auth server.");
            }
        }

        // TODO: Optimize this to run in parallel
        var records = new List<GetUsersV1.Record>();
        foreach (var user in users)
        {
            var record = new GetUsersV1.Record()
            {
                Id = user.Id,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Enabled = user.Enabled
            };

            if (user.Attributes.ContainsKey("staff_id") && user.Attributes["staff_id"].Count == 1 && Guid.TryParse(user.Attributes["staff_id"].Single(), out Guid staffId))
            {
                record.StaffId = staffId;
            }

            var groupsResponse = await _httpClient.GetAsync($"users/{user.Id}/groups", ct);
            if (!groupsResponse.IsSuccessStatusCode)
            {
                return Result.Fail("Error reading groups from auth server.");
            }

            var groups = await groupsResponse.Content.ReadFromJsonAsync<List<KeycloakGroupRepresentation>>(ct);
            if (groups == null)
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

    public async Task<Result<ImportUsersV1.Response>> ImportUsersV1(ImportUsersV1.Request request, CancellationToken ct = default)
    {
        var conf = new CsvConfiguration(CultureInfo.InvariantCulture)
        {
            HasHeaderRecord = true,
            TrimOptions = TrimOptions.Trim,
            MissingFieldFound = null,
            HeaderValidated = null
        };

        using var reader = new StreamReader(request.File);
        using var csv = new CsvReader(reader, conf);

        var records = csv.GetRecords<ImportUserRecord>()
            .OrderByDescending(t => t.Id.HasValue)
            .ToList();

        var staffByName = await _context.Staff.ToDictionaryAsync(t => t.Name, ct);

        var created = 0;
        var updated = 0;
        var failed = 0;

        var allUsers = await GetUsersV1(new() { Take = 2000 });
        if (allUsers.IsFailed)
        {
            return allUsers.ToResult();
        }

        var userIdByEmail = allUsers.Value.Records.ToDictionary(t => t.Email, t => t.Id);

        foreach (var record in records)
        {
            if (!String.IsNullOrEmpty(record.StaffName) && !record.StaffId.HasValue && staffByName.ContainsKey(record.StaffName.ToLower()))
            {
                record.StaffId = staffByName[record.StaffName.ToLower()].Id;
            }

            if (!String.IsNullOrEmpty(record.Email) && !record.Id.HasValue && userIdByEmail.ContainsKey(record.Email.ToLower()))
            {
                record.Id = userIdByEmail[record.Email.ToLower()];
            }

            var result = await UpsertUserV1(record, ct);
            if (result.IsSuccess)
            {
                if (record.Id.HasValue)
                {
                    updated++;
                }
                else
                {
                    created++;
                }
            }
            else
            {
                failed++;
            }
        }

        return new ImportUsersV1.Response()
        {
            Created = created,
            Updated = updated,
            Failed = failed
        };
    }

    private class ImportUserRecord : UpsertUserV1.Request
    {
        public string? StaffName { get; set; }
    }

    private class KeycloakError
    {
        [JsonPropertyName("errorMessage")]
        public string ErrorMessage { get; set; } = null!;
    }

    private class KeycloakGroupRepresentation
    {
        [JsonPropertyName("id")]
        public Guid Id { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; } = null!;
    }

    private class KeycloakUserRepresentation
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
        public long? CreatedTimestamp { get; set; }

        [JsonPropertyName("enabled")]
        public bool Enabled { get; set; }
    }
}