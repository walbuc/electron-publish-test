const remote = require('@electron/remote')
const { ipcRenderer } = require('electron')
const mainProcess = remote.require('./main')
const app = remote.app
const currentWindow = remote.getCurrentWindow()
const browserView = document.querySelector('#view-renderer')
const navigationBar = document.querySelector('#nav-tab')
const navigationTabContent = document.querySelector('#nav-tabContent')
const refreshButton = document.querySelector('#webview-refresh')
const backButton = document.querySelector('#webview-back')
const forwardButton = document.querySelector('#webview-forward')

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

ipcRenderer.on('PatientOpen', patientOpen)
ipcRenderer.on('PatientClose', patientClose)

function patientClose(event, data) {
  const { patient } = data
  removePatientView(patient)
}

async function patientOpen(event, data) {
  displayPatientView(data)
}

function removePatientView(patient) {
  removeNodes(patient.mrn)
  const patientsStack = ipcRenderer
    .sendSync('lss:getPatientsStack')
    .filter(p => p.chartOpenEvent.patient.mrn !== patient.mrn)
  count = patientsStack.length
  ipcRenderer.sendSync('lss:setPatientsStack', patientsStack)
}

function removeNodes(mrn) {
  const patient = ipcRenderer
    .sendSync('lss:getPatientsStack')
    .find(p => p.chartOpenEvent.patient.mrn === mrn)

  const btn = document.querySelector(`#${patient.btn}`)
  const view = document.querySelector(`#${patient.view}`)
  btn.remove()
  view.remove()
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

function displayPatientView(patientData) {
  if (count < 5) {
    const newPatient = addPatientView({ ...patientData })
    const patiensStack = [
      ...ipcRenderer.sendSync('lss:getPatientsStack'),
      { ...newPatient },
    ]
    count = patiensStack.length
    ipcRenderer.sendSync('lss:setPatientsStack', [...patiensStack])
  } else {
    const oldest = getOldest(ipcRenderer.sendSync('lss:getPatientsStack'))
    const patient = oldest.chartOpenEvent.patient

    removePatientView(patient)
    displayPatientView(patientData)
  }
}

function createButton({ chartOpenEvent = {} }) {
  var btn = document.createElement('button')
  btn.innerText = `${chartOpenEvent.patient.firstname} ${chartOpenEvent.patient.lastname}`
  btn.classList.add('nav-link')
  btn.id = `patient-${chartOpenEvent.patient.mrn}-tab`
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
  const newPatient = { ...patient, btn: btn.id, view: view.id }
  return newPatient
}

function init() {
  mainProcess.getProviderContext().then(data => {
    browserView.src = data.baseUrl
  })
  loadPatients()
}
init()

function loadPatients() {
  const patients = ipcRenderer.sendSync('lss:getPatientsStack')
  patients.forEach(p => addPatientView(p))
}
