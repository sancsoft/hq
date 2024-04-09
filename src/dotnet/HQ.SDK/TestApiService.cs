using System;
using System.Collections.Generic;
using System.Linq;
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

        public async Task<string> GetWeatherForecastAsync()
        {
            return await _httpClient.GetStringAsync("/v1/weather-forecast");
        }
    }
}
