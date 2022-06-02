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
  // what
  // browser.onClose += Browser_OnClose;
  // private static void Browser_OnClose()
  //     {
  //         Create().ContinueWith(async (x) =>
  //         {
  //             PageManager.Browser = await x;
  //         });
  //     }
  window = browser
  const BrowserManager = {
    window,
    show: function (url) {
      // Window.loadURL(url)
      //load file??

      window.maximize()
      window.show()
    },
    close: function () {
      window.hide()
    },
    quit: function () {
      window.close()
    },
  }

  return BrowserManager
}

module.exports = { BrowserManagerFactory }
