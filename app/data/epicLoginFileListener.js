const chokidar = require('chokidar')
var parser = require('xml-js')
const { decryptionService } = require('./decryptionService')
const {
  notificationMessage,
  notificationDetail,
  notification,
} = require('../notification/notification')
const log = console.log.bind(console)

// var fs = require('fs');
// var filePath = 'c:/book/discovery.docx';
// fs.unlinkSync(filePath);

function EpicLoginFileListener(
  ecPath,
  ecAlgorithm,
  ecKey,
  EventFileEncryptionUsesIV,
  notificationService,
  eventsOptions,
) {
  const EpicLoginFileListener = {
    start() {
      console.log('Started', ecPath)
      console.log('Started', this.onNewFile)
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
      // var msg = notificationMessage()
      // var notifications = []
      // notifications.push(
      //   notification({ type, patient: this.parsePatient(raw) }),
      // )
      // msg.message = JSON.stringify(notifications)
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
        case eventsOptions.patientOpen:
          msg.message = notification({ type, patient: this.parsePatient(raw) })
          notificationService.publish('PatientOpen', JSON.stringify(msg))
          break
        case eventsOptions.patientClose:
          msg.message = notification({ type, patient: this.parsePatient(raw) })
          notificationService.publish('PatientClose', JSON.stringify(msg))
          break
        default:
          break
      }
    },
    parsePatient(xmlData) {
      var result = notificationDetail()
      var parsedJson = parser.xml2json(xmlData, { compact: true, spaces: 4 })
      const xml = JSON.parse(parsedJson)
      var root = xml['EpicStudyData']

      var eventVal = root['Event']['_text']
      if (eventVal == 'PatientOpen') {
        result.mrn = root['PatientID']['_text']
        result.dob = root['PatientBirthDate']['_text']
        result.firstname = root['PatientName']['_text']
      }
      return result
    },
    parseXML: function (raw) {
      var parsedJson = parser.xml2json(raw, { compact: true, spaces: 4 })
      const xml = JSON.parse(parsedJson)
      var root = xml['EpicStudyData']

      var eventVal = root['Event']['_text']
      if (eventVal === 'Login' || eventVal === 'Logout') {
        var authData = root['AuthenticationData']['_text']
        var authInfo = root['AuthInfo']['_text']
        return {
          Event: eventVal,
          AuthenticationData: authData,
          AuthInfo: authInfo,
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
