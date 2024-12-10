import { UniversalHandler } from "@universal-middleware/core";
import { renderPage } from "vike/server";
import { delay, ErrorResponse, SuccessResponse } from "../common";
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
  const { DB } = runtime.env.DB;

  const accId = request.url.replace(/.*\?accId=/, '');
  const cards = JSON.parse(DB.get(accId));

  return SuccessResponse.new({ cards });
}) satisfies UniversalHandler;


// Function to generate a symmetric key AES-ECB (should be one time generated and configured to AES_ECB_KEY env)
export const generateKeyHandler = (async (request, context, runtime: any): Promise<Response> => {
  console.log('generateKeyHandler');

  const key = await crypto.subtle.generateKey(
    {
      name: 'AES-ECB',
      length: 128, // AES-128
    },
    true, // extractable
    ['encrypt', 'decrypt'] // allowed operations
  );

  return SuccessResponse.new({ key });
}) satisfies UniversalHandler;


// prepare the buy transaction
export const beforeBuyHandler = (async (request, context, runtime: any): Promise<Response> => {
  console.log('beforeBuyHandler');
  const { AES_ECB_KEY } = runtime.env;
  const data = request.json();
  const encryptedCardData = encryptJson(AES_ECB_KEY, { card_id: data.card_id, acc_id: data.acc_id });
  return SuccessResponse.new({ encryptedCardData });
}) satisfies UniversalHandler;


export const afterBuyHandler = (async (request, context, runtime: any): Promise<Response> => {
  console.log('afterBuyHandler');
  await delay(2500);

  const { DB, HEDERA_NODE_API_URL, APP_PUB_KEY, AES_ECB_KEY } = runtime.env;
  const data = decryptJson(AES_ECB_KEY, request.json());
  const accId = data.acc_id;

  // get the transaction from app account
  const resp = await fetch(`${HEDERA_NODE_API_URL}/api/v1/accounts/${APP_PUB_KEY}`, {
    method: 'GET',
    headers: {},
  });
  const { transactions } = await resp.json();

  const txdata = transactions
    .find(t => t.transfers.some(ts => ts.account == accId && ts.amount <= -100000000));
  const cardId = decryptJson(AES_ECB_KEY, JSON.parse(atob(txdata.memo_base64))).card_id;
  console.log(cardId);

  if (cardId == data.card_id) {
    const cards = JSON.parse(DB.get(accId));
    cards.push(cardId);
    await DB.put(accId, JSON.stringify(cards));
    return SuccessResponse.new({ cardId });
  }

  return ErrorResponse.new('Integrity violated.');
}) satisfies UniversalHandler;


async function encryptJson(key, jsonData) {
  const jsonString = JSON.stringify(jsonData);

  const encoder = new TextEncoder();
  const data = encoder.encode(jsonString);

  const encryptedData = await crypto.subtle.encrypt(
    {
      name: 'AES-ECB',
    },
    key,
    data,
  );

  return {
    data: btoa(String.fromCharCode(...new Uint8Array(encryptedData)))
  }
}

async function decryptJson(key, encryptedData) {
  const dataBuffer = new Uint8Array(atob(encryptedData.data).split('').map(char => char.charCodeAt(0)));

  const decryptedData = await crypto.subtle.decrypt(
    {
      name: 'AES-ECB',
    },
    key,
    dataBuffer,
  );

  const decoder = new TextDecoder();
  const decodedString = decoder.decode(decryptedData);

  return JSON.parse(decodedString);
}

function btoa(str) {
  return Buffer.from(str, 'utf-8').toString('base64');
}

function atob(base64Str) {
  return Buffer.from(base64Str, 'base64').toString('utf-8');
}
