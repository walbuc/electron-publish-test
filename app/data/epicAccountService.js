function EpicAccountService(listener) {
  const user = { username: '', password: '' }
  const EpicAccountService = {
    login: function () {
      //not implemented
    },
    logout: function () {
      //not implemented
    },
    listenerLoginInfoProvided: function (info) {
      user.username = info.username
      user.password = info.password
    },
  }
  listener.listenerLoginInfoProvided =
    EpicAccountService.listenerLoginInfoProvided
  listener.start()
  return EpicAccountService
}

module.exports = { EpicAccountService }
