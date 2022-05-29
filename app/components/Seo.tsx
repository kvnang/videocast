import Head from 'next/head';
import { useRouter } from 'next/router';

interface Props {
  children?: React.ReactNode;
  title?: string;
  description?: string;
  canonical?: string;
  image?: string;
  lang?: string;
}

export default function SEO({
  children,
  title,
  description,
  canonical,
  image,
  lang = 'en',
}: Props) {
  const router = useRouter();
  const metaTitle = 'Videocast';
  const metaDescription = 'Turn Podcasts into Videos';
  const metaKeywords = ['podcast', 'video', 'generator'];
  const baseURL = process.env.URL || 'http://localhost:3000';
  const url = `${baseURL}${router.asPath}`;
  const canonicalUrl = canonical ? `${baseURL}${canonical}` : url;

  const mainFavicon =
    process.env.NODE_ENV === 'development' ? 'favicon-dev' : 'favicon';

  let cardImage;

  if (image) {
    cardImage = image.includes('http') ? image : `${baseURL}${image}`;
  }
  return (
    <Head>
      {/* <html lang="en" /> */}
      {/* Primary Meta Tags */}
      <title>{title || metaTitle}</title>
      <meta name="title" content={title || metaTitle} />
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={metaKeywords.join(', ')} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta charSet="utf-8" />
      {/* Canonical */}
      <link rel="canonical" href={canonicalUrl} />
      {/* Favicons */}
      <link rel="icon" type="image/svg+xml" href={`/${mainFavicon}.svg`} />
      <link rel="icon" href={`/${mainFavicon}.ico`} sizes="32x32" />
      <link rel="icon" href="/favicon-16x16.png" sizes="16x16" />
      <link rel="icon" href="/favicon-32x32.png" sizes="32x32" />
      <link rel="icon" href="/favicon-96x96.png" sizes="96x96" />
      <link rel="icon" href="/favicon-128.png" sizes="128x128" />
      {/* Android */}
      <link rel="shortcut icon" href="/favicon-196x196.png" sizes="196x196" />
      {/* iOS */}
      <link
        rel="apple-touch-icon"
        href="/apple-touch-icon-120x120.png"
        sizes="120x120"
      />
      <link
        rel="apple-touch-icon"
        href="/apple-touch-icon-152x152.png"
        sizes="152x152"
      />
      <link
        rel="apple-touch-icon"
        href="/apple-touch-icon-180x180.png"
        sizes="180x180"
      />
      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} key="ogurl" />
      <meta
        property="og:image"
        content={cardImage || `${baseURL}/opengraph.jpg`}
        key="ogimage"
      />
      <meta property="og:title" content={title} key="ogtitle" />
      <meta property="og:site_name" content={metaTitle} key="ogsitename" />
      <meta property="og:description" content={metaDescription} key="ogdesc" />
      <meta property="og:type" content="website" key="ogtype" />
      {/* twitter */}
      <meta property="twitter:title" content={title} />
      <meta property="twitter:url" content={url} key="twitterurl" />
      <meta
        property="twitter:description"
        content={metaDescription}
        key="twitterdesc"
      />
      <meta property="twitter:card" content="summary" key="twittercard" />
      <meta
        property="twitter:image"
        content={cardImage || `${baseURL}/opengraph.jpg`}
        key="twitterimage"
      />
      {children}
    </Head>
  );
}
