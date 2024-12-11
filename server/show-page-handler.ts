import { UniversalHandler } from "@universal-middleware/core";
import { renderPage } from "vike/server";
import { vibeCards } from "../common";


export const showHandler = (async (request, context, runtime: any): Promise<Response> => {
  console.log('showHandler');
  const DB = runtime.env.DB;

  const [, id, accId] = request.url.match(/.*\?id=(\d+)&accId=(.*)/) || [];
  const exists = JSON.parse(await DB.get(accId) || '[]').some(c => c == id);
  let pageData;
  if (exists) {
    pageData = {vibeCard: vibeCards.find(v => v.id == +id)};
  }

  const pageContextInit = { ...context, urlOriginal: request.url, ...runtime, pageData };

  const pageContext = await renderPage(pageContextInit);
  const response = pageContext.httpResponse;

  const { readable, writable } = new TransformStream();

  response?.pipe(writable);

  return new Response(readable, {
    status: response?.statusCode,
    headers: response?.headers,
  });
}) satisfies UniversalHandler;
