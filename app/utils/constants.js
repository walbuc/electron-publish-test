const epicOptions = {
  login: 'Login',
  patientOpen: 'PatientOpen',
  patientClose: 'PatientClose',
  patientSwitch: 'PatientSwitch',
  logout: 'Logout',
}

const cernerOptions = {
  login: 'Login',
  patientOpen: 'chart-open',
  patientClose: 'chart-close',
  patientSwitch: 'chart-switch',
  logout: 'logout',
}

const appEvents = {
  login: 'login',
  logout: 'logout',
  patientOpen: 'patient-open',
  patientClose: 'patient-close',
}

function getEventsOptions(integration) {
  const isEpic = integration === 'epic'

  return {
    login: isEpic ? epicOptions.login : cernerOptions.login,
    patientOpen: isEpic ? epicOptions.patientOpen : cernerOptions.patientOpen,
    patientClose: isEpic
      ? epicOptions.patientClose
      : cernerOptions.patientClose,
    logout: isEpic ? epicOptions.logout : cernerOptions.logout,
    patientSwitch: isEpic ? epicOptions.patientSwitch : cernerOptions.patientSwitch
  }
}

const CERNER_INTEGRATION = 'cerner'
const EPIC_INTEGRATION = 'epic'
const AES_128 = 'AES-128'
const AES_256 = 'AES-256'

function isNotMac() {
  return process.platform !== 'darwin'
}

module.exports = {
  epicOptions,
  cernerOptions,
  getEventsOptions,
  appEvents,
  CERNER_INTEGRATION,
  EPIC_INTEGRATION,
  AES_128,
  AES_256,
  isNotMac,
}
