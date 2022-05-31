import { AwsClient } from 'aws4fetch';
import { Env } from '../types';
import { corsHeaders, patterns } from '../utils';

/**
 * Get file from S3 bucket and save it to R2
 */
async function getS3File(
  key: string,
  env: Env,
  ctx: EventContext<any, any, any>
) {
  // Initialize connection to S3
  // Signed request may not be necessary if the bucket is public
  const aws = new AwsClient({
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    service: 's3',
    region: 'us-east-1',
  });

  const s3hostname = `https://s3.us-east-1.amazonaws.com`;
  const signedRequest = await aws.sign(`${s3hostname}/${key}`);
  const s3Response = await fetch(signedRequest);

  if (!s3Response || s3Response.status === 404) {
    return { error: 'Object not found' };
  }

  const s3Body = s3Response.body?.tee();

  if (!s3Body) {
    return { error: 'Object body not found' };
  }

  // Save file to R2
  ctx.waitUntil(
    env.R2.put(key, s3Body[0], {
      httpMetadata: s3Response.headers,
    })
  );

  return { body: s3Body[1], response: s3Response };
}

/**
 * Handle requests to /storage route
 *
 * This provides a standard connection to R2
 */
export async function handleStorage(
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

      // If object is not available on R2, try fetching object from S3
      if (!object) {
        const { body, response, error } = await getS3File(key, env, ctx);

        if (error) {
          return new Response(error, { status: 404 });
        }

        return new Response(body, response);
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
