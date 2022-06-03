const { BrowserWindow } = require('electron')

function BrowserManagerFactory() {
  var window = null
  //TODO: icon
  const browserOptions = {
    focusable: true,
    alwaysOnTop: false,
    skipTaskbar: false,
    webPreferences: {
      webviewTag: true,
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },

    //TitleBarStyle : TitleBarStyle.hidden | TitleBarStyle.hiddenInset,
    show: false, //,
    //Icon : "..\\wwwroot\\images\\cropped-InsiteFlow_logo1-192x192.png"
  }

  var browser = new BrowserWindow(browserOptions)
  browser.removeMenu()

  window = browser
  const BrowserManager = {
    window,
    show: function (url) {
      this.window.loadFile(url)
      this.window.maximize()
      this.window.show()
    },
    close: function () {
      this.window.hide()
    },
    quit: function () {
      this.window.close()
    },
  }

  return BrowserManager
}

module.exports = { BrowserManagerFactory }
