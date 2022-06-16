const remote = require('@electron/remote')
const mainProcess = remote.require('./main')
const app = remote.app
const currentWindow = remote.getCurrentWindow()
const browserView = document.querySelector('#view-renderer')
const navigationBar = document.querySelector('#nav-tab')
const navigationTabContent = document.querySelector('#nav-tabContent')
const refreshButton = document.querySelector('#webview-refresh')
const backButton = document.querySelector('#webview-back')
const forwardButton = document.querySelector('#webview-forward')

var patientsStack = []

var count = 1

function getActiveWebview() {
  return document.querySelector('.tab-content .active webview')
}

refreshButton.addEventListener('click', e => {
  const activeWebview = getActiveWebview()
  if (activeWebview) {
    activeWebview.reload()
  }
})

backButton.addEventListener('click', e => {
  const activeWebview = getActiveWebview()
  if (activeWebview && activeWebview.canGoBack()) {
    activeWebview.goBack()
  }
})

forwardButton.addEventListener('click', e => {
  const activeWebview = getActiveWebview()
  if (activeWebview && activeWebview.canGoForward()) {
    activeWebview.goForward()
  }
})

async function getPatientContext() {
  mainProcess.notificationService.on('PatientOpen', async data => {
    const patientData =
      await mainProcess.baseHealthService.fetchPatientContextUrl(data)
    displayPatientView(patientData, data)
  })

  mainProcess.notificationService.on('PatientClose', data => {
    const { patient } = data
    removePatientView(patient)
  })
}

function removePatientView(patient) {
  removeNodes(patient.mrn)
  patientsStack = patientsStack.filter(
    p => p.chartOpenEvent.patient.mrn !== patient.mrn,
  )
  count = patientsStack.length
}

function removeNodes(mrn) {
  const patient = patientsStack.find(p => p.chartOpenEvent.patient.mrn === mrn)
  patient.btn.remove()
  patient.view.remove()
}

function getOldest(patients) {
  const oldest = patients.reduce((acc, patient) => {
    if (acc) {
      return Date.parse(patient.addedTm) < Date.parse(acc) ? patient : acc
    }
    return patient
  }, null)
  return oldest
}

function displayPatientView(data, chartOpenEvent) {
  const allData = { ...data, chartOpenEvent, addedTm: Date.now() }
  if (count < 5) {
    count = patientsStack.push(allData)
    addPatientView(allData)
  } else {
    const oldest = getOldest(patientsStack)
    const patient = oldest.chartOpenEvent.patient
    removePatientView(patient)
    displayPatientView(data, chartOpenEvent)
  }
}

function createButton({ chartOpenEvent = {} }) {
  var btn = document.createElement('button')
  btn.innerText = `${chartOpenEvent.patient.firstname} ${chartOpenEvent.patient.lastname}`
  btn.classList.add('nav-link')
  btn.id = 'patient-1-tab'
  btn.setAttribute('data-bs-toggle', 'tab')
  btn.setAttribute('data-bs-target', `#patient-${chartOpenEvent.patient.mrn}`)
  btn.type = 'button'
  btn.setAttribute('role', 'tab')
  btn.setAttribute('aria-controls', 'nav-profile')
  btn.setAttribute('aria-selected', 'false')
  return btn
}

function createWebView({ baseUrl, chartOpenEvent = {} }) {
  const parent = document.createElement('div')
  parent.classList.add('tab-pane', 'fade')
  parent.id = `patient-${chartOpenEvent.patient.mrn}`
  parent.setAttribute('role', 'tabpanel')
  parent.setAttribute('aria-labelledby', 'nav-profile-tab')

  const child = document.createElement('webview')
  child.id = `patient-${chartOpenEvent.patient.mrn}-renderer`
  child.classList.add('web-view')
  child.title = 'Patient'
  child.src = baseUrl

  parent.appendChild(child)
  return parent
}

function addPatientView(patient) {
  const btn = createButton(patient)
  const view = createWebView(patient)
  navigationBar.appendChild(btn)
  navigationTabContent.appendChild(view)
  patient.btn = btn
  patient.view = view
}

function init() {
  mainProcess.getProviderContext().then(data => {
    browserView.src = data.baseUrl
    getPatientContext()
  })
}
init()
