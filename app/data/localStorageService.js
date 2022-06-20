const patientsLocalStorageKey = '__patients_stack__'
const authLocalStorageKey = '__auth_token__'

// Electron does not provide a api for local storage
// should use a  store for persisting the data

function LocalStorageFactory() {
  const props = { patientsStack: [] }
  const localStorageService = {
    getPatientsStack() {
      return props.patientsStack
    },
    setPatientsStack(patientsStack) {
      props.patientsStack = [...patientsStack]
    },
    async getToken() {
      return window.localStorage.getItem(authLocalStorageKey)
    },
    async setToken(token) {
      window.localStorage.setItem(authLocalStorageKey, token)
    },
    async logout() {
      window.localStorage.removeItem(authLocalStorageKey)
      window.localStorage.removeItem(patientsLocalStorageKey)
    },
  }
  return localStorageService
}

module.exports = { LocalStorageFactory }
