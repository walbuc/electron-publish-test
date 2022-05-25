const remote = require('@electron/remote/main')
remote.initialize()
const { app } = require('electron')
const { PageManagerFactory } = require('./browserViewManager/pageControls')
const args = require('minimist')(process.argv.slice(2))

const { AccountServiceFactory } = require('./data/accountService')
// --if-facility-id – The facility ID used for both authentication and API operations (Required)

// --if-facility-secret – The facility secret used to authenticate to the Insiteflow backend via OAuth (Required)

// --ec-path – The path to the directory to find the Epic XML context files

// --ec-key– The encryption key used with the Epic XML context files

// --ec-algorithm – The encryption algorithm used for encrypting the Epic XML context files (Defaults to AES128)

// OAuth credentials:
// Grant Type: Client Credentials
// Token URL: https://stage-fhir.insiteflow.com/connect/token

// --if-facility-id
// Client ID: 655c5db4-6e79-11ec-b6af-068e8d6b9d64

// --if-facility-secret
// Client Secret: DOMIMdHdLk57RT66C3kX

// Scope: facility-api

function getOptions() {
  // Client ID:
  const facilityId = args['if-facility-id']
  //Client Secret
  const facilitySecret = args['if-facility-secret']
  const ecPath = args['ec-path']
  const ecKey = args['ec-key']
  const ecAlgorithm = args['ec-algorithm'] || 'AES-128'
  const integration = args.integration

  return { facilityId, facilitySecret, ecPath, ecKey, ecAlgorithm, integration }
}

// integration required
// if epic => validate path, algotithm optonal
// Client ID: required
// Client secret: required
//private static string[] ValidEventFileEncryptionTypeOptions = new string[] { "AES-128", "AES-256" };

function validateOptions(options) {}

const pageManager = PageManagerFactory()

app.whenReady().then(() => {
  //compose validate
  const options = getOptions()
  console.log(options, 'e')
  AccountServiceFactory(options)

  const { screen } = require('electron')
  const primaryDisplay = screen.getPrimaryDisplay()
  PageManagerFactory.DisplayHeight = primaryDisplay.size.height
  PageManagerFactory.DisplayWidth = primaryDisplay.size.width

  pageManager.createBadge()
  remote.enable(PageManagerFactory.Badge.window.webContents)

  //pageManager.createBrowser()
  PageManagerFactory.Badge.window.loadFile(`${__dirname}/html/badge.html`)
  //PageManagerFactory.Badge.window.loadFile(`${__dirname}/html/browser.html`)
})

module.exports = { pageManager, PageManagerFactory }

// services
//                 .AddScoped<IRestClient, RestClient>()
//                 .AddScoped<ILocalStorageService, LocalStorageService>()
//                 .AddScoped<IAlertService, AlertService>()
//                 .AddScoped<IHttpService, HttpService>()
//                 .AddScoped<IHealthServiceCoordinator, HealthServiceCoordinator>()

//                 .AddScoped<IAccountService>((x) => new AccountServiceFactory(x.GetRequiredService<ILogger<AccountServiceFactory>>()).Create(Program.Options))
//                 .AddScoped<IArtifactHealthService>((x) => new ArtifactHealthServiceFactory().Create(Program.Options))

//                 .AddScoped<IFacilityService, FacilityService>()
//                 .AddScoped<IBaseHealthService, BaseHealthService>();
