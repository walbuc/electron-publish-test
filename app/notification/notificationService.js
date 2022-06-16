const EventEmitter = require('events').EventEmitter

function NotificationServiceFactory(config, client) {
  const props = { notifications: [] }
  const emitter = new EventEmitter()
  emitter.fetch = function () {}
  emitter.fetchInitial = function () {}
  emitter.getLocalSessionNotifications = function () {
    return props.notifications
  }

  emitter.publish = function (channel, data) {
    console.log(data, 'PUBLISH NOTIFICATION')
    if (data) {
      const msg = JSON.parse(data)
      if (msg.message) {
        //const content = msg.message ? JSON.parse(msg.message) : null

        const content = msg.message ?? null
        props.notifications.push(content)

        return emitter.emit(channel, content)
      }
      return emitter
    }

    return emitter
  }
  return emitter
}
module.exports = { NotificationServiceFactory }

// using Insiteflow.Desktop.Boilerplate.Systems.LongPolling;

//     public class NotificationService : INotificationService
//     {
//         private const string AllChannels = "*";

//         private List<NotificationDTO> _allNotifications;

//         private HttpClient _activeClient;

//         private readonly IConfiguration _configuration;
//         private readonly IHttpClientFactory _httpClientFactory;
//         private readonly ILogger<NotificationService> _logger;

//         private Dictionary<string, List<Action<List<NotificationDTO>>>> _subscriptions;
//         private Dictionary<string, Func<List<NotificationDTO>, Task>> _subscriptionsAsync;

//         public NotificationService(
//             ILogger<NotificationService> logger,
//             IConfiguration configuration,
//             IHttpClientFactory httpClientFactory)
//         {
//             _subscriptions = new Dictionary<string, List<Action<List<NotificationDTO>>>>();
//             _subscriptionsAsync = new Dictionary<string, Func<List<NotificationDTO>, Task>>();
//             _allNotifications = new List<NotificationDTO>();

//             _logger = logger;
//             _configuration = configuration;
//             _httpClientFactory = httpClientFactory;
//         }

//         public List<NotificationDTO> GetLocalSessionNotifications()
//         {
//             return _allNotifications;
//         }

//         public async Task<string> Fetch()
//         {
//             try
//             {
//                 if (_activeClient == null)
//                 {
//                     var deviceId = _configuration["User:Device"];
//                     var facilityId = _configuration["User:Facility"];
//                     var host = _configuration["Feature:Notification:Host"];
//                     var request = new HttpRequestMessage(
//                         HttpMethod.Post,
//                         $"{host}/api/v1/facility/{facilityId}/{deviceId}/listen");

//                     _activeClient = _httpClientFactory.CreateClient();
//                     var response = await _activeClient.SendAsync(request);
//                     var content = await response.Content.ReadAsStringAsync();

//                     _activeClient = null;

//                     return content;
//                 }
//             }
//             catch (Exception e)
//             {
//                 if (_activeClient != null)
//                 {
//                     _activeClient.Dispose();
//                     _activeClient = null;
//                 }
//             }

//             return "";
//         }

//         public async Task<string> FetchInitial()
//         {
//             try
//             {
//                 if (_activeClient == null)
//                 {
//                     var deviceId = _configuration["User:Device"];
//                     var facilityId = _configuration["User:Facility"];
//                     var host = _configuration["Feature:Notification:Host"];
//                     var request = new HttpRequestMessage(
//                         HttpMethod.Post,
//                         $"{host}/api/v1/facility/{facilityId}/{deviceId}/latest-events");

//                     _activeClient = _httpClientFactory.CreateClient();
//                     var response = await _activeClient.SendAsync(request);
//                     var content = await response.Content.ReadAsStringAsync();

//                     _activeClient = null;

//                     return content;
//                 }
//             }
//             catch (Exception e)
//             {
//                 if (_activeClient != null)
//                 {
//                     _activeClient.Dispose();
//                     _activeClient = null;
//                 }
//             }

//             return "";
//         }
