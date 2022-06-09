// using Insiteflow.ArtifactBadge.Models;
// using Insiteflow.Desktop.Boilerplate.Systems.Notification;
// using Microsoft.Extensions.Configuration;
// using Microsoft.Extensions.Hosting;

// function longPolling(config, notificationService) {
//     const longPolling = {}

//     longPolling.start = function ()  {

//     }
//     longPolling.end = function () {}

//     longPolling.doWork = function ( ) {

//     }

// }

// module.exports = {longPolling}

// {
//     public class LongPollingService : IHostedService, IDisposable
//     {
//         private readonly ILogger<LongPollingService> _logger;
//         private readonly INotificationService _notificationService;
//         private readonly IConfiguration _configuration;
//         //private readonly StartOptions _startOptions;
//         private int executionCount = 0;
//         private Timer _timer = null!;

//         public LongPollingService(
//             ILogger<LongPollingService> logger,
//             INotificationService notificationService,
//             IConfiguration configuration)
//         {
//             _logger = logger;
//             _notificationService = notificationService;
//             _configuration = configuration;
//             // _startOptions = startOptions;
//         }

//         public Task StartAsync(CancellationToken stoppingToken)
//         {
//             if (StartOptions.Instance.IsCernerIntegrationEnabled)
//             {
//                 _logger.LogInformation("Timed Hosted Service running.");

//                 _timer = new Timer(DoWork, null, TimeSpan.Zero,
//                     TimeSpan.FromSeconds(5));
//             }

//             return Task.CompletedTask;
//         }

//         private async void DoWork(object? state)
//         {
//             try
//             {
//                 var count = Interlocked.Increment(ref executionCount);

//                 var content = ""; //await _notificationService.Fetch();

//                 if (!string.IsNullOrEmpty(content))
//                 {
//                     _logger.LogInformation(
//                         "Timed Hosted Service is working. Content: " + content);
//                     await _notificationService.PublishAsync("notification", content);
//                 }

//                 _logger.LogInformation(
//                     "Timed Hosted Service is working. Count: {Count}", count);
//             }
//             catch (Exception e)
//             {
//                 _logger.LogInformation(
//                     "Timed Hosted Service is working. Error: " + e.Message);
//             }
//         }

//         public Task StopAsync(CancellationToken stoppingToken)
//         {
//             console.log("Timed Hosted Service is stopping.");
//             _timer?.Change(Timeout.Infinite, 0);

//             return Task.CompletedTask;
//         }

//         public void Dispose()
//         {
//             _timer?.Dispose();
//         }
//     }
// }
