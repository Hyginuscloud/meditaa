import type { IncomingMessage, ServerResponse } from 'node:http';
import type express from 'express';
import { createApp } from '../server.ts';

export const config = {
  api: {
    bodyParser: false,
  },
};

let cachedAppPromise: Promise<express.Express> | null = null;

function getApp(): Promise<express.Express> {
  if (!cachedAppPromise) {
    cachedAppPromise = createApp({ serverless: true }).catch((err) => {
      cachedAppPromise = null;
      throw err;
    });
  }
  return cachedAppPromise;
}

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  try {
    const app = await getApp();
    await new Promise<void>((resolve, reject) => {
      const cleanup = () => {
        res.off('finish', onDone);
        res.off('close', onDone);
        res.off('error', onError);
      };
      const onDone = () => {
        cleanup();
        resolve();
      };
      const onError = (err: Error) => {
        cleanup();
        reject(err);
      };
      res.once('finish', onDone);
      res.once('close', onDone);
      res.once('error', onError);
      app(req as Parameters<typeof app>[0], res as Parameters<typeof app>[1]);
    });
  } catch (err) {
    console.error('Vercel API handler error:', err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(
        JSON.stringify({
          error: err instanceof Error ? err.message : 'Internal server error',
        })
      );
    } else if (!res.writableEnded) {
      res.end();
    }
  }
}
