import { NextApiRequest, NextApiResponse } from 'next';
import { CF_WORKER_URL } from '../../../lib/config';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { font } = req.query;
  const json = await fetch(`${CF_WORKER_URL}/fonts/${font || ''}`).then((r) =>
    r.json()
  );

  res.status(200).json(json);
}
