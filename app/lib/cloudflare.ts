export async function uploadFileToR2(body: ArrayBuffer, fileName?: string) {
  if (!process.env.CF_WORKER_URL) {
    throw new Error('Cloudflare Worker URL is not defined');
  }

  if (!process.env.CF_AUTH_SECRET) {
    throw new Error('Cloudflare Worker authentication failed');
  }

  const uploadResponse = await fetch(
    `${process.env.CF_WORKER_URL}/${fileName || Date.now()}`,
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
    return `${process.env.CF_WORKER_URL}/${fileName}`;
  }

  throw new Error('Uncaught error');
}
