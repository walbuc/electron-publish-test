const { BrowserWindow } = require('electron')

function BadgeManagerFactory(
  contentWidth,
  contentHeight,
  collapsedContentWidth,
  DisplayWidth,
  DisplayHeight,
) {
  var badgeOptions = {
    frame: false,
    transparent: true,
    focusable: false,
    fullscreenable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    hasShadow: false,
    resizable: false,
    width: contentWidth,
    height: contentHeight,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
  }

  const badge = new BrowserWindow(badgeOptions)
  var size = badge.getSize()
  var windowWidth = size[0]
  badge.removeMenu()

  const ContentWidth = contentWidth
  const CollapsedContentWidth = collapsedContentWidth
  const ContentHeight = contentHeight
  const WindowWidth = windowWidth
  const Window = badge
  const BadgeCollapsedWindowWidth =
    WindowWidth - (ContentWidth - CollapsedContentWidth)
  const BorderWidth = WindowWidth - ContentWidth
  const PositionOff = DisplayWidth - WindowWidth + BorderWidth
  const CollapsedPositionOff =
    DisplayWidth - BadgeCollapsedWindowWidth + BorderWidth

  Window.setBounds({
    width: CollapsedContentWidth,
    height: ContentHeight,
    x: CollapsedPositionOff,
    y: DisplayHeight / 2 - ContentHeight,
  })

  const BadgeManager = {
    window: Window,
    toggleSize: function (hover) {
      if (hover) {
        Window.setBounds({
          width: ContentWidth,
          height: ContentHeight,
          x: PositionOff,
          y: DisplayHeight / 2 - ContentHeight,
        })
      } else {
        // Window.setBounds({
        //   width: CollapsedContentWidth,
        //   height: ContentHeight,
        //   x: CollapsedPositionOff,
        //   y: DisplayHeight / 2,
        // })
      }
    },
    quit: function () {
      this.window.close()
    },
    close: function() {
      this.window.hide()
    },
    open: function() {
      this.window.show()
    }


  }

  return BadgeManager
}

module.exports = { BadgeManagerFactory }
