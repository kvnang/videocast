/** @type {import('next').NextConfig} */
module.exports = {
  env: {
    NEXT_PUBLIC_URL: process.env.URL,
  },
  reactStrictMode: true,
  images: {
    // loader: 'imgix',
    domains: ['storage.googleapis.com', 's.gravatar.com', 'api.videocast.app'],
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  experimental: {
    runtime: 'edge',
    outputFileTracing: true,
  },
  // async rewrites() {
  //   return [
  //     {
  //       source: '/api/gcs/:path*',
  //       destination:
  //         'https://storage.googleapis.com/podcast-video-generator-audio/:path*',
  //     },
  //   ];
  // },
  // webpack(config, options) {
  //   const { isServer } = options;
  //   config.module.rules.push({
  //     test: /\.(ogg|mp3|wav|mpe?g)$/i,
  //     exclude: config.exclude,
  //     use: [
  //       {
  //         loader: require.resolve('url-loader'),
  //         options: {
  //           limit: config.inlineImageLimit,
  //           // limit: 20,
  //           fallback: require.resolve('file-loader'),
  //           publicPath: `${config.assetPrefix || ''}/_next/static/images/`,
  //           outputPath: `${isServer ? '../' : ''}static/images/`,
  //           name: '[name]-[hash].[ext]',
  //           esModule: config.esModule || false,
  //         },
  //       },
  //     ],
  //   });

  //   return config;
  // },
};
