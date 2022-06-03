const EventEmitter = require('events').EventEmitter
const fs = require('fs')

function notificationServiceFactory(files, regex) {
  const emitter = new EventEmitter()
  files.forEach(function (file) {
    fs.readFile(file, 'utf8', (err, content) => {
      if (err) return emitter.emit('error', err)
      emitter.emit('fileread', file)
      let match
      if ((match = content.match(regex)))
        match.forEach(elem => emitter.emit('found', file, elem))
    })
  })
  return emitter
}

module.exports = { notificationServiceFactory }
// using Insiteflow.Desktop.Boilerplate.Systems.LongPolling;
// using Microsoft.Extensions.Configuration;
// using Microsoft.Extensions.Logging;
// using Newtonsoft.Json;
// using System;
// using System.Collections.Generic;
// using System.Linq;
// using System.Net.Http;
// using System.Threading.Tasks;

// namespace Insiteflow.Desktop.Boilerplate.Systems.Notification
// {
//     public class NotificationMessage
//     {
//         public string Message {get;set;}
//     }

//     public interface INotificationService
//     {
//         Task<string> Fetch();
//         Task<string> FetchInitial();
//         List<NotificationDTO> GetLocalSessionNotifications();
//         void Subscribe(Action<List<NotificationDTO>> callback);

//         void Subscribe(string channel, Action<List<NotificationDTO>> callback);
//         void Publish(string channel, string data);
//         void Publish(string channel, NotificationMessage data);

//         Task<string> PublishAsync(string channel, string data);
//         void SubscribeAsync(string channel, Func<List<NotificationDTO>, Task> callback);
//     }

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

//         public void Publish(string channel, string data)
//         {
//             if (!string.IsNullOrEmpty(data))
//             {
//                 var msg = JsonConvert.DeserializeObject<NotificationMessage>(data);

//                 if (!string.IsNullOrEmpty(msg.Message))
//                 {
//                     var content = JsonConvert.DeserializeObject<List<NotificationDTO>>(msg.Message);

//                     _allNotifications.AddRange(content);

//                     if (_subscriptions.ContainsKey(channel))
//                     {
//                         var channelSubs = _subscriptions[channel];
//                         foreach(var sub in channelSubs)
//                         {
//                             sub(content);
//                         }
//                     }
//                 }
//             }
//         }

//         public void Publish(string channel, NotificationMessage data)
//         {
//             var content = JsonConvert.DeserializeObject<List<NotificationDTO>>(data.Message);

//             _allNotifications.AddRange(content);

//             if (_subscriptions.ContainsKey(channel))
//             {
//                 var channelSubs = _subscriptions[channel];
//                 foreach(var sub in channelSubs)
//                 {
//                     sub(content);
//                 }
//             }
//         }

//         public async Task<string> PublishAsync(string channel, string data)
//         {
//             if (!string.IsNullOrEmpty(data))
//             {
//                 var msg = JsonConvert.DeserializeObject<NotificationMessage>(data);
//                 var content = JsonConvert.DeserializeObject<List<NotificationDTO>>(msg.Message);

//                 _allNotifications.AddRange(content);

//                 if (_subscriptionsAsync.ContainsKey(channel))
//                 {
//                     await _subscriptionsAsync[channel](content);
//                 }
//             }

//             return "";
//         }

//         public void Subscribe(string channel, Action<List<NotificationDTO>> callback)
//         {
//             if (!_subscriptions.ContainsKey(channel))
//             {
//                 _subscriptions.Add(channel, new List<Action<List<NotificationDTO>>>{callback});
//             }
//             else
//             {
//                 if (!_subscriptions[channel].Contains(callback))
//                 {
//                     _subscriptions[channel].Add(callback);
//                 }
//             }
//         }

//         public void SubscribeAsync(string channel, Func<List<NotificationDTO>, Task> callback)
//         {
//             if (!_subscriptionsAsync.ContainsKey(channel))
//             {
//                 _subscriptionsAsync.Add(channel, callback);
//             }
//             else
//             {
//                 _subscriptionsAsync[channel] = callback;
//             }
//         }

//         public void Subscribe(Action<List<NotificationDTO>> callback)
//         {
//             if (!_subscriptions.ContainsKey(AllChannels))
//             {
//                 _subscriptions.Add(AllChannels, new List<Action<List<NotificationDTO>>> { callback });
//             }
//             else
//             {
//                 if (!_subscriptions[AllChannels].Contains(callback))
//                 {
//                     _subscriptions[AllChannels].Add(callback);
//                 }
//             }
//         }
//     }
// }
