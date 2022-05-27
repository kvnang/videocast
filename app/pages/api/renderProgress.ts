// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { getRenderProgress } from '@remotion/lambda';
import type { NextApiRequest, NextApiResponse } from 'next';
import { convertS3toR2 } from '../../lib/cloudflare';

type Data = {
  isSettled: boolean;
  outputFile: string | null;
  overallProgress: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | string>
) {
  if (req.method !== 'GET') {
    res.status(500).json('Request method invalid');
    return;
  }

  const { query } = req;
  const { renderId, bucketName, functionName } = query;

  let isSettled = false;
  let outputFile = null;
  let overallProgress = 0;

  // while (!isSettled) {
  //   await new Promise((resolve) => setTimeout(resolve, 5000));
  try {
    const progress = await getRenderProgress({
      renderId: renderId as string,
      bucketName: bucketName as string,
      functionName: functionName as string,
      region: 'us-east-1',
    });
    overallProgress = progress.overallProgress;

    if (progress.done) {
      console.log('Render finished!', progress.outputFile);
      isSettled = true;
      outputFile = progress.outputFile
        ? convertS3toR2(progress.outputFile)
        : null;
    }

    if (progress.fatalErrorEncountered) {
      console.error('Error enountered', progress.errors);
      isSettled = true;
    }
  } catch (err) {
    res.status(200).json({ isSettled, outputFile, overallProgress });
    return;
  }
  // }

  res.status(200).json({ isSettled, outputFile, overallProgress });
}
