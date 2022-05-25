const chokidar = require('chokidar')
var parser = require('xml-js')
const { decryptFile } = require('./decryptionService')
const log = console.log.bind(console)

function EpicLoginFileListener(
  ecPath,
  ecAlgorithm,
  ecKey,
  EventFileEncryptionUsesIV,
) {
  const EpicLoginFileListener = {
    start: function () {
      console.log('Started')
      chokidar.watch(ecPath).on('add', this.onNewFile)
    },
    onNewFile: function (path) {
      log(`File ${path} has been added`)
      //DateTime lastWriteTime = File.GetCreationTime(e.FullPath);
      const raw = decryptFile(
        ecKey,
        ecAlgorithm,
        ecPath,
        EventFileEncryptionUsesIV,
      )
      var data = this.parseXML(raw)
      //var user = this.ParseAuthData(data.AuthenticationData, decryptor)
      //LoginInfoProvided.Invoke(new LoginInfo() { Username = user.Username, Password = user.Password });
      //      LastReadTime = lastWriteTime;
    },
    parseXML: function (raw) {
      console.log('me llama parser')
      var json = parser.xml2json(raw)
      console.log('to json ->', json)
      const root = json.EpicStudyData
      var eventVal = root.Event
      log(eventVal, 'eventVal')
    },
    parseAuthData: {},
  }
  return EpicLoginFileListener
}

// private (string Event, string AuthenticationData, string AuthInfo) ParseXML(string data)
// {
//     var xml = XDocument.Parse(data);
//     var root = xml.Element("EpicStudyData");
//     var eventVal = root.Element("Event").Value;
//     if (eventVal == "Login" || eventVal == "Logout")
//     {
//         string authData = root.Element("AuthenticationData").Value;
//         string authInfo = root.Element("AuthInfo").Value;
//         return (eventVal, authData, authInfo);
//     }
//     return (eventVal, string.Empty, string.Empty);
// }

module.exports = { EpicLoginFileListener }
