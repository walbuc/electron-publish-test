const chokidar = require('chokidar')
var parser = require('xml-js')
const { decryptionService } = require('./decryptionService')
const log = console.log.bind(console)

function EpicLoginFileListener(
  ecPath,
  ecAlgorithm,
  ecKey,
  EventFileEncryptionUsesIV,
) {
  const EpicLoginFileListener = {
    start: function () {
      console.log('Started', ecPath)
      console.log('Started', this.onNewFile)
      chokidar.watch(`${ecPath}/**/*.xml`).on('add', this.onNewFile)
    },
    onNewFile: path => {
      log(`File ${path} has been added`)
      //DateTime lastWriteTime = File.GetCreationTime(e.FullPath);
      const raw = decryptionService(
        ecKey,
        ecAlgorithm,
        path,
        EventFileEncryptionUsesIV,
      )
      var data = EpicLoginFileListener.parseXML(raw)
      var user = EpicLoginFileListener.parseAuthData(data.AuthenticationData)
      console.log(user, 'user')
      // LoginInfoProvided.Invoke(new LoginInfo() { Username = user.Username, Password = user.Password });
      // LastReadTime = lastWriteTime;
      //listenerloginInfoProvided.
    },
    parseXML: function (raw) {
      var parsedJson = parser.xml2json(raw, { compact: true, spaces: 4 })
      const xml = JSON.parse(parsedJson)
      var root = xml['EpicStudyData']
      console.log(root, 'eee')
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
