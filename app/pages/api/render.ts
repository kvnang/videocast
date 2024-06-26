import { renderMediaOnLambda } from '@remotion/lambda/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getRenderData } from '../../lib/cloudflare';
import { region, compositionId } from '../../lib/config';

type Data = {
  serveUrl?: string;
  renderId?: string;
  bucketName?: string;
  functionName?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | string>
) {
  if (req.method !== 'POST') {
    res.status(500).json('Request method invalid');
    return;
  }

  const { body } = req;

  const { styles, words, audio, audioDuration, image, outName, fontData } =
    body;

  const { serveUrl, bucketName, functionName } = await getRenderData();

  const inputProps = {
    styles,
    audio,
    audioDuration,
    image,
    words,
    fontData,
  };

  // console.time('renderMediaOnLambda');
  const { renderId } = await renderMediaOnLambda({
    region,
    functionName,
    serveUrl,
    composition: compositionId,
    inputProps,
    codec: 'h264',
    imageFormat: 'jpeg',
    maxRetries: 1,
    framesPerLambda: 20,
    privacy: 'public',
    jpegQuality: 100,
    outName,
    envVariables: {
      NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL || '',
    },
  });
  // console.timeEnd('renderMediaOnLambda');

  res.status(200).json({ serveUrl, renderId, bucketName, functionName });
}
