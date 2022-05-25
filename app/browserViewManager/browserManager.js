const { BrowserWindow } = require('electron')

function BrowserManagerFactory() {
  var Window = null
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
  Window = browser
  const BrowserManager = {
    show: function (url) {
      Window.loadURL(url)
      Window.maximize()
      Window.show()
    },
    close: function () {
      Window.hide()
    },
    quit: function () {
      Window.close()
    },
  }

  return BrowserManager
}

module.exports = { BrowserManagerFactory }
