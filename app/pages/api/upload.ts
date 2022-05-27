import { NextApiRequest, NextApiResponse } from 'next';
// import stream from 'stream';
import { IncomingForm } from 'formidable';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { uploadFileToR2 } from '../../lib/cloudflare';
import { getFileName } from '../../utils/helpers';

async function uploadFile(filePath: string) {
  const fileName = getFileName(filePath, true); // Get the file name only without its directories
  const buffer = fs.readFileSync(filePath);
  const arrayBuffer = Uint8Array.from(buffer).buffer;

  const remoteFile = await uploadFileToR2(arrayBuffer, fileName);
  return remoteFile;
}

export type ApiExportResponse = {
  name: string | null;
  publicUrl: string;
}[];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiExportResponse>
) {
  if (req.method !== 'POST') {
    throw new Error('Request method invalid');
  }

  // Create a temporary directory for storing the frames
  const tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'media-'));

  const form = new IncomingForm({
    uploadDir: tempDir,
    keepExtensions: true,
  });

  const urls = await new Promise<{ name: string | null; publicUrl: string }[]>(
    (resolve) => {
      form.parse(req, async (err, fields, files) => {
        const publicUrls: { name: string | null; publicUrl: string }[] = [];

        // Loop over the files and upload them to GCS
        await Promise.all(
          Object.values(files).map(async (file) => {
            const f = Array.isArray(file) ? file[0] : file;
            const uploadUrl = await uploadFile(`${f.filepath}`);
            if (uploadUrl) {
              publicUrls.push({
                name: f.newFilename,
                publicUrl: uploadUrl,
              });
            }
          })
        );

        // Cleanup
        fs.rmSync(tempDir, { recursive: true });

        resolve(publicUrls);
      });
    }
  );

  res.status(200).json(urls);
}

export const config = {
  api: {
    bodyParser: false,
  },
};
