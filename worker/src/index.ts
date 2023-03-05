import { handleFonts } from './handlers/fonts';
import { handleRender } from './handlers/render';
import { handleStorage } from './handlers/storage';
import { Env } from './types';
import { authorizeRequest, patterns } from './utils';

export default {
  async fetch(request: Request, env: Env, ctx: EventContext<any, any, any>) {
    if (!authorizeRequest(request, env)) {
      return new Response('Forbidden', { status: 403 });
    }

    const url = new URL(request.url);

    // handle /render/:key route
    // Don't cache this route
    if (patterns.render.test(url.pathname)) {
      return handleRender(request, env);
    }

    // Construct the cache key from the URL
    let response: Response | undefined;
    const cacheKey = new Request(url.toString(), request);
    const cache = caches.default;

    if (request.method === 'GET') {
      response = await cache.match(cacheKey);

      if (response) {
        console.log('Cache hit for', url.pathname);
        return response;
      }
    }

    // handle /storage/:key route
    if (patterns.storage.test(url.pathname)) {
      response = await handleStorage(request, env, ctx);
    }

    // handle /fonts/:key route
    if (patterns.fonts.test(url.pathname)) {
      response = await handleFonts(request, env);
    }

    if (!response) {
      return new Response(`Path not recognized: ${url.pathname}`, {
        status: 404,
      });
    }

    if (request.method === 'GET') {
      ctx.waitUntil(cache.put(cacheKey, response.clone()));
    }

    return response;
  },
};
