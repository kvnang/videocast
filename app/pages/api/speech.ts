import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import os from 'os';
import speech from '@google-cloud/speech';
import { IncomingForm } from 'formidable';

// TODO: clarify this type
export type SpeechResponse = any;

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

// async function getSampleResponse() {
//   await new Promise((resolve) => setTimeout(resolve, 5000));
//   return sampleResponse;
// }

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SpeechResponse | ErrorResponse>
) {
  // 1. Save audio file to OS temp folder
  const tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'stt-')); // stt: Speech-to-Text
  const form = new IncomingForm({
    uploadDir: tempDir,
    keepExtensions: true,
  });

  return new Promise((resolve, reject) => {
    // 2. Parse form & process audio
    form.parse(req, async (err, fields, files) => {
      // 2a. Get full path to the audio file
      const file = Object.values(files)[0]; // Make sure to select only 1 file
      const f = Array.isArray(file) ? file[0] : file;
      const fullPath = f.filepath;

      // 2b. Process audio file via Google Cloud Speech-to-Text
      const audio = {
        content: fs.readFileSync(fullPath).toString('base64'),
        // uri: 'gs://podcast-video-generator-audio/audio2.mp3',
      };

      const request = {
        config: {
          // encoding: 'MP3',
          sampleRateHertz: 16000,
          languageCode: 'en-US',
          enableWordTimeOffsets: true,
        },
        audio,
      };

      try {
        // const [response] = await client.recognize(request);
        const [operation] = await client.longRunningRecognize(request);
        res.status(200).json(operation);
        resolve(operation);
      } catch (error) {
        res.status(500).json({ errorMessage: 'Internal Server Error' });
        console.error(error);
        reject(error);
      } finally {
        // 2c. Cleanup temp folder
        fs.rmSync(tempDir, { recursive: true });
        console.log(`Temp dir cleanup: ${tempDir}`);
      }
    });
  });
}

export const config = {
  api: {
    bodyParser: false,
  },
};
