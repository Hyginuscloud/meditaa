import { createApp } from './_server.mjs';

export const config = {
  api: {
    bodyParser: false,
  },
};

let cachedAppPromise = null;

function getApp() {
  if (!cachedAppPromise) {
    cachedAppPromise = createApp({ serverless: true }).catch((err) => {
      cachedAppPromise = null;
      throw err;
    });
  }
  return cachedAppPromise;
}

export default async function handler(req, res) {
  try {
    const app = await getApp();
    await new Promise((resolve, reject) => {
      const cleanup = () => {
        res.off('finish', onDone);
        res.off('close', onDone);
        res.off('error', onError);
      };
      const onDone = () => {
        cleanup();
        resolve();
      };
      const onError = (err) => {
        cleanup();
        reject(err);
      };
      res.once('finish', onDone);
      res.once('close', onDone);
      res.once('error', onError);
      app(req, res);
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
