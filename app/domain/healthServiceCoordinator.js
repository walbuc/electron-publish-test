function HealthServiceCoordinator() {
  const healthServiceCoordinator = {}
}

module.exports = { HealthServiceCoordinator }



using Insiteflow.Desktop.Boilerplate.Systems.Notification;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;

namespace Insiteflow.Desktop.Boilerplate.Data
{
    public class IntegrationMapItem
    {
        public string Key { get; set; }
        public string Value { get; set; }
    }

    public class IntegrationMapping
    {
        public string Name { get; set; }
        public bool Active { get; set; }
        public string Type { get; set; }
        public string DeviceWhitelist { get; set; }
        public List<IntegrationMapItem> Metadata { get; set; }
    }

    public interface IIntegrationConfigurationService
    {
        Type GetActiveBadgeType();
        Type GetActiveBrowserType();

        Task LoadConfiguration();
    }

    public class IntegrationConfigurationService : IIntegrationConfigurationService
    {
        private readonly IConfiguration _configuration;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILocalStorageService _localStorageService;
        private readonly ILogger<NotificationService> _logger;

        private List<IntegrationMapping> _activeConfiguration;
        private bool _isLoading;

        public IntegrationConfigurationService(ILogger<NotificationService> logger,
            IConfiguration configuration,
            IHttpClientFactory httpClientFactory)
        {

            _logger = logger;
            _configuration = configuration;
            _httpClientFactory = httpClientFactory;
            // _localStorageService = localStorageService;
        }

        public Type GetActiveBadgeType()
        {
            if (_activeConfiguration != null)
            {
                var activeClient = _activeConfiguration.Find(i => i.Active && i.Type == "client");
                if (activeClient != null)
                {
                    switch (activeClient.Name)
                    {
                        case "artifact":
                            return typeof(Pages.Artifact.BadgeArtifact);

                        case "gorilla":
                            return typeof(Pages.Gorilla.BadgeGorilla);

                        case "milliman":
                            return typeof(Pages.Milliman.BadgeMilliman);
                        default:
                            break;
                    }
                }
            }

            return typeof(Pages.Artifact.BadgeArtifact);
        }

        public Type GetActiveBrowserType()
        {
            if (_activeConfiguration != null)
            {
                var activeClient = _activeConfiguration.Find(i => i.Active && i.Type == "client");
                if (activeClient != null)
                {
                    switch (activeClient.Name)
                    {
                        case "artifact":
                            return typeof(Pages.Artifact.BrowserArtifact);

                        case "gorilla":
                            return typeof(Pages.Gorilla.BrowserGorilla);

                        case "milliman":
                            return typeof(Pages.Milliman.BrowserMilliman);
                        default:
                            break;
                    }
                }
            }

            return typeof(Pages.Artifact.BrowserArtifact);
        }

        public async Task LoadConfiguration()
        {
            if (_isLoading)
            {
                await Task.Delay(2000);
            }

            if (_activeConfiguration != null)
            {
                return;
            }

            try
            {
                _isLoading = true;

                var deviceId = _configuration["User:Device"];
                var facilityId = _configuration["User:Facility"];
                var host = _configuration["Feature:Notification:Host"];
                var request = new HttpRequestMessage(
                    HttpMethod.Post,
                    $"{host}/api/v1/facility/{facilityId}/{deviceId}/configuration");

                var activeClient = _httpClientFactory.CreateClient();
                var response = await activeClient.SendAsync(request);
                var content = await response.Content.ReadAsStringAsync();

                _activeConfiguration = JsonConvert.DeserializeObject<List<IntegrationMapping>>(content);
            }
            catch (Exception e)
            {
            }

            _isLoading = false;
        }
    }
}