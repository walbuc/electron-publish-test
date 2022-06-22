const { BrowserWindow } = require('electron')
const path = require('path')

function BrowserManagerFactory(DisplayWidth, DisplayHeight) {
  var window = null
  const WindowWidth = Math.floor(DisplayWidth * 0.66)
  const WindowHeight = Math.floor(DisplayHeight * 0.66)
  //TODO: icon
  const browserOptions = {
    focusable: true,
    alwaysOnTop: true,
    skipTaskbar: false,
    width: WindowWidth,
    height: WindowHeight,
    title: 'Health Gorilla',
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
  const PositionOffX = DisplayWidth - WindowWidth

  window = browser
  const BrowserManager = {
    window,
    isDisplayed: false,
    show: function (url) {
      this.window.loadFile(url)
      this.window.setBounds({
        x: PositionOffX,
        y: DisplayHeight - WindowHeight - 50,
      })
      this.window.show()
      this.isDisplayed = true
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
