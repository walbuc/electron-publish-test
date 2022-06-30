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
  isNotMac,
} = require('./utils/constants')
const { LevelFactory } = require('./data/levelService')
var os = require('os')

app.commandLine.appendSwitch('remote-debugging-port', '9222')
app.console = new console.Console(process.stdout, process.stderr)

const ls = LevelFactory('database')

function getOptions() {
  const facilityId = args['if-facility-id']
  const facilitySecret = args['if-facility-secret']
  const ecPath = args['ec-path']
  const ecKey = args['ec-key']
  const ecAlgorithm = args['ec-algorithm'] || 'AES-128'
  const integration = args.integration || 'cerner'

  return { facilityId, facilitySecret, ecPath, ecKey, ecAlgorithm, integration }
}

function validateEncriptionKey(options) {
  if (options.isEpicIntegrationEnabled() && !options.ecKey) {
    throw new Error('ec-key is required.')
  }
  return Object.assign({}, options, {})
}

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

const getDeviceId = isNotMac => options => {
  if (isNotMac()) {
    return Object.assign({}, options, { deviceId: process.env.COMPUTERNAME })
  }
  return Object.assign({}, options, { deviceId: os.hostname() })
}

const validateInput = pipe(
  validateIntegration,
  isCernerIntegrationEnabled(CERNER_INTEGRATION),
  isEpicIntegrationEnabled(EPIC_INTEGRATION),
  validatePath,
  validateAlgorithm,
  required('facilityId'),
  required('facilitySecret'),
  validateEncriptionKey,
  getDeviceId(isNotMac),
)

const options = validateInput(getOptions())
const eventsOptions = getEventsOptions(options.integration)
const pageManager = PageManagerFactory()
const notificationService = NotificationServiceFactory()

const baseHealthService = BaseHealthServiceFactory(options, notificationService)
const longPollingService = longPollingFactory(
  options,
  notificationService,
  baseHealthService,
  eventsOptions,
)
AccountServiceFactory(
  options,
  notificationService,
  eventsOptions,
  baseHealthService,
)

app.whenReady().then(() => {
  baseHealthService.connect().then(async () => {
    await baseHealthService.fetchFacilityClients()
    // after getting the client I get icon and more info
    // should init Badge.window
    pageManager.createBadge()
    pageManager.createBrowser()
    // After Badge init i should get a Login event from not service
    // and use practitioner id
    longPollingService.start()
    notificationService.on('login', () => {
      PageManagerFactory.Badge.window.loadFile(`${__dirname}/html/badge.html`)
      PageManagerFactory.Badge.open()
      remote.enable(PageManagerFactory.Badge.window.webContents)
    })

    ipcMain.on('lss:getPatientsStack', handlegetPatientsStack)
    ipcMain.on('lss:setPatientsStack', handlesetPatientsStack)
  })

  const { screen } = require('electron')
  const primaryDisplay = screen.getPrimaryDisplay()
  PageManagerFactory.DisplayHeight = primaryDisplay.size.height
  PageManagerFactory.DisplayWidth = primaryDisplay.size.width
})

async function handlegetPatientsStack(event, args) {
  event.returnValue = await ls.getPatientsStack()
}

async function handlesetPatientsStack(event, ps) {
  event.returnValue = await ls.setPatientsStack(ps)
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

notificationService.on('logout', async () => {
  await baseHealthService.revoke()
  console.log('Processing logout in notification service...')
  if (PageManagerFactory.Browser) {
    console.log('Hiding browser and badge...')
    PageManagerFactory.Browser.close()
    PageManagerFactory.Badge.close()
    ls.setPatientsStack([])
  }
})

notificationService.on('PatientClose', async data => {
  await baseHealthService.revoke(data)
})

notificationService.on('PatientOpen', async data => {
  //Check if patient already exists
  const existingPatients = await ls.getPatientsStack()
  console.log('Checking for patient with MRN: ' + data.patient.mrn)
  console.log(existingPatients)

  if (
    existingPatients &&
    existingPatients.length > 0 &&
    existingPatients.find(
      patientContext => patientContext.patient.mrn === data.patient.mrn,
    )
  ) {
    console.log('Patient with MRN: ' + data.patient.mrn + ' already exists')
    return
  }

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
    ls.setPatientsStack([...existingPatients, patientData])
  }
})

notificationService.on('PatientClose', data => {
  console.log('Closing patient with MRN: ' + data.patient.mrn)
  if (PageManagerFactory.Browser.isDisplayed) {
    console.log('Removing patient via browser change')
    PageManagerFactory.Browser.window.webContents.send('PatientClose', data)
  } else {
    console.log('Removing patient tab in stack...')
    const { patient } = data
    const ps = ls
      .getPatientsStack()
      .filter(p => p.chartOpenEvent.patient.mrn !== patient.mrn)
    ls.setPatientsStack(ps)
  }
})

app.on('window-all-closed', async () => {
  app.quit()
  await ls.logout()
})

module.exports = {
  pageManager,
  PageManagerFactory,
  showBrowser,
  getProviderContext,
  notificationService,
  baseHealthService,
}
