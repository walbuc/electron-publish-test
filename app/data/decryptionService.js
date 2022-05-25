const crypto = require('crypto')
const Algorithm = 'aes-128-ecb'
const fs = require('fs')

function decryptFile(eckey, ecAlgorithm, ecPath, EncryptionUsesIV) {
  console.log('New file detected: {e.FullPath}')
  console.log(eckey, ecAlgorithm, ecPath)

  let raw = fs.readFileSync(ecPath)

  const cipher = crypto.createDecipheriv(
    ecAlgorithm,
    Buffer.from(eckey, 'utf8'),
    Buffer.alloc(0),
  )

  //   if (!raw.StartsWith("<?xml", StringComparison.OrdinalIgnoreCase))
  //                     {
  //                         Logger.LogInformation($"File: {e.FullPath} is encrypted.");

  //                         raw = decryptor.Decrypt(raw);
  //                     }
  raw = Buffer.concat([cipher.update(raw), cipher.final()])
}

// const KEY = Buffer.from("0123456789ABDCEF", "utf8");

// encryptFile(KEY, "node-input.txt", "node-output.txt");
// decryptFile(KEY, "node-output.txt", "node-decrypted.txt");

//private static string[] ValidEventFileEncryptionTypeOptions = new string[] { "AES-128", "AES-256" };

module.exports = { decryptFile }
