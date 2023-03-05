import { Env } from './types';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,HEAD,OPTIONS,PUT,POST,DELETE',
  'Access-Control-Allow-Headers': '*',
};

export const patterns = {
  storage: /^\/storage\/(.*)\/?$/i,
  render: /^\/render\/(.*)\/?$/i,
  fonts: /^\/fonts\/(.*)\/?$/i,
};

export const hasValidHeader = (request: Request, env: Env) =>
  request.headers.get('X-Cf-Auth') === env.CF_AUTH_SECRET;

function handleOptions(request: Request) {
  if (
    request.headers.get('Origin') !== null &&
    request.headers.get('Access-Control-Request-Method') !== null &&
    request.headers.get('Access-Control-Request-Headers') !== null
  ) {
    // Handle CORS pre-flight request.
    return new Response(null, {
      headers: corsHeaders,
    });
  }
  // Handle standard OPTIONS request.
  return new Response(null, {
    headers: {
      Allow: 'GET, HEAD, POST, OPTIONS',
    },
  });
}

export const authorizeRequest = (request: Request, env: Env) => {
  switch (request.method) {
    case 'PUT':
    case 'DELETE':
      return hasValidHeader(request, env);
    case 'GET':
      return true;
    case 'OPTIONS':
      return handleOptions(request);
    default:
      return false;
  }
};
