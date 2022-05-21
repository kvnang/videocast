interface Env {
  MY_BUCKET: R2Bucket;
  CF_AUTH_SECRET: string;
  RENDER_KV: KVNamespace;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE',
  'Access-Control-Allow-Headers': '*',
};

const hasValidHeader = (request: Request, env: Env) =>
  request.headers.get('X-Cf-Auth') === env.CF_AUTH_SECRET;

function authorizeRequest(request: Request, env: Env) {
  switch (request.method) {
    case 'PUT':
    case 'DELETE':
      return hasValidHeader(request, env);
    case 'GET':
      // return ALLOW_LIST.includes(key);
      return true;
    default:
      return false;
  }
}

function unLeadingSlashIt(url: string) {
  return url.replace(/^\/+/, '');
}

async function handleStorage(request: Request, env: Env) {
  const url = new URL(request.url);
  const pathnames = unLeadingSlashIt(url.pathname).split('/');
  pathnames.shift();
  const objectName = pathnames.join('/');

  switch (request.method) {
    case 'PUT': {
      const object = await env.MY_BUCKET.put(objectName, request.body, {
        httpMetadata: request.headers,
      });
      return new Response(null, {
        headers: {
          etag: object.httpEtag,
        },
      });
    }
    case 'GET': {
      const object = await env.MY_BUCKET.get(objectName);

      if (!object) {
        return new Response('Object Not Found', { status: 404 });
      }

      return new Response(object.body, { headers: corsHeaders });
    }
    case 'DELETE':
      await env.MY_BUCKET.delete(objectName);
      return new Response('Deleted!', { status: 200 });

    default:
      return new Response('Method Not Allowed', { status: 405 });
  }
}

async function handleRender(request: Request, env: Env) {
  const url = new URL(request.url);
  const pathnames = unLeadingSlashIt(url.pathname).split('/');
  pathnames.shift();
  const key = pathnames.join('/');

  switch (request.method) {
    case 'PUT': {
      const contentType = request.headers.get('content-type') || '';

      if (!contentType.includes('application/json')) {
        return new Response('Invalid Content-Type', { status: 404 });
      }

      const { value, options } = await request.json();

      await env.RENDER_KV.put(key, value, options);

      return new Response(`${key} created!`, { status: 200 });
    }
    case 'GET': {
      const value = await env.RENDER_KV.get(key);

      if (!value) {
        return new Response('Value Not Found', { status: 404 });
      }

      return new Response(value, { headers: corsHeaders });
    }
    case 'DELETE':
      await env.RENDER_KV.delete(key);
      return new Response('Deleted!', { status: 200 });

    default:
      return new Response('Method Not Allowed', { status: 405 });
  }
}

export default {
  async fetch(request: Request, env: Env) {
    if (!authorizeRequest(request, env)) {
      return new Response('Forbidden', { status: 403 });
    }

    const url = new URL(request.url);
    const pathnames = unLeadingSlashIt(url.pathname).split('/');

    if (pathnames[0] === 'storage') {
      return handleStorage(request, env);
    }

    if (pathnames[0] === 'render') {
      return handleRender(request, env);
    }

    return new Response(`Pathname invalid: ${pathnames[0]}`, { status: 404 });
  },
};
