import { Env } from '../types';
import { corsHeaders, patterns } from '../utils';

/**
 * Handle requests to /render route
 *
 * This provides a standard connection to KV
 */
export async function handleRender(request: Request, env: Env) {
  const url = new URL(request.url);
  const key = patterns.render.exec(url.pathname)?.[1];

  if (!key) {
    return new Response('Key not specified in the request', { status: 404 });
  }

  switch (request.method) {
    case 'PUT': {
      const contentType = request.headers.get('content-type') || '';

      if (!contentType.includes('application/json')) {
        return new Response('Invalid Content-Type', { status: 404 });
      }

      const { value, options } = await request.json();

      await env.KV.put(key, value, options);

      return new Response(`${key} created!`, { status: 200 });
    }
    case 'GET': {
      const value = await env.KV.get(key);

      if (!value) {
        return new Response('Value Not Found', { status: 404 });
      }

      return new Response(value, { headers: corsHeaders });
    }
    case 'DELETE':
      await env.KV.delete(key);
      return new Response('Deleted!', { status: 200 });

    default:
      return new Response('Method Not Allowed', { status: 405 });
  }
}
