import serverless from 'serverless-http';
import { createApp } from '../../server.ts';

let cachedHandler: ReturnType<typeof serverless> | null = null;

async function getHandler() {
  if (!cachedHandler) {
    const app = await createApp({ serverless: true });
    cachedHandler = serverless(app, {
      binary: ['image/*', 'video/*', 'application/octet-stream'],
    });
  }
  return cachedHandler;
}

function normalizeNetlifyPath(rawPath: string): string {
  const pathOnly = rawPath || '/';
  if (pathOnly.startsWith('/.netlify/functions/api')) {
    const stripped = pathOnly.slice('/.netlify/functions/api'.length) || '/';
    if (stripped.startsWith('/uploads/') || stripped === '/uploads') {
      return stripped;
    }
    if (stripped.startsWith('/api/') || stripped === '/api') {
      return stripped;
    }
    if (stripped === '/') {
      return '/api/health';
    }
    return `/api${stripped.startsWith('/') ? stripped : `/${stripped}`}`;
  }
  return pathOnly;
}

export async function handler(
  event: Record<string, unknown>,
  context: Record<string, unknown>
) {
  const rawPath = typeof event.path === 'string' ? event.path : '/';
  const normalizedEvent = {
    ...event,
    path: normalizeNetlifyPath(rawPath),
  };
  const fn = await getHandler();
  return fn(normalizedEvent, context);
}
