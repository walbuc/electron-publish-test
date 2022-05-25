function EpicAccountService(listener) {
  console.log(listener, 'listener')
  listener.start()

  const EpicAccountService = {
    login: function () {
      //not implemented
    },
    logout: function () {
      //not implemented
    },
    user: { name: '', password: '' },
    listenerloginInfoProvided: function (info) {
      this.user.username = info.username
      this.user.password = info.password
    },
  }

  return EpicAccountService
}

module.exports = { EpicAccountService }
