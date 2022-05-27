export async function uploadFileToR2(body: ArrayBuffer, fileName?: string) {
  if (!process.env.CF_WORKER_URL) {
    throw new Error('Cloudflare Worker URL is not defined');
  }

  if (!process.env.CF_AUTH_SECRET) {
    throw new Error('Cloudflare Worker authentication failed');
  }

  const uploadResponse = await fetch(
    `${process.env.CF_WORKER_URL}/storage/${fileName || Date.now()}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/octet-stream',
        'X-Cf-Auth': process.env.CF_AUTH_SECRET || '',
      },
      body,
    }
  );

  if (uploadResponse.ok) {
    return `${process.env.CF_WORKER_URL}/storage/${fileName}`;
  }

  throw new Error('Uncaught error');
}

export async function getRenderData() {
  const res = await fetch(`${process.env.CF_WORKER_URL}/render/renderData`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Cf-Auth': process.env.CF_AUTH_SECRET || '',
    },
  });

  const raw = await res.text();
  const json = JSON.parse(raw);

  return json;
}

export function convertS3toR2(url: string) {
  if (!process.env.CF_WORKER_URL) {
    console.error('Cloudflare Worker URL is not defined');
    return url;
  }

  return url.replace(
    'https://s3.us-east-1.amazonaws.com',
    `${process.env.CF_WORKER_URL}/storage`
  );
}
