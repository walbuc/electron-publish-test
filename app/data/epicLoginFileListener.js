const chokidar = require('chokidar')
var parser = require('xml-js')
const { decryptionService } = require('./decryptionService')
const {
  notificationMessage,
  notificationDetail,
  notification,
} = require('../notification/notification')
const log = console.log.bind(console)

function removeFile() {
  // var fs = require('fs');
  // var filePath = 'c:/book/discovery.docx';
  // fs.unlinkSync(filePath);
}

function EpicLoginFileListener(
  ecPath,
  ecAlgorithm,
  ecKey,
  EventFileEncryptionUsesIV,
  notificationService,
  eventsOptions,
  baseHealthService,
) {
  const EpicLoginFileListener = {
    start() {
      console.log('Started', ecPath)
      chokidar.watch(`${ecPath}/**/*.xml`).on('add', path => {
        log(`File ${path} has been added`)
        //DateTime lastWriteTime = File.GetCreationTime(e.FullPath);
        const raw = decryptionService(
          ecKey,
          ecAlgorithm,
          path,
          EventFileEncryptionUsesIV,
        )
        var data = this.parseXML(raw)
        // LastReadTime = lastWriteTime;
        this.handleNotification(raw, data.Event)
      })
    },
    handleNotification(raw, type) {
      var msg = notificationMessage()
      switch (type) {
        case eventsOptions.login:
          var data = this.parseXML(raw)
          // check
          if (data.AuthenticationData) {
            var user = this.parseAuthData(data.AuthenticationData)
            this.listenerLoginInfoProvided(user)
          }
          msg.message = notification({ type, practitionerId: user.username })
          notificationService.publish('login', JSON.stringify(msg))
          break
        case eventsOptions.logout:
          var dataLogout = this.parseXML(raw)
          // check
          var username
          if (dataLogout.CurrentUser) {
            username = dataLogout.CurrentUser
          }
          console.log(this.listenerLoginInfoProvided.user)
          console.log('Processing logout for current user: ' + username)
          if (username) {
            this.listenerLoginInfoProvided({})
            msg.message = notification({
              type,
              practitionerId: username,
            })
            notificationService.publish('logout', JSON.stringify(msg))
          }
          msg.message = notification({
            type,
          })
          notificationService.publish('logout', JSON.stringify(msg))
          break
        case eventsOptions.patientOpen:
          if (baseHealthService.getClientPatientContext()) {
            msg.message = notification({
              type,
              patient: this.parsePatient(raw),
            })
            notificationService.publish('PatientOpen', JSON.stringify(msg))
          }
          break
        case eventsOptions.patientSwitch:
          if (baseHealthService.getClientPatientContext()) {
            console.log('Doing patient switch...')
            var patient = this.parsePatient(raw)
            if (patient.mrn) {
              console.log(
                'Patient switch with MRN: ' +
                  patient.mrn +
                  ' and name: ' +
                  patient.lastname,
              )
              msg.message = notification({
                type: eventsOptions.patientOpen,
                patient,
              })
              notificationService.publish('PatientOpen', JSON.stringify(msg))
            }
          }
          break
        case eventsOptions.patientClose:
          if (baseHealthService.getClientPatientContext()) {
            msg.message = notification({
              type,
              patient: this.parsePatient(raw),
            })
            notificationService.publish('PatientClose', JSON.stringify(msg))
          }
          break
        default:
          console.log('Unhandled event type: ' + type)
          break
      }
    },
    parsePatient(xmlData) {
      var result = notificationDetail()
      var parsedJson = parser.xml2json(xmlData, { compact: true, spaces: 4 })
      const xml = JSON.parse(parsedJson)
      var root = xml['EpicStudyData']

      var eventVal = root['Event']['_text']
      if (
        eventVal == 'PatientOpen' ||
        eventVal == 'PatientClose' ||
        (eventVal == 'PatientSwitch' && root['PatientID'])
      ) {
        result.mrn = root['PatientID']['_text']
        result.dob = root['PatientBirthDate']['_text']
        var nameParts = root['PatientName']['_text'].split(',')
        result.lastname = nameParts[0]
        result.firstname = nameParts.slice(1).join(' ')
      }
      return result
    },
    parseXML: function (raw) {
      var parsedJson = parser.xml2json(raw, { compact: true, spaces: 4 })
      const xml = JSON.parse(parsedJson)
      var root = xml['EpicStudyData']

      var eventVal = root['Event']['_text']
      if (eventVal === 'Login' || eventVal === 'Logout') {
        var authData, authInfo, currentUser
        if (root['AuthenticationData']) {
          authData = root['AuthenticationData']['_text']
        }
        if (root['AuthInfo']) {
          authInfo = root['AuthInfo']['_text']
        }
        if (root['CurrentUser']) {
          currentUser = root['CurrentUser']['UserID']
        }
        return {
          Event: eventVal,
          AuthenticationData: authData,
          AuthInfo: authInfo,
          CurrentUser: currentUser,
        }
      }
      return { Event: eventVal, AuthenticationData: '', AuthInfo: '' }
    },
    parseAuthData: function (authData) {
      var segments = null
      if (isBase64String(authData)) {
        // use the service
        //string decryptedAuthData = decryptor.Decrypt(authData);
        // segments = decryptedAuthData.Split('/')
      } else {
        segments = authData.split('/')
      }
      return { username: segments[1], password: segments[2] }
    },
  }
  return EpicLoginFileListener
}

function isBase64String(str) {
  return Buffer.from(str, 'base64').toString('base64') === str
}

module.exports = { EpicLoginFileListener }
