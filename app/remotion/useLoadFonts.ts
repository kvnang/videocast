import { continueRender, delayRender } from 'remotion';

export async function useLoadFonts(fontFamily: string) {
  const waitForFont = delayRender();
  const fontData = await fetch(`/api/fonts/${fontFamily}`).then((r) =>
    r.json()
  );
  console.log(fontData);

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
