const patientKey = '__patients_stack__'
const authKey = '__auth_token__'
const { Level } = require('level')

function LevelFactory(dbname) {
  const db = new Level(dbname, { valueEncoding: 'json' })
  db.put(patientKey, [])

  const levelService = {
    async getPatientsStack() {
      return db.get(patientKey)
    },
    async setPatientsStack(patientsStack) {
      return db.put(patientKey, patientsStack)
    },
    async getToken() {
      return db.get(authKey)
    },
    async setToken(token) {
      return db.put(authKey, token)
    },
    async logout() {
      await db.batch([
        {
          type: 'del',

          key: authKey,
        },
        {
          type: 'del',

          key: patientKey,
        },
      ])
    },
  }
  return levelService
}

module.exports = { LevelFactory }
