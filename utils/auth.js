const CryptoJS = require("crypto-js")
require("dotenv").config();

let key1 = process.env.SECRET_KEY;

const passDecrypt = (text) => {
  let bytes = CryptoJS.AES.decrypt(text,key1)
  let decrypted = bytes.toString(CryptoJS.enc.Utf8)
  return decrypted;
}

module.exports = {
  passDecrypt,
};

// node -e "const {encrypt,decrypt} = require('./utils/encrypt'); encrypt('12345678')"
// node -e "const {encrypt,decrypt} = require('./utils/encrypt'); decrypt('d175f16cb91e76987ed242ae0be5d309:e98e53fd5057de55:d4add4a6770b809c4c07afaf95a27c80')"