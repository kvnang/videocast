import { Env, FontProps } from './types';

export async function getFonts(env: Env) {
  const allFonts: { items: FontProps[] } = await fetch(
    `https://www.googleapis.com/webfonts/v1/webfonts?key=${env.GOOGLE_FONTS_API_KEY}&sort=popularity&fields=items(family,files)`
  ).then((r) => r.json());

  // Limit to 100 most popular fonts
  const limitedFonts = allFonts.items.slice(0, 100);

  // Re-sort fonts by family name
  const sortedFonts = limitedFonts.sort((a, b) => {
    if (a.family < b.family) {
      return -1;
    }
    if (a.family > b.family) {
      return 1;
    }
    return 0;
  });

  // Transform fonts
  const cleanFonts = sortedFonts.map((font) => {
    const fontFiles: Record<string, string> = {};

    Object.keys(font.files)
      .filter((key) => ['regular', '700'].includes(key))
      .forEach((key) => {
        fontFiles[key] = font.files[key].replace('http://', 'https://');
      });

    return {
      family: font.family,
      files: fontFiles,
    };
  });

  return cleanFonts;

  // if (req.query.font) {
  //   const font = cleanFonts.find((f) => f.family === req.query.font);

  //   if (font) {
  //     return res.status(200).json(font);
  //   }

  //   return res.status(404).json({
  //     error: `Font ${req.query.font} not found`,
  //   });
  // }

  // res.status(200).json(cleanFonts);
}
