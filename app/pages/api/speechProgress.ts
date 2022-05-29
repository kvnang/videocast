import type { NextApiRequest, NextApiResponse } from 'next';
import speech, { SpeechClient } from '@google-cloud/speech';

export type SpeechProgressResponse = Awaited<
  ReturnType<SpeechClient['checkLongRunningRecognizeProgress']>
>;

interface ErrorResponse {
  errorMessage: string;
}

// Init a client
const client = new speech.SpeechClient({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SpeechProgressResponse | ErrorResponse>
) {
  const { query } = req;
  const { operationName } = query;

  if (!operationName) {
    throw new Error('Missing operationName');
  }

  const operation = await client.checkLongRunningRecognizeProgress(
    operationName as string
  );

  res.status(200).json(operation);
}
