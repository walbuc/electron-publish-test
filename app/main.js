const remote = require('@electron/remote/main')
remote.initialize()
const { app } = require('electron')
const { PageManagerFactory } = require('./browserViewManager/pageControls')
const args = require('minimist')(process.argv.slice(2))
const console = require('console')
const { AccountServiceFactory } = require('./data/accountService')
const { BaseHealthServiceFactory } = require('./data/baseHealthService')
const {
  NotificationServiceFactory,
} = require('./notification/notificationService')
const { longPollingFactory } = require('./notification/longPolling')
const { getEventsOptions } = require('./utils/constants')

app.commandLine.appendSwitch('remote-debugging-port', '9222')
app.console = new console.Console(process.stdout, process.stderr)

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
  const facilityId = args['if-facility-id']
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

// to do re implement validation
function validateOptions(options) {}

const options = getOptions()
// is there a default option?
options.isCernerIntegrationEnabled =
  options.integration.toLowerCase() === 'cerner'
const eventsOptions = getEventsOptions(options.integration)
const pageManager = PageManagerFactory()
const notificationService = NotificationServiceFactory()

AccountServiceFactory(options, notificationService, eventsOptions)
const baseHealthService = BaseHealthServiceFactory(options, notificationService)

const longPollingService = longPollingFactory(
  options,
  notificationService,
  baseHealthService,
  eventsOptions,
)

app.whenReady().then(() => {
  baseHealthService.connect().then(() => {
    baseHealthService.fetchFacilityClients()
    // after getting the client I get icon and more info
    //should init Badge.window
    pageManager.createBadge()
    pageManager.createBrowser()
    // After Badge init i hsould get a Login event from not service
    // and use practitioner id
    notificationService.on('login', () => {
      PageManagerFactory.Badge.window.loadFile(`${__dirname}/html/badge.html`)
      remote.enable(PageManagerFactory.Badge.window.webContents)
    })

    longPollingService.start()
  })

  const { screen } = require('electron')
  const primaryDisplay = screen.getPrimaryDisplay()
  PageManagerFactory.DisplayHeight = primaryDisplay.size.height
  PageManagerFactory.DisplayWidth = primaryDisplay.size.width
})

function showBrowser() {
  PageManagerFactory.Browser.show(`${__dirname}/html/browser.html`)
  PageManagerFactory.Browser.window.on('close', function () {
    pageManager.createBrowser()
    PageManagerFactory.Badge.window.webContents.send('browser-close')
  })
  remote.enable(PageManagerFactory.Browser.window.webContents)
}

const getProviderContext = (function () {
  return async function () {
    const data = await baseHealthService.fetchProviderContexUrl()
    return data
  }
})()

module.exports = {
  pageManager,
  PageManagerFactory,
  showBrowser,
  getProviderContext,
  notificationService,
  baseHealthService,
}
