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

    // handle /storage/:key route
    if (patterns.storage.test(url.pathname)) {
      return handleStorage(request, env, ctx);
    }

    // handle /render/:key route
    if (patterns.render.test(url.pathname)) {
      return handleRender(request, env);
    }

    // handle /fonts/:key route
    if (patterns.fonts.test(url.pathname)) {
      return handleFonts(request, env);
    }

    return new Response(`Path not recognized: ${url.pathname}`, {
      status: 404,
    });
  },
};
