import * as CryptoJS from 'crypto-js';

export function encrypt(token: string, secret: string): string {
  return CryptoJS.AES.encrypt(token, secret).toString();
}

export function decrypt(token: string, secret: string): string {
  const bytes = CryptoJS.AES.decrypt(token, secret);
  return bytes.toString(CryptoJS.enc.Utf8);
}
