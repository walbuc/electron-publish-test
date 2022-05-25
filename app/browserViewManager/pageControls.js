const { BadgeManagerFactory } = require('./badgeManager')
const { BrowserManagerFactory } = require('./browserManager')

PageManagerFactory.DisplayWidth = 0
PageManagerFactory.DisplayHeight = 0

PageManagerFactory.Badge = null
PageManagerFactory.Browser = null

function PageManagerFactory() {
  const BadgeContentWidth = 130
  const BadgeCollapsedContentWidth = 38
  const BadgeContentHeight = 40

  const pageManager = {
    createBadge: function () {
      PageManagerFactory.Badge = BadgeManagerFactory(
        BadgeContentWidth,
        BadgeContentHeight,
        BadgeCollapsedContentWidth,
        PageManagerFactory.DisplayWidth,
        PageManagerFactory.DisplayHeight,
      )
    },
    createBrowser: function () {
      PageManagerFactory.Browser = BrowserManagerFactory()
    },
    quit: function () {
      if (!PageManagerFactory.Badge || !PageManagerFactory.Browser) {
        return
      }
      PageManagerFactory.Browser.quit()
      PageManagerFactory.Badge.quit()
      //close app
    },
  }

  return pageManager
}

module.exports = { PageManagerFactory }
