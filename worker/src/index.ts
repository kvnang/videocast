import { AwsClient } from 'aws4fetch';

interface Env {
  MY_BUCKET: R2Bucket;
  CF_AUTH_SECRET: string;
  RENDER_KV: KVNamespace;
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
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

async function handleStorage(
  request: Request,
  env: Env,
  ctx: EventContext<any, any, any>
) {
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
        // 1. Try fetching from S3

        // Signed request may not be necessary if the bucket is public
        const aws = new AwsClient({
          accessKeyId: env.AWS_ACCESS_KEY_ID,
          secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
          service: 's3',
          region: 'us-east-1',
        });

        const s3hostname = `https://s3.us-east-1.amazonaws.com`;

        const signedRequest = await aws.sign(`${s3hostname}/${objectName}`);
        const s3Object = await fetch(signedRequest);

        if (!s3Object || s3Object.status === 404) {
          return new Response('Object Not Found', { status: 404 });
        }

        const s3Body = s3Object.body?.tee();

        if (!s3Body) {
          return new Response('Object Not Found', { status: 404 });
        }

        ctx.waitUntil(
          env.MY_BUCKET.put(objectName, s3Body[0], {
            httpMetadata: s3Object.headers,
          })
        );

        return new Response(s3Body[1], s3Object);
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
  async fetch(request: Request, env: Env, ctx: EventContext<any, any, any>) {
    if (!authorizeRequest(request, env)) {
      return new Response('Forbidden', { status: 403 });
    }

    const url = new URL(request.url);
    const pathnames = unLeadingSlashIt(url.pathname).split('/');

    if (pathnames[0] === 'storage') {
      return handleStorage(request, env, ctx);
    }

    if (pathnames[0] === 'render') {
      return handleRender(request, env);
    }

    return new Response(`Pathname invalid: ${pathnames[0]}`, { status: 404 });
  },
};
