import { NextApiRequest, NextApiResponse } from 'next';
// import stream from 'stream';
import { IncomingForm } from 'formidable';
import Cors from 'cors';
import path from 'path';
import fs from 'fs';
import os from 'os';
import storage from '../../lib/googleapis';

const cors = Cors({
  methods: ['GET', 'POST', 'HEAD', 'OPTIONS'],
  origin: '*',
});

function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  fn: Function
) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);
    });
  });
}

const bucketName = process.env.GOOGLE_BUCKET_NAME || '';

const bucket = storage.bucket(bucketName);

async function uploadFile(filePath: string) {
  // const fileName = filePath.split('/')[filePath.split('/').length - 1]; // Get the file name only without its directories
  const uploadResponse = await bucket.upload(`${filePath}`, {
    // destination: `temp/${fileName}`,
    public: true,
  });

  return uploadResponse;
}

export type ApiExportResponse = {
  name: string | null;
  publicUrl: string;
}[];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiExportResponse>
) {
  await runMiddleware(req, res, cors);

  if (req.method !== 'POST') {
    throw new Error('Request method invalid');
  }

  // Create a temporary directory for storing the frames
  const tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'media-'));

  const form = new IncomingForm({
    uploadDir: tempDir,
    keepExtensions: true,
  });

  return form.parse(req, async (err, fields, files) => {
    const publicUrls: Array<{ name: string | null; publicUrl: string }> = [];

    // Loop over the files and upload them to GCS
    await Promise.all(
      Object.values(files).map(async (file) => {
        const f = Array.isArray(file) ? file[0] : file;
        const uploadResponse = await uploadFile(`${f.filepath}`);
        publicUrls.push({
          name: f.newFilename,
          publicUrl: `https://storage.googleapis.com/${bucketName}/${uploadResponse[1].name}`,
        });
      })
    );

    // Cleanup
    fs.rmSync(tempDir, { recursive: true });

    // Response
    res.status(200).json(publicUrls);
  });
}

export const config = {
  api: {
    bodyParser: false,
  },
};
