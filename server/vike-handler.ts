import { UniversalHandler } from "@universal-middleware/core";
import { renderPage } from "vike/server";


export const vikeHandler = (async (request, context, runtime: any): Promise<Response> => {
  console.log('vikehandler');

  const pageContextInit = {
    ...context,
    urlOriginal: request.url,
    ...runtime,
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
