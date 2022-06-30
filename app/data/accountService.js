const { EpicAccountService } = require('./epicAccountService')
const { EpicLoginFileListener } = require('./epicLoginFileListener')

function AccountServiceFactory(
  options,
  notificationService,
  eventOptions,
  baseHealthService,
) {
  switch (options.integration) {
    case 'epic':
      return EpicAccountService(
        EpicLoginFileListener(
          options.ecPath,
          options.ecAlgorithm,
          options.ecKey,
          options.EventFileEncryptionUsesIV,
          notificationService,
          eventOptions,
          baseHealthService,
        ),
      )
    case 'cerner':
      break
    default:
      throw new Error('Not valid integration value')
  }
}

module.exports = { AccountServiceFactory }
