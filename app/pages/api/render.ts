import { getFunctions, renderMediaOnLambda } from '@remotion/lambda';
import type { NextApiRequest, NextApiResponse } from 'next';
import { region, compositionId } from '../../lib/config';
import { absolutizeUrl } from '../../utils/helpers';

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

  const fileContent = await fetch(absolutizeUrl(`/remotion.json`)).then((r) =>
    r.text()
  );
  const { serveUrl, bucketName } = JSON.parse(fileContent);

  const inputProps = {
    styles,
    audio,
    audioDuration,
    image,
    words,
  };

  // console.time('getFunctions');
  const functions = await getFunctions({
    region,
    compatibleOnly: true,
  });
  // console.timeEnd('getFunctions');

  if (!functions.length) {
    throw new Error(
      'No (compatible) functions found. Please ensure that the function deployed has the same version, or redeploy a new one.'
    );
  }

  const { functionName } = functions[0];

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
