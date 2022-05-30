import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { font } = req.query;
  const json = await fetch(
    `${process.env.CF_WORKER_URL}/fonts/${font || ''}`
  ).then((r) => r.json());

  res.status(200).json(json);
}
