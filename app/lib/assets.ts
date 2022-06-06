import { FileProps } from '../types';
import { uploadFile } from '../utils/helpers';

async function uploadAsset(assetFile?: FileList | null) {
  if (!assetFile) {
    return null;
  }

  try {
    const uploaded = await uploadFile(assetFile);
    const { publicUrl } = uploaded[0];
    return publicUrl;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function getPublicAssets({
  audio,
  image,
}: {
  audio?: FileProps | null;
  image?: FileProps | null;
}) {
  let publicImage: string | null = null;
  let publicAudio: string | null = null;

  if (image?.src?.startsWith('http')) {
    publicImage = image.src;
  } else if (image?.file) {
    publicImage = await uploadAsset(image.file);
  }

  if (audio?.src?.startsWith('http')) {
    publicAudio = audio.src;
  } else if (audio?.file) {
    publicAudio = await uploadAsset(audio.file);
  }

  return { publicAudio, publicImage };
}
