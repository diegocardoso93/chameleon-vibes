import { UniversalHandler } from "@universal-middleware/core";
import crypto from "node:crypto";
import {
  delay,
  ErrorResponse,
  SuccessResponse,
  vibeCards,
  arrayBufferToHex,
  importKeyFromHex,
  encryptString,
  decryptString,
  ivAsArrayBuffer,
} from "../common";


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


// Prepare the buy transaction
export const beforeBuyHandler = (async (request, context, runtime: any): Promise<Response> => {
  console.log('beforeBuyHandler');
  const { AES_ECB_KEY } = runtime.env;
  const data = await request.json();
  const ecb_key = await importKeyFromHex(AES_ECB_KEY);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  console.log(ecb_key);
  const encryptedCardData = await encryptString(ecb_key, `${data.card_id},${data.acc_id}`, iv);
  console.log(encryptedCardData);
  return SuccessResponse.new({ encryptedCardData, iv });
}) satisfies UniversalHandler;


// Check transaction and update DB adding new card to user account
export const afterBuyHandler = (async (request, context, runtime: any): Promise<Response> => {
  console.log('afterBuyHandler');
  await delay(3000);

  let { encryptedCardData, iv } = await request.json();
  iv = ivAsArrayBuffer(iv);
  const { DB, HEDERA_NODE_API_URL, APP_PUB_KEY, AES_ECB_KEY } = runtime.env;
  const ecb_key = await importKeyFromHex(AES_ECB_KEY);
  const data = await decryptString(ecb_key, encryptedCardData, iv);
  const [card_id, accId] = data.split(',');

  const getAppAccountLastTransactions = async () => {
    try {
      // get the transaction from app account
      const resp = await fetch(`${HEDERA_NODE_API_URL}/api/v1/accounts/${APP_PUB_KEY}`, {
        method: 'GET',
        headers: {},
      });
      return (await resp.json() as any).transactions;
    } catch (e) {
      return await getAppAccountLastTransactions();
    }
  }

  const transactions = await getAppAccountLastTransactions();

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
