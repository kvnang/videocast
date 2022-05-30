import { AwsClient } from 'aws4fetch';
import { getFonts } from './fonts';
import { Env, FontProps } from './types';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE',
  'Access-Control-Allow-Headers': '*',
};

const patterns = {
  storage: /^\/storage\/(.*)\/?$/i,
  render: /^\/render\/(.*)\/?$/i,
  fonts: /^\/fonts\/(.*)\/?$/i,
};

const hasValidHeader = (request: Request, env: Env) =>
  request.headers.get('X-Cf-Auth') === env.CF_AUTH_SECRET;

function authorizeRequest(request: Request, env: Env) {
  switch (request.method) {
    case 'PUT':
    case 'DELETE':
      return hasValidHeader(request, env);
    case 'GET':
      return true;
    default:
      return false;
  }
}

async function handleStorage(
  request: Request,
  env: Env,
  ctx: EventContext<any, any, any>
) {
  const url = new URL(request.url);
  const key = patterns.storage.exec(url.pathname)?.[1];

  if (!key) {
    return new Response('Object not specified in the request', { status: 404 });
  }

  switch (request.method) {
    case 'PUT': {
      const object = await env.R2.put(key, request.body, {
        httpMetadata: request.headers,
      });
      return new Response(null, {
        headers: {
          etag: object.httpEtag,
        },
      });
    }
    case 'GET': {
      const object = await env.R2.get(key);

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
        const signedRequest = await aws.sign(`${s3hostname}/${key}`);
        const s3Object = await fetch(signedRequest);

        if (!s3Object || s3Object.status === 404) {
          return new Response('Object Not Found', { status: 404 });
        }

        const s3Body = s3Object.body?.tee();

        if (!s3Body) {
          return new Response('Object Not Found', { status: 404 });
        }

        ctx.waitUntil(
          env.R2.put(key, s3Body[0], {
            httpMetadata: s3Object.headers,
          })
        );

        return new Response(s3Body[1], s3Object);
      }
      return new Response(object.body, { headers: corsHeaders });
    }
    case 'DELETE':
      await env.R2.delete(key);
      return new Response('Deleted!', { status: 200 });

    default:
      return new Response('Method Not Allowed', { status: 405 });
  }
}

async function handleRender(request: Request, env: Env) {
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

async function handleFonts(request: Request, env: Env) {
  const url = new URL(request.url);
  const key = patterns.fonts.exec(url.pathname)?.[1];

  switch (request.method) {
    case 'GET': {
      const existingValue = await env.KV.get('fonts');

      if (!existingValue) {
        const newValue = await getFonts(env);
        await env.KV.put('fonts', JSON.stringify(newValue), {
          expirationTtl: 60 * 60 * 24 * 7, // expires in one week
        });
      }

      const fonts = await env.KV.get<FontProps[] | undefined>('fonts', 'json');

      if (!fonts?.length) {
        return new Response('Fonts Not Found', { status: 404 });
      }

      if (key) {
        // Get a specific font data
        const font = fonts?.find((f) => f.family === decodeURIComponent(key));

        if (!font) {
          return new Response('Font Not Found', { status: 404 });
        }

        return new Response(JSON.stringify(font), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        });
      }

      return new Response(JSON.stringify(fonts), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    }

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

    // handle /storage/:key path
    if (patterns.storage.test(url.pathname)) {
      return handleStorage(request, env, ctx);
    }

    // handle /render/:key path
    if (patterns.render.test(url.pathname)) {
      return handleRender(request, env);
    }

    // handle /fonts/:key path
    if (patterns.fonts.test(url.pathname)) {
      return handleFonts(request, env);
    }

    return new Response(`Pathname invalid: ${url.pathname}`, { status: 404 });
  },
};
