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
  try {
    const rawPath = typeof event.path === 'string' ? event.path : '/';
    const normalizedEvent = {
      ...event,
      path: normalizeNetlifyPath(rawPath),
    };
    const fn = await getHandler();
    return await fn(normalizedEvent, context);
  } catch (err) {
    console.error('Netlify API function error:', err);
    return {
      statusCode: 500,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        error: err instanceof Error ? err.message : 'Internal server error',
      }),
    };
  }
}
