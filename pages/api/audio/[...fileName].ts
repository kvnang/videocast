import fs from 'fs';
import os from 'os';
import path from 'path';
import https from 'https';
// import { Storage } from '@google-cloud/storage';
import { NextApiRequest, NextApiResponse } from 'next';
import Cors from 'cors';

const cors = Cors({
  methods: ['GET', 'POST', 'HEAD', 'OPTIONS'],
  origin: '*',
});

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
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

const cache = new Map();

// Google Cloud Function to download file from GCS
// async function downloadRemoteFile(res: NextApiResponse, fileName: string) {
//   const cacheKey = {
//     fileName,
//   };

//   if (cache.get(JSON.stringify(cacheKey))) {
//     console.log('using cache', cache.get(JSON.stringify(cacheKey)));
//     return cache.get(JSON.stringify(cacheKey));
//   }

//   const bucketName = 'podcast-video-generator-audio';

//   if (!fileName) {
//     res.status(400);
//     res.json({ errorMessage: 'File name not provided' });
//     return;
//   }

//   // console.log(fileName);

//   // Create a temporary directory for storing the frames
//   const tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), `gcs-`));

//   // The path to which the file should be downloaded
//   const destFileName = `${tempDir}/${encodeURIComponent(fileName)}`;

//   // Creates a client
//   const storage = new Storage({
//     credentials: {
//       client_email: process.env.GOOGLE_CLIENT_EMAIL,
//       private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
//     },
//     projectId: process.env.GOOGLE_PROJECT_ID || '',
//   });

//   async function downloadFile() {
//     const options = {
//       destination: destFileName,
//     };

//     // Downloads the file
//     const dl = await storage
//       .bucket(bucketName)
//       .file(fileName)
//       .download(options);

//     console.log(
//       `gs://${bucketName}/${fileName} downloaded to ${destFileName}.`
//     );
//   }

//   await downloadFile().catch(console.error);

//   cache.set(JSON.stringify(cacheKey), destFileName);

//   return destFileName;
// }

const getFile = (url: string, dest: string) =>
  new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https
      .get(url, (response) => {
        const { statusCode } = response;
        if (statusCode === 200) {
          response.pipe(file);

          file.on('finish', () => {
            file.close();
            resolve(response);
          });
        }
      })
      .on('error', (err) => {
        reject(err);
      });
  });

async function downloadRemoteFile(res: NextApiResponse, fileName: string) {
  const cacheKey = {
    fileName,
  };

  // if (cache.get(JSON.stringify(cacheKey))) {
  //   console.log('using cache', cache.get(JSON.stringify(cacheKey)));
  //   return cache.get(JSON.stringify(cacheKey));
  // }

  if (!fileName) {
    res.status(400);
    res.json({ errorMessage: 'File name not provided' });
    return;
  }

  // Create a temporary directory for storing the frames
  const tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), `app-`));

  // The path to which the file should be downloaded
  const destFileName = `${tempDir}/${encodeURIComponent(fileName)}`;

  const dl = await getFile(fileName, destFileName);

  if (dl) {
    cache.set(JSON.stringify(cacheKey), destFileName);
    return destFileName;
  }

  throw new Error('Error downloading file');
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { range } = req.headers;

  let readStream;

  const sendFile = (file: string) => {
    const stat = fs.statSync(file);

    res.status(200);
    res.setHeader('Accept-Ranges', `bytes`);
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=0');

    if (typeof range !== 'undefined') {
      const parts = range.replace(/bytes=/, '').split('-');

      const partialStart = parts[0];
      const partialEnd = parts[1];

      if (
        (Number.isNaN(parseFloat(partialStart)) && partialStart.length > 1) ||
        (Number.isNaN(parseFloat(partialEnd)) && partialEnd.length > 1)
      ) {
        return res.status(500); // ERR_INCOMPLETE_CHUNKED_ENCODING
      }

      const start = parseInt(partialStart, 10);
      const end = partialEnd ? parseInt(partialEnd, 10) : stat.size - 1;
      const contentLength = end - start + 1;

      res.setHeader('Content-Length', contentLength);
      res.setHeader('Content-Range', `bytes ${start}-${end}/${stat.size}`);
      readStream = fs.createReadStream(file, { start, end });
    } else {
      res.setHeader('Content-Length', stat.size);
      readStream = fs.createReadStream(file);
    }

    readStream.pipe(res).on('close', () => {
      // TODO: Cleanup temp file
      res.end();
    });
  };

  // 1. Run Middleware
  await runMiddleware(req, res, cors);

  // 2. Get Remote File
  const remoteFile = req.query?.fileName
    ? decodeURIComponent(req.query.fileName.toString())
    : '';

  if (!remoteFile) {
    res.status(500);
    throw new Error('Remote file is not defined');
  }

  // 3. Download remote file to local
  const localFile = await downloadRemoteFile(res, remoteFile);

  // 4. Send
  if (localFile) {
    sendFile(localFile);
  } else {
    throw new Error('Unexpected error');
  }

  // res.status(200).json({ localFile: destFileName });
}
