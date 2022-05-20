interface Env {
  MY_BUCKET: R2Bucket;
  CF_AUTH_SECRET: string;
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

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);
    const objectName = url.pathname.slice(1);

    if (!authorizeRequest(request, env)) {
      return new Response('Forbidden', { status: 403 });
    }

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
  },
};
