import * as React from 'react';
import { AbsoluteFill, Img } from 'remotion';

export function BackgroundImage({ src }: { src: string }) {
  return (
    <AbsoluteFill>
      <Img
        src={src}
        alt="Cover"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
    </AbsoluteFill>
  );
}
