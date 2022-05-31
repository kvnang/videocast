import { Env } from './types';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE',
  'Access-Control-Allow-Headers': '*',
};

export const patterns = {
  storage: /^\/storage\/(.*)\/?$/i,
  render: /^\/render\/(.*)\/?$/i,
  fonts: /^\/fonts\/(.*)\/?$/i,
};

export const hasValidHeader = (request: Request, env: Env) =>
  request.headers.get('X-Cf-Auth') === env.CF_AUTH_SECRET;

export const authorizeRequest = (request: Request, env: Env) => {
  switch (request.method) {
    case 'PUT':
    case 'DELETE':
      return hasValidHeader(request, env);
    case 'GET':
      return true;
    default:
      return false;
  }
};
