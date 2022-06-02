const path = require('path')
const { ipcRenderer, shell } = require('electron')

const remote = require('@electron/remote')
const mainProcess = remote.require('./main')

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

badgeView.addEventListener('mouseover', e => {
  badgeHover(e)
})

badgeView.addEventListener('mouseleave', e => {
  badgeHoverLeave(e)
})

badgeView.addEventListener('click', e => {
  ToggleBrowser(e)
})

badgeView.addEventListener('contextmenu', e => {
  contextMenuOpen(e)
})

closeButtonView.addEventListener('click', e => {
  console.log('me llama close')
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
  // constants
  // what
  //const baseUrl = NavManager.BaseUri
  //const fullUrl = `${baseUrl}Browser`

  if (!ContextMenuClosed) {
    contextMenuOpen()
  }

  if (!mainProcess.PageManagerFactory.Browser) {
    return
  }

  // check if we have practitioner id to
  //
  mainProcess.ShowBrowser()
}

function closeApplication() {
  mainProcess.pageManager.quit()
}

// protected override Task OnInitializedAsync()
// {
//     int queryCount = ArtifactHealthService.GetQueryCount();
//     Counter = queryCount;

//     var timer = new System.Timers.Timer(20000);
//     timer.Elapsed += async (s, e) =>
//     {
//         int queryCount = ArtifactHealthService.GetQueryCount();
//         Counter = queryCount;
//         await InvokeAsync(StateHasChanged);
//     };
//     timer.Start();
//     return base.OnInitializedAsync();
// }
