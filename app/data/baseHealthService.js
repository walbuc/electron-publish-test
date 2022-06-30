const qs = require('qs')
const { client } = require('../utils/api-client')

function BaseHealthServiceFactory(
  { facilityId, facilitySecret },
  notificationService,
) {
  const props = { token: null, clients: [], practitionerId: null }

  notificationService.on('login', data => {
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
      return client('connect/token', config)
        .then(function (data) {
          console.log(data, 'CONNECT')
          data?.access_token ? (props.token = data.access_token) : null
        })
        .catch(function (error) {
          throw new Error(error)
        })
    },
    fetchFacilityClients: function () {
      var config = { token: this.getToken() }
      client(`facility/${facilityId}/clients`, config)
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
        `facility/${facilityId}/clients/${clients[0].id}/authorize`,
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
      const practitionerId = this.getPractiotionerId()
      if (practitionerId) {
        const clients = this.getFacilityClients()
        const data = {
          practitionerId: this.getPractiotionerId(),
          patientId: patient.mrn,
        }
        var config = { token: this.getToken(), data }
        return client(
          `facility/${facilityId}/clients/${clients[0].id}/authorize`,
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
      } else {
        throw new Error('Missing practioner Id')
      }
    },
    revoke({ patient } = {}) {
      const practitionerId = this.getPractiotionerId()
      if (practitionerId) {
        const clients = this.getFacilityClients()
        var data = {
          practitionerId: this.getPractiotionerId(),
        }
        if (patient) {
          data = { ...data, patientId: patient.mrn }
        }

        var config = { token: this.getToken(), data }
        return client(
          `facility/${facilityId}/clients/${clients[0].id}/revoke`,
          config,
        )
          .then(data => {
            console.log(data, 'REVOKE CONTEXT CALL')
            return data
          })
          .catch(function (error) {
            console.log(error)
            throw new Error(error)
          })
      } else {
        throw new Error('Missing practioner Id')
      }
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
