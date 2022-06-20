const epicOptions = {
  login: 'Login',
  patientOpen: 'PatientOpen',
  patientClose: 'PatientClose',
}

const cernerOptions = {
  login: 'Login',
  patientOpen: 'chart-open',
  patientClose: 'chart-close',
}

const appEvents = {
  login: 'login',
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
  }
}

const CERNER_INTEGRATION = 'cerner'
const EPIC_INTEGRATION = 'epic'

module.exports = {
  epicOptions,
  cernerOptions,
  getEventsOptions,
  appEvents,
  CERNER_INTEGRATION,
  EPIC_INTEGRATION,
}
