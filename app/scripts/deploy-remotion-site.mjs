import { deploySite, getOrCreateBucket } from '@remotion/lambda';
import path from 'node:path';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const region = 'us-east-1';

async function deploy() {
  const { bucketName } = await getOrCreateBucket({
    region,
  });

  const { serveUrl } = await deploySite({
    entryPoint: path.resolve(process.cwd(), './remotion/index'),
    bucketName,
    region,
    options: {
      onBundleProgress: (progress) => {
        // Progress is between 0 and 100
        // console.log(`Bundle progress: ${progress}%`);
      },
      onUploadProgress: ({
        totalFiles,
        filesUploaded,
        totalSize,
        sizeUploaded,
      }) => {
        // console.log(
        //   `Upload progress: Total files ${totalFiles}, Files uploaded ${filesUploaded}, Total size ${totalSize}, Size uploaded ${sizeUploaded}`
        // );
        // job.progress(10 + (filesUploaded / totalFiles) * 30);
        // job.update({
        //   message: `Uploading bundle ${filesUploaded} / ${totalFiles} files uploaded`,
        // });
      },
    },
  });

  fs.writeFileSync(
    './public/remotion.json',
    JSON.stringify({ bucketName, serveUrl })
  );
}

deploy();
