import { PassThrough } from 'node:stream';
import { createReadableStreamFromReadable } from '@react-router/node';
import { ServerRouter, type EntryContext } from 'react-router';
import { renderToString } from 'react-dom/server';
import { ServerStyleSheet } from 'styled-components';

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
) {
  return new Promise<Response>((resolve, reject) => {
    const sheet = new ServerStyleSheet();

    try {
      const markup = renderToString(
        sheet.collectStyles(<ServerRouter context={routerContext} url={request.url} />),
      );
      const document = markup.replace('</head>', `${sheet.getStyleTags()}</head>`);
      const body = new PassThrough();

      responseHeaders.set('Content-Type', 'text/html');
      resolve(new Response(createReadableStreamFromReadable(body), {
        headers: responseHeaders,
        status: responseStatusCode,
      }));
      body.end(document);
    } catch (error) {
      reject(error);
    } finally {
      sheet.seal();
    }
  });
}
