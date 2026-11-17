import type { IncomingMessage, ServerResponse } from 'node:http';
import { createApp } from '../server.ts';

export const config = {
  api: {
    bodyParser: false,
  },
};

const appPromise = createApp();

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const app = await appPromise;
  return app(req as Parameters<typeof app>[0], res as Parameters<typeof app>[1]);
}
