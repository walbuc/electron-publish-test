const {
  notificationMessage,
  notification,
} = require('../notification/notification')
const { client } = require('../utils/api-client')

function longPollingFactory(
  configOptions,
  notificationService,
  baseHealthService,
  eventsOptions,
) {
  const longPolling = {}
  longPolling.stopService = false

  longPolling.start = function () {
    if (configOptions.isCernerIntegrationEnabled) {
      this.main()
    }
  }
  longPolling.end = function () {
    this.stopService = true
  }
  longPolling.parseResponse = function (data) {
    const m = data.message ? JSON.parse(data.message) : null
    if (m) {
      const notificationMessageArray = m.map(n => {
        console.log('PARSING RESPONSE', n)
        return {
          notificationMessage: notificationMessage({
            message: notification({
              practitionerId: n.PractitionerId,
              deviceId: n.DeviceId,
              type: n.Type,
              patient: n.Patient
                ? {
                    mrn: n.Patient.Mrn,
                    lastname: n.Patient.Lastname,
                    firstname: n.Patient.Firstname,
                    dob: n.Patient.Dob,
                  }
                : {},
            }),
          }),
          type: n.Type,
        }
      })

      return notificationMessageArray
    }
    return []
  }
  longPolling.handleNotification = function (data) {
    const notificationMessageArray = this.parseResponse(data)
    notificationMessageArray.forEach(({ notificationMessage, type }) => {
      switch (type) {
        case eventsOptions.login:
          notificationService.publish(
            'login',
            JSON.stringify(notificationMessage),
          )
          break
        case eventsOptions.logout:
          notificationService.publish(
            'logout',
            JSON.stringify(notificationMessage),
          )
          break
        case eventsOptions.patientOpen:
          baseHealthService.getClientPatientContext() &&
            notificationService.publish(
              'PatientOpen',
              JSON.stringify(notificationMessage),
            )
          break
        case eventsOptions.patientClose:
          baseHealthService.getClientPatientContext() &&
            notificationService.publish(
              'PatientClose',
              JSON.stringify(notificationMessage),
            )
          break
        default:
          break
      }
    })
  }

  longPolling.main = async function () {
    while (true && !this.stopService) {
      var hadErr = false
      const token = baseHealthService.getToken()
      console.log('requesting...')
      var data = {}
      var config = { token, data, timeout: 50000 }
      console.log(
        `facility/${configOptions.facilityId}/${configOptions.deviceId}/listen`,
        'listening',
      )
      await client(
        `facility/${configOptions.facilityId}/${configOptions.deviceId}/listen`,
        config,
      )
        .then(data => {
          this.handleNotification(data)
        })
        .catch(function (error) {
          if (error.code !== 'ECONNABORTED') {
            hadErr = true
            throw new Error(error)
          }
        })

      if (hadErr) {
        break
      }
    }
  }

  return longPolling
}

module.exports = { longPollingFactory }
