import { continueRender, delayRender } from 'remotion';
import { CF_WORKER_URL } from '../lib/config';
import { absolutizeUrl } from '../utils/helpers';

export async function useLoadFonts(fontFamily: string) {
  const waitForFont = delayRender();
  const endpoint = `/api/fonts/${fontFamily}`;
  const fontData = await fetch(`${CF_WORKER_URL}/fonts/${fontFamily}`).then(
    (r) => r.json()
  );
  console.log(absolutizeUrl(endpoint));

  if (!fontData) {
    console.error('Font data not found');
    return;
  }

  const font = new FontFace(
    fontData.family,
    `url(${fontData.files['700'] || fontData.files.regular}) format('woff2')`
  );
  font
    .load()
    .then(() => {
      document.fonts.add(font);
    })
    .catch((err) => {
      console.log('Error loading font', err);
    });

  continueRender(waitForFont);

  return fontFamily;
}
