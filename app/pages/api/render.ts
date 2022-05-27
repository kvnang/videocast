import { renderMediaOnLambda } from '@remotion/lambda';
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

  const { styles, words, audio, audioDuration, image, outName } = body;

  const { serveUrl, bucketName, functionName } = await getRenderData();

  const inputProps = {
    styles,
    audio,
    audioDuration,
    image,
    words,
  };

  // console.time('renderMediaOnLambda');
  const { renderId } = await renderMediaOnLambda({
    region,
    functionName,
    serveUrl,
    composition: compositionId,
    inputProps,
    codec: 'h264-mkv',
    imageFormat: 'jpeg',
    maxRetries: 1,
    framesPerLambda: 20,
    privacy: 'public',
    quality: 100,
    outName,
  });
  // console.timeEnd('renderMediaOnLambda');

  res.status(200).json({ serveUrl, renderId, bucketName, functionName });
}
