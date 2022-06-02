const qs = require('qs')
const { client } = require('../utils/api-client')

const api = 'https://stage-fhir.insiteflow.com/'

const url = 'https://stage-fhir.insiteflow.com/connect/token'

function BaseHealthServiceFactory({ facilityId, facilitySecret }) {
  const props = { token: null, clients: [] }

  // subscribe

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
          console.log(data, 'CLIENTS')
          props.clients = data
        })
        .catch(function (error) {
          throw new Error(error)
        })
    },
    fetchProviderContexUrl: function () {
      // Only if login event
      const clients = this.getFacilityClients()
      // Hardcoded
      var data = { practitionerId: 'Testing' }
      var config = { token: this.getToken(), data }

      client(
        `https://stage-fhir.insiteflow.com/api/v1/${facilityId}/clients/${clients[0].id}/authorize`,
        config,
      )
        .then(data => {
          console.log(data, 'PROVIDER CONTEXT')
        })
        .catch(function (error) {
          throw new Error(error)
        })
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
