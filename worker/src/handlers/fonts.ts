import { Env, FontProps } from '../types';
import { corsHeaders, patterns } from '../utils';

/**
 * Get fonts data via Google Fonts API
 */
async function getFonts(env: Env) {
  // Fetch fonts, sorting by popularity
  const allFonts: { items: FontProps[] } = await fetch(
    `https://www.googleapis.com/webfonts/v1/webfonts?key=${env.GOOGLE_FONTS_API_KEY}&sort=popularity&fields=items(family,files)`
  ).then((r) => r.json());

  // Limit to 100 most popular fonts
  const limitedFonts = allFonts.items;

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

  // Transform fonts to use https and only selected weights
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
}

/**
 * Handle requests to /fonts/[:key] route
 *
 * If request if made to /fonts, this will return 100 most popular fonts
 *
 * If request is made to /fonts/:key, this will return the font data for that key
 */
export async function handleFonts(request: Request, env: Env) {
  const url = new URL(request.url);
  const key = patterns.fonts.exec(url.pathname)?.[1];

  switch (request.method) {
    case 'GET': {
      // Get font data stored in KV
      const existingValue = await env.KV.get('fonts');

      // If non-existent, fetch from Google Fonts API
      if (!existingValue) {
        const newValue = await getFonts(env);
        await env.KV.put('fonts', JSON.stringify(newValue), {
          expirationTtl: 60 * 60 * 24 * 7, // expires in one week
        });
      }

      const fonts = await env.KV.get<FontProps[] | undefined>('fonts', 'json');

      if (!fonts?.length) {
        return new Response('Fonts Not Found', { status: 404 });
      }

      // if request is made to /fonts/:key, return the single font data
      if (key) {
        const font = fonts?.find((f) => f.family === decodeURIComponent(key));

        if (!font) {
          return new Response('Font Not Found', { status: 404 });
        }

        return new Response(JSON.stringify(font), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        });
      }

      // if request is made to /fonts, return all fonts
      return new Response(JSON.stringify(fonts), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    }

    default:
      return new Response('Method Not Allowed', { status: 405 });
  }
}
