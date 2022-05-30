import * as React from 'react';
import { continueRender, delayRender } from 'remotion';
import { CF_WORKER_URL } from '../lib/config';
import { FontProps } from '../types';

const cache = new Map<string, FontProps>();

async function getFontData(fontFamily: string) {
  if (cache.has(fontFamily)) {
    return cache.get(fontFamily);
  }

  const fontData = await fetch(`${CF_WORKER_URL}/fonts/${fontFamily}`).then(
    (r) => r.json()
  );

  cache.set(fontFamily, fontData);

  return fontData;
}

export async function useLoadFonts(fontFamily: string, fontData?: FontProps) {
  const [handle] = React.useState(() => delayRender());

  const loadFont = async () => {
    let data = fontData;

    // If fontData isn't passed, load it from the cloudflare worker.
    // This should only happen when using the client-side Video player.
    if (!fontData) {
      data = await getFontData(fontFamily);
    }

    if (!data) {
      return;
    }

    const font = new FontFace(
      data.family,
      `url(${data.files['700'] || data.files.regular}) format('woff2')`
    );

    font
      .load()
      .then(() => {
        document.fonts.add(font);
      })
      .catch((err) => {
        console.log('Error loading font', err);
      });

    continueRender(handle);
  };

  React.useEffect(() => {
    loadFont();
  }, [handle, fontFamily]);
}
