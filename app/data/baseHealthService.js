const qs = require('qs')
const { client } = require('../utils/api-client')
const api = 'https://stage-fhir.insiteflow.com/'
const url = 'https://stage-fhir.insiteflow.com/connect/token'

// Test Data
// Facility ID: 2a25c31d-7d39-471e-89c4-dc78e766131a
// Secret: AVcF9Fqsu77jmgCa

// Test Patient Identifiers:
// 51506039
// 51505938

function BaseHealthServiceFactory(
  { facilityId, facilitySecret },
  notificationService,
) {
  const props = { token: null, clients: [], practitionerId: null }

  notificationService.on('login', data => {
    console.log(data, 'login emitter')
    props.practitionerId = data.practitionerId
  })

  const BaseHealthService = {
    connect: function () {
      var config = {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        data: qs.stringify({
          grant_type: 'client_credentials',
          client_id: facilityId,
          client_secret: facilitySecret,
          scope: 'facility-api',
        }),
      }
      return client('https://stage-fhir.insiteflow.com/connect/token', config)
        .then(function (data) {
          console.log(data, 'CONNECT')
          data?.access_token ? (props.token = data.access_token) : null
        })
        .catch(function (error) {
          console.error(error)
          throw new Error(error)
        })
    },
    fetchFacilityClients: function () {
      var config = { token: this.getToken() }
      client(
        `https://stage-fhir.insiteflow.com/api/v1/facility/${facilityId}/clients`,
        config,
      )
        .then((data = []) => {
          console.log(data, 'CLIENTS ARRAY / Only one by the moment')
          props.clients = data
        })
        .catch(function (error) {
          throw new Error(error)
        })
    },
    fetchProviderContexUrl: function () {
      // Only if login event triggered
      const clients = this.getFacilityClients()
      const practitionerId = this.getPractiotionerId()
      var data = { practitionerId }
      var config = { token: this.getToken(), data }

      return client(
        `https://stage-fhir.insiteflow.com/api/v1/facility/${facilityId}/clients/${clients[0].id}/authorize`,
        config,
      )
        .then(data => {
          console.log(data, 'PROVIDER CONTEXT AUTHORIZE')
          return data
        })
        .catch(function (error) {
          console.log(error)
          throw new Error(error)
        })
    },
    fetchPatientContextUrl({ patient }) {
      // if getPractiotionerId is not null
      const clients = this.getFacilityClients()
      const data = {
        practitionerId: this.getPractiotionerId(),
        patientId: patient.mrn,
      }
      console.log(data, 'basehealth. fetch patient context aca')
      var config = { token: this.getToken(), data }
      return client(
        `https://stage-fhir.insiteflow.com/api/v1/facility/${facilityId}/clients/${clients[0].id}/authorize`,
        config,
      )
        .then(data => {
          console.log(data, 'PATIENT CONTEXT CALL AUTHORIZE')
          return data
        })
        .catch(function (error) {
          console.log(error)
          throw new Error(error)
        })
    },
    getPractiotionerId() {
      return props.practitionerId
    },
    getToken: function () {
      return props.token
    },
    getFacilityClients: function () {
      return props.clients
    },
  }

  return BaseHealthService
}

module.exports = { BaseHealthServiceFactory }
