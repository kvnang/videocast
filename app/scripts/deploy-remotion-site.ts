import {
  AwsRegion,
  deleteFunction,
  deleteSite,
  deployFunction,
  deploySite,
  getFunctions,
  getOrCreateBucket,
  getSites,
} from '@remotion/lambda';
import path from 'node:path';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const region: AwsRegion = 'us-east-1';

async function saveRenderData({
  bucketName,
  serveUrl,
  functionName,
}: {
  bucketName: string;
  serveUrl: string;
  functionName: string;
}) {
  console.log('Saving bucketName and serveUrl to KV');

  if (!process.env.CF_WORKER_URL) {
    throw new Error('Cloudflare Worker URL is not defined');
  }

  if (!process.env.CF_AUTH_SECRET) {
    throw new Error('Cloudflare Worker authentication failed');
  }

  try {
    await fetch(`${process.env.CF_WORKER_URL}/render/renderData`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Cf-Auth': process.env.CF_AUTH_SECRET || '',
      },
      body: JSON.stringify({
        value: JSON.stringify({ bucketName, serveUrl, functionName }),
      }),
    });
  } catch (err) {
    console.error(err);
  }
}

async function deleteSites() {
  const { sites } = await getSites({
    region,
  });

  for (const site of sites) {
    await deleteSite({
      bucketName: site.bucketName,
      siteName: site.id,
      region,
    });
    console.log(`Site ${site.id} deleted.`);
  }
}

async function deleteFunctions() {
  const functions = await getFunctions({
    region: 'us-east-1',
    compatibleOnly: false,
  });
  for (const fn of functions) {
    await deleteFunction({
      region: 'us-east-1',
      functionName: fn.functionName,
    });
    console.log(`Function ${fn.functionName} deleted.`);
  }
}

async function deploy() {
  console.log('Deleting sites ...');
  await deleteSites();

  const { bucketName } = await getOrCreateBucket({
    region,
  });

  console.log('Bundling site ...');

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
        console.log(
          `Upload progress: Files uploaded ${filesUploaded} / ${totalFiles} (${sizeUploaded} / ${totalSize})`
        );
      },
    },
  });

  console.log('Deleting functions ...');

  await deleteFunctions();

  // @see https://www.remotion.dev/docs/lambda/deployfunction
  const { functionName } = await deployFunction({
    region,
    timeoutInSeconds: 120,
    memorySizeInMb: 1024,
    createCloudWatchLogGroup: true,
    architecture: 'arm64',
    diskSizeInMb: 512,
  });

  await saveRenderData({ bucketName, serveUrl, functionName });

  console.log('🎉 Done!');
}

deploy();
