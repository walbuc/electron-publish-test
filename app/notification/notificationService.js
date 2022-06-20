const EventEmitter = require('events').EventEmitter

function NotificationServiceFactory(config, client) {
  const props = { notifications: [] }
  const emitter = new EventEmitter()
  emitter.fetch = function () {}
  emitter.fetchInitial = function () {}
  emitter.getLocalSessionNotifications = function () {
    return props.notifications
  }

  emitter.publish = function (channel, data) {
    console.log(channel, data, 'PUBLISH NOTIFICATION')
    if (data) {
      const msg = JSON.parse(data)
      if (msg.message) {
        //const content = msg.message ? JSON.parse(msg.message) : null
        const content = msg.message ?? null
        props.notifications.push(content)

        return emitter.emit(channel, content)
      }
      return emitter
    }

    return emitter
  }
  return emitter
}
module.exports = { NotificationServiceFactory }
