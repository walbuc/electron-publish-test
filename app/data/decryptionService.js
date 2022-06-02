const { Console } = require('console')
const crypto = require('crypto')
const Algorithm = 'aes-128-cbc'
const fs = require('fs')

function IsBase64String(str) {
  return Buffer.from(str, 'base64').toString('base64') === str
}

function algorithmSize(name) {
  switch (name) {
    case 'AES-128':
      return 128
    case 'AES-256':
      return 256
    default:
      throw new Error(`Algorithm of type ${name} is not supported.`)
  }
}
// TODOOOOOO
function deriveKey(plaintextKey, blockSize) {
  console.log('DERIVE')
}

function decryptionService(key, algorithmName, ecPath, usesIV = true) {
  // usesIV initialization vector
  console.log(`New file detected: ${ecPath}`)
  console.log(key, algorithmName, ecPath)

  const blockSize = algorithmSize(algorithmName)
  var keyBase64 = null

  if (IsBase64String(key)) {
    keyBase64 = Buffer.from(key, 'base64')
  } else {
    keyBase64 = deriveKey(key, blockSize)
  }

  const decryptor = {
    decrypt: function (text) {
      let iv = null
      let buffer = null
      if (usesIV) {
        var data = this.parseTextAndIV(text, blockSize)
        iv = Buffer.from(data.IV, 'base64')
        buffer = Buffer.from(data.Text, 'base64')
      } else {
        buffer = Buffer.from(text, 'base64')
      }
      return this.decryptData(keyBase64, iv, buffer)
    },

    parseTextAndIV: function (raw, blockSize) {
      const ivStringLength = this.numberOfCharactersToBase64(blockSize)
      console.log(ivStringLength, 'ivStringLength')
      const iv = raw.substring(0, ivStringLength)
      if (IsBase64String(iv)) {
        return { Text: raw.substring(ivStringLength), IV: iv }
      }
      return { Text: raw, IV: '' }
    },
    numberOfCharactersToBase64: function (blockSize) {
      // base64 takes 6 bits per character
      // 4 char each 3 bytes
      const num = (4 * (blockSize / 8)) / 3
      // missing to fill UTF8 size
      const padding = num % 4 == 0 ? 0 : 4 - (num % 4)
      return num + padding
    },
    decryptData: function (KeyBase64, iv, buffer) {
      const cipher = crypto.createDecipheriv('aes-128-cbc', KeyBase64, iv)
      var decrypted = cipher.update(buffer, 'base64', 'utf8')
      decrypted += cipher.final('utf8')
      console.log(decrypted)
      return decrypted
    },
  }

  let raw = fs.readFileSync(ecPath)

  return decryptor.decrypt(raw.toString())
}

module.exports = { decryptionService }
