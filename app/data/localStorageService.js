const patientsLocalStorageKey = '__patients_stack__'
const authLocalStorageKey = '__auth_token__'

function LocalStorageFactory() {
  const localStorageService = {
    getPatientsStack() {
      return window.localStorage.getItem(patientsLocalStorageKey)
    },
    setPatienStack(patientsStack) {
      window.localStorage.setItem(patientsLocalStorageKey, patientsStack)
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
