import '../html/css/site.css'
const path = require('path')
const { ipcRenderer, shell } = require('electron')
const remote = require('@electron/remote')
var mainProcess = remote.require('../main')

const currentWindow = remote.getCurrentWindow()

const badgeView = document.querySelector('#artifact-badge')
const closeButtonView = document.querySelector('#context-menu')

var Counter = 0
var NotificationCounter = 0

var ShowBrowser = false

var HideBadge = Counter == 0 ? 'hidden' : ''

var CounterText = Counter == 1 ? 'Query' : 'Queries'

var ContextMenuClosed = true

//var ContextMenuToggle = () => (ContextMenuClosed ? 'closed' : '')

var MouseHover = false
//var BadgeToggle = () => (MouseHover ? 'expanded' : '')
var pendingQueue = []

// new code

let showNotificationHistory = false
const toggleClass = showNotificationHistory =>
  showNotificationHistory ? '' : 'hidden'

badgeView.addEventListener('mouseover', e => {
  badgeHover(e)
})

badgeView.addEventListener('mouseleave', e => {
  badgeHoverLeave(e)
})

badgeView.addEventListener('click', e => {
  badgeHoverLeave()
  ToggleBrowser(e)
})

badgeView.addEventListener('contextmenu', e => {
  contextMenuOpen(e)
})

closeButtonView.addEventListener('click', e => {
  closeApplication(e)
})

function badgeHover() {
  if (!MouseHover) {
    badgeView.classList.add('expanded')
    MouseHover = true
    if (!mainProcess.PageManagerFactory.Badge) {
      return
    }
    mainProcess.PageManagerFactory.Badge.toggleSize(MouseHover)
  }
}

function badgeHoverLeave() {
  if (ContextMenuClosed) {
    MouseHover = false
    badgeView.classList.remove('expanded')
    if (!mainProcess.PageManagerFactory.Badge) {
      return
    }
    mainProcess.PageManagerFactory.Badge.toggleSize(MouseHover)
  }
}

function contextMenuOpen() {
  if (ContextMenuClosed) {
    closeButtonView.classList.remove('closed')
  } else {
    closeButtonView.classList.add('closed')
  }
  ContextMenuClosed = !ContextMenuClosed
}

function ToggleBrowser() {
  if (!ContextMenuClosed) {
    contextMenuOpen()
  }

  if (!mainProcess.PageManagerFactory.Browser) {
    return
  }

  // check if we have practitioner id to
  // TO DO
  badgeView.classList.add('hidden')
  mainProcess.showBrowser()
}

ipcRenderer.on('browser-close', toggleBadge)

function toggleBadge() {
  badgeView.classList.remove('hidden')
}

function closeApplication() {
  mainProcess.pageManager.quit()
}
