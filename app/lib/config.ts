import type { AwsRegion } from '@remotion/lambda';

export const defaultStyles = {
  textColor: '#FFFFFF',
  accentColor: '#EFC88B',
  fontFamily: 'Poppins',
  fontSize: 60,
  lineHeight: 1.25,
  title: '',
  subtitle: '',
};

export const compositionId = 'PodcastVideo';

// export const composition = {
//   id: compositionId,
//   durationInFrames: 3600,
//   fps: 60,
//   width: 720,
//   height: 720,
//   defaultProps: {
//     styles: defaultStyles,
//   },
// };

export const region: AwsRegion = 'us-east-1';

export const fps = 60;
export const defaultImage =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mM0/g8AAWsBNAUUB5MAAAAASUVORK5CYII=';