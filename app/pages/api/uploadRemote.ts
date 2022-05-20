// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { uploadFileToR2 } from '../../lib/cloudflare';
import { getFileName } from '../../utils/helpers';

type Data = {
  url?: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST') {
    res.status(500).json({ error: 'Request method invalid' });
    return;
  }

  const { url, fileName } = JSON.parse(req.body);

  if (!url) {
    res.status(500).json({ error: 'Request body does not contain url' });
    return;
  }

  // Fetch file into ArrayBuffer
  const arrayBuffer = await fetch(url).then((r) => r.arrayBuffer());

  // Upload to R2
  const remoteFile = await uploadFileToR2(
    arrayBuffer,
    fileName || getFileName(url, true) || Date.now()
  );
  res.status(200).json({ url: remoteFile });
}
