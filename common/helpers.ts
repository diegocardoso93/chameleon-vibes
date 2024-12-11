export class ErrorResponse {
  static new(message: string) {
    return new Response(JSON.stringify({ message, error: true }), {
      status: 400,
      headers: {"content-type": "application/json"},
    });
  }
}

export class SuccessResponse {
  static new(data: {}) {
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {"content-type": "application/json"},
    });
  }
}

export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const APP_PUB_KEY = '0.0.5234801';

export function arrayBufferToHex(arrayBuffer: ArrayBuffer) {
  const byteArray = new Uint8Array(arrayBuffer);
  return Array.from(byteArray).map(byte => byte.toString(16).padStart(2, '0')).join('');
}

export function hexStringToUint8Array(hexString: string) {
  const cleanedHexString = hexString.replace(/\s+/g, '').toLowerCase();
  const byteArray = new Uint8Array(cleanedHexString.length / 2);
  for (let i = 0; i < cleanedHexString.length; i += 2) {
      byteArray[i / 2] = parseInt(cleanedHexString.substr(i, 2), 16);
  }
  return byteArray;
}

export function ivAsArrayBuffer(obj: Object) {
  const byteArray = Object.values(obj);

  const arrayBuffer = new ArrayBuffer(byteArray.length);
  const uint8Array = new Uint8Array(arrayBuffer);
  uint8Array.set(byteArray);

  return arrayBuffer;
}

export async function importKeyFromHex(hexString: string, algorithm = 'AES-GCM') {
  const keyData = hexStringToUint8Array(hexString);

  // Import the raw key as a CryptoKey
  const cryptoKey = await crypto.subtle.importKey(
      'raw',              // The format of the key (raw binary data)
      keyData,            // The key data as a Uint8Array
      { name: algorithm }, // The algorithm to be used (e.g., AES-GCM)
      false,              // Whether the key can be exported
      ['encrypt', 'decrypt'] // Allowed key usages
  );

  return cryptoKey;
}

export async function encryptString(key: CryptoKey, jsonString: string, iv: ArrayBuffer) {
  const encoder = new TextEncoder();
  const data = encoder.encode(jsonString);

  const encryptedData = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    data,
  );

  return btoa(String.fromCharCode(...new Uint8Array(encryptedData)));
}

export async function decryptString(key: CryptoKey, encryptedData: string, iv: AraryBuffer) {
  const dataBuffer = new Uint8Array(atob(encryptedData).split('').map(char => char.charCodeAt(0)));

  const decryptedData = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    dataBuffer,
  );

  const decoder = new TextDecoder();
  const decodedString = decoder.decode(decryptedData);

  return decodedString;
}

export function btoa(str: string) {
  return Buffer.from(str, 'utf-8').toString('base64');
}

export function atob(base64Str: string) {
  return Buffer.from(base64Str, 'base64').toString('utf-8');
}
