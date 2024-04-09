using HQ.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Json;
using System.Text;
using System.Threading.Tasks;

namespace HQ.SDK
{
    public class TestApiService
    {
        private readonly HttpClient _httpClient;

        public TestApiService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<List<WeatherForecast>?> GetWeatherForecastAsync()
        {
            return await _httpClient.GetFromJsonAsync<List<WeatherForecast>>("/v1/weather-forecast");
        }
    }
}
