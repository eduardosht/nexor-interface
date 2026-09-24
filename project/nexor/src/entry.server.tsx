import { PassThrough } from 'node:stream';
import { createReadableStreamFromReadable } from '@react-router/node';
import { ServerRouter, type EntryContext } from 'react-router';
import { renderToPipeableStream } from 'react-dom/server';
import { ServerStyleSheet } from 'styled-components';

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
) {
  return new Promise<Response>((resolve, reject) => {
    const sheet = new ServerStyleSheet();
    const renderBody = new PassThrough();
    const chunks: string[] = [];

    renderBody.setEncoding('utf8');
    renderBody.on('data', (chunk: string) => chunks.push(chunk));
    renderBody.on('error', reject);
    renderBody.on('end', () => {
      try {
        const document = chunks.join('').replace('</head>', `${sheet.getStyleTags()}</head>`);
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

    const { pipe } = renderToPipeableStream(
      sheet.collectStyles(<ServerRouter context={routerContext} url={request.url} />),
      {
        onAllReady() {
          pipe(renderBody);
        },
        onShellError: reject,
      },
    );
  });
}
