import { UniversalHandler } from "@universal-middleware/core";
import { renderPage } from "vike/server";
import vibeCards from "../common/vibeCards";
import { SuccessResponse } from "../common";

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
  const accId = request.url.replace(/.*\?accId=/, '');

  const resp = await fetch(`https://testnet.mirrornode.hedera.com/api/v1/accounts/0.0.5234801`, {
    method: 'GET',
    headers: {},
  });
  const { transactions } = await resp.json();

  // '0.0.5234806'
  const cardIds = transactions
    .filter(t => t.transfers.some(ts => ts.account == accId && ts.amount <= -100000000))
    .map(t => JSON.parse(atob(t.memo_base64)))
    .map(t => t.card_id);
  console.log(cardIds);
  const cards = vibeCards.filter(vc => cardIds.includes(''+vc.id));
  console.log({cards});

  return SuccessResponse.new({ cards });
}) satisfies UniversalHandler;
