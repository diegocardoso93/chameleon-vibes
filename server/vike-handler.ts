import { UniversalHandler } from "@universal-middleware/core";
import { renderPage } from "vike/server";
import { delay, ErrorResponse, SuccessResponse, vibeCards } from "../common";
import crypto from "node:crypto";

export const vikeHandler = (async (request, context, runtime: any): Promise<Response> => {
  console.log('vikehandler');

  // const accId = request.url.replace(/.*\?accId=/, '');

  // const resp = await fetch(`https://testnet.mirrornode.hedera.com/api/v1/accounts/0.0.5234801`, {
  //   method: 'GET',
  //   headers: {},
  // });
  // const { transactions } = await resp.json();

  // // '0.0.5234806'
  // const cardIds = transactions
  //   .filter(t => t.transfers.some(ts => ts.account == accId && ts.amount <= -100000000))
  //   .map(t => JSON.parse(atob(t.memo_base64)))
  //   .map(t => t.card_id);
  // console.log(cardIds);
  // const cards = vibeCards.filter(vc => cardIds.includes(''+vc.id));
  // console.log({cards});

  const pageContextInit = {
    ...context,
    urlOriginal: request.url,
    ...runtime,
    // pageData: { cards },
  };

  const pageContext = await renderPage(pageContextInit);
  const response = pageContext.httpResponse;

  const { readable, writable } = new TransformStream();

  response?.pipe(writable);

  return new Response(readable, {
    status: response?.statusCode,
    headers: response?.headers,
  });
}) satisfies UniversalHandler;


export const listVibeCardsHandler = (async (request, context, runtime: any): Promise<Response> => {
  console.log('listVibeCardsHandler');
  const { DB } = runtime.env;

  const accId = request.url.replace(/.*\?accId=/, '');
  const cardIds = JSON.parse(await DB.get(accId) || '[]');
  console.log({cardIds, accId});
  const cards = vibeCards.filter(v => cardIds.includes(''+v.id));

  return SuccessResponse.new({ cards });
}) satisfies UniversalHandler;


// Function to generate a symmetric key AES-ECB (should be one time generated and configured to AES_ECB_KEY env)
export const generateKeyHandler = (async (request, context, runtime: any): Promise<Response> => {
  console.log('generateKeyHandler');
  const key = await crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"],
  );
  const exportedKey = await crypto.subtle.exportKey('raw', key);
  const hexKey = arrayBufferToHex(exportedKey);

  return SuccessResponse.new({ key: hexKey });
}) satisfies UniversalHandler;

// prepare the buy transaction
export const beforeBuyHandler = (async (request, context, runtime: any): Promise<Response> => {
  console.log('beforeBuyHandler');
  const { AES_ECB_KEY } = runtime.env;
  const data = await request.json();
  console.log({AES_ECB_KEY, data});
  const ecb_key = await importKeyFromHex(AES_ECB_KEY);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  console.log(ecb_key);
  const encryptedCardData = await encryptString(ecb_key, `${data.card_id},${data.acc_id}`, iv);
  console.log(encryptedCardData);
  return SuccessResponse.new({ encryptedCardData, iv });
}) satisfies UniversalHandler;


export const afterBuyHandler = (async (request, context, runtime: any): Promise<Response> => {
  console.log('afterBuyHandler');
  await delay(2000);

  let { encryptedCardData, iv } = await request.json();
  iv = ivAsArrayBuffer(iv);
  const { DB, HEDERA_NODE_API_URL, APP_PUB_KEY, AES_ECB_KEY } = runtime.env;
  const ecb_key = await importKeyFromHex(AES_ECB_KEY);
  const data = await decryptString(ecb_key, encryptedCardData, iv);
  const [card_id, accId] = data.split(',');

  // get the transaction from app account
  const resp = await fetch(`${HEDERA_NODE_API_URL}/api/v1/accounts/${APP_PUB_KEY}`, {
    method: 'GET',
    headers: {},
  });
  const { transactions } = await resp.json();

  const txdata = transactions
    .find(t => t.transfers.some(ts => ts.account == accId && ts.amount <= -100000000));
  const [cardId, ] = (await decryptString(ecb_key, atob(txdata.memo_base64), iv)).split(',');
  console.log(cardId);

  if (cardId == card_id) {
    const cards = JSON.parse(await DB.get(accId) || '[]');
    cards.push(cardId);
    await DB.put(accId, JSON.stringify(cards));
    return SuccessResponse.new({ cardId });
  }

  return ErrorResponse.new('Integrity violated.');
}) satisfies UniversalHandler;


function arrayBufferToHex(arrayBuffer) {
  const byteArray = new Uint8Array(arrayBuffer);
  return Array.from(byteArray).map(byte => byte.toString(16).padStart(2, '0')).join('');
}

function hexStringToUint8Array(hexString) {
  const cleanedHexString = hexString.replace(/\s+/g, '').toLowerCase();
  const byteArray = new Uint8Array(cleanedHexString.length / 2);
  for (let i = 0; i < cleanedHexString.length; i += 2) {
      byteArray[i / 2] = parseInt(cleanedHexString.substr(i, 2), 16);
  }
  return byteArray;
}

function ivAsArrayBuffer(obj) {
  const byteArray = Object.values(obj);

  const arrayBuffer = new ArrayBuffer(byteArray.length);
  const uint8Array = new Uint8Array(arrayBuffer);
  uint8Array.set(byteArray);

  console.log({arrayBuffer});
  return arrayBuffer;
}

async function importKeyFromHex(hexString, algorithm = 'AES-GCM') {
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

async function encryptString(key, jsonString, iv) {
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

async function decryptString(key, encryptedData, iv) {
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

function btoa(str) {
  return Buffer.from(str, 'utf-8').toString('base64');
}

function atob(base64Str) {
  return Buffer.from(base64Str, 'base64').toString('utf-8');
}
