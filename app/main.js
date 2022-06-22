const remote = require('@electron/remote/main')
const pipe = require('lodash/fp/flow')
remote.initialize()
const { app, ipcMain } = require('electron')
const { PageManagerFactory } = require('./browserViewManager/pageControls')
const args = require('minimist')(process.argv.slice(2))
const console = require('console')
const { AccountServiceFactory } = require('./data/accountService')
const { BaseHealthServiceFactory } = require('./data/baseHealthService')
const {
  NotificationServiceFactory,
} = require('./notification/notificationService')
const { longPollingFactory } = require('./notification/longPolling')
const {
  getEventsOptions,
  CERNER_INTEGRATION,
  EPIC_INTEGRATION,
  AES_128,
  AES_256,
} = require('./utils/constants')
//const { LocalStorageFactory } = require('./data/localStorageService')

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

// Having this in memory for now.
function LocalStorageFactory() {
  const props = { patientsStack: [] }

  const localStorageService = {
    getPatientsStack() {
      return [...props.patientsStack]
    },
    setPatientsStack(patientsStack) {
      props.patientsStack = [...patientsStack]
      return [...props.patientsStack]
    },
  }
  return localStorageService
}

const lss = LocalStorageFactory()

function getOptions() {
  const facilityId = args['if-facility-id']
  const facilitySecret = args['if-facility-secret']
  const ecPath = args['ec-path']
  const ecKey = args['ec-key']
  const ecAlgorithm = args['ec-algorithm'] || 'AES-128'
  const integration = args.integration || 'cerner'

  return { facilityId, facilitySecret, ecPath, ecKey, ecAlgorithm, integration }
}

//private static string[] ValidEventFileEncryptionTypeOptions = new string[] { "AES-128", "AES-256" };

function validateAlgorithm(options) {
  const { ecAlgorithm } = options
  const validOptions = [AES_128, AES_256]

  const valid = validOptions.includes(ecAlgorithm)
  if (valid) {
    return Object.assign({}, options)
  }
  throw new Error('Supported ecAlgorithm options are' + validOptions.join(', '))
}

function validateIntegration(options) {
  const { integration } = options
  const validOptions = [CERNER_INTEGRATION, EPIC_INTEGRATION]

  const valid = validOptions.includes(integration)
  if (valid) {
    return Object.assign({}, options)
  }
  throw new Error('Supported integration options are' + validOptions.join(', '))
}

function validatePath(options) {
  const { ecPath, isEpicIntegrationEnabled } = options
  if (isEpicIntegrationEnabled() && !ecPath) {
    throw new Error('ec-path is required.')
  }
  return Object.assign({}, options, {})
}

const isEpicIntegrationEnabled = option => o => {
  return Object.assign({}, o, {
    isEpicIntegrationEnabled: () => o.integration.toLowerCase() === option,
  })
}

const isCernerIntegrationEnabled = option => o => {
  return Object.assign({}, o, {
    isCernerIntegrationEnabled: () => o.integration.toLowerCase() === option,
  })
}

const required = key => options => {
  if (options[key]) {
    return Object.assign({}, options, {})
  }
  throw new Error(`${key} is required`)
}

const validateInput = pipe(
  validateIntegration,
  isCernerIntegrationEnabled(CERNER_INTEGRATION),
  isEpicIntegrationEnabled(EPIC_INTEGRATION),
  validatePath,
  validateAlgorithm,
  required('facilityId'),
  required('facilitySecret'),
)

const options = validateInput(getOptions())

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
    // should init Badge.window
    pageManager.createBadge()
    pageManager.createBrowser()
    // After Badge init i should get a Login event from not service
    // and use practitioner id
    notificationService.on('login', () => {
      PageManagerFactory.Badge.window.loadFile(`${__dirname}/html/badge.html`)
      remote.enable(PageManagerFactory.Badge.window.webContents)
    })

    longPollingService.start()

    ipcMain.on('lss:getPatientsStack', handlegetPatientsStack)
    ipcMain.on('lss:setPatientsStack', handlesetPatientsStack)
  })

  const { screen } = require('electron')
  const primaryDisplay = screen.getPrimaryDisplay()
  PageManagerFactory.DisplayHeight = primaryDisplay.size.height
  PageManagerFactory.DisplayWidth = primaryDisplay.size.width
})

function handlegetPatientsStack(event, args) {
  event.returnValue = lss.getPatientsStack()
}

const handlesetPatientsStack = (event, ps) => {
  console.log(ps, 'Setting patient stack')
  event.returnValue = lss.setPatientsStack(ps)
}

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

notificationService.on('logout', async data => {
  await baseHealthService.revoke()
  if (PageManagerFactory.Browser) {
    PageManagerFactory.Browser.quit()
  }
})

notificationService.on('PatientClose', async data => {
  await baseHealthService.revoke(data)
})

notificationService.on('PatientOpen', async data => {
  const patientContextData = await baseHealthService.fetchPatientContextUrl(
    data,
  )
  const patientData = {
    ...patientContextData,
    chartOpenEvent: { ...data },
    addedTm: Date.now(),
  }
  if (PageManagerFactory.Browser.isDisplayed) {
    PageManagerFactory.Browser.window.webContents.send(
      'PatientOpen',
      patientData,
    )
  } else {
    lss.setPatientsStack([...lss.getPatientsStack(), patientData])
  }
})

notificationService.on('PatientClose', data => {
  if (PageManagerFactory.Browser.isDisplayed) {
    PageManagerFactory.Browser.window.webContents.send('PatientClose', data)
  } else {
    const { patient } = data
    const ps = lss
      .getPatientsStack()
      .filter(p => p.chartOpenEvent.patient.mrn !== patient.mrn)
    lss.setPatientsStack(ps)
  }
})

module.exports = {
  pageManager,
  PageManagerFactory,
  showBrowser,
  getProviderContext,
  notificationService,
  baseHealthService,
}
