import CryptoJS from 'crypto-js';
import md5 from 'md5';

const KEY_SIZE = 256;
const IV_SIZE = 128;
const ITERATIONS = 100;

const encryptJson = (content: any, encryptPassword: string): string => {
  content.hash = md5(content.list);
  var msg = encrypt(JSON.stringify(content), encryptPassword);
  return msg;
};

const encrypt = (content: string, encryptPassword: string) => {
  const salt = CryptoJS.lib.WordArray.random(128 / 8);
  const key = CryptoJS.PBKDF2(encryptPassword, salt, {
    keySize: KEY_SIZE / 32,
    iterations: ITERATIONS,
  });

  const iv = CryptoJS.lib.WordArray.random(128 / 8);

  const encrypted = CryptoJS.AES.encrypt(content, key, {
    iv: iv,
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC,
  });
  // salt, iv will be hex 32 in length
  // append them to the ciphertext for use  in decryption
  const transitmessage = salt.toString() + iv.toString() + encrypted.toString();
  return transitmessage;
};

function decrypt(transitmessage: string, pass: string) {
  var salt = CryptoJS.enc.Hex.parse(transitmessage.substr(0, 32));
  var iv = CryptoJS.enc.Hex.parse(transitmessage.substr(32, 32));
  var encrypted = transitmessage.substring(64);

  var key = CryptoJS.PBKDF2(pass, salt, {
    keySize: KEY_SIZE / 32,
    iterations: ITERATIONS,
  });

  var decrypted = CryptoJS.AES.decrypt(encrypted, key, {
    iv: iv,
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC,
  });
  return decrypted;
}

const decryptToJson = (msg: string, pwd: string) => {
  try {
    const decrypted = decrypt(msg, pwd).toString(CryptoJS.enc.Utf8);
    console.log(decrypted);
    const decryptedJSON: any = JSON.parse(decrypted);
    console.log(decryptedJSON);
    if (
      decryptedJSON.hash != null &&
      decryptedJSON.hash == md5(decryptedJSON.list)
    )
      return decryptedJSON;
    else {
      return null;
    }
  } catch (e) {
    console.log(e);
    return null;
  }
};

const EncryptUtils = {encryptJson, encrypt, decryptToJson, decrypt};

export default EncryptUtils;