import { CSSProperties } from 'react';
import { Sequence, Img, AbsoluteFill, useVideoConfig } from 'remotion';
import { Heading } from './Heading';
import { Text } from './Text';
import { TextAudio } from './TextAudio';
import { flatten } from '../utils/helpers';
import { StylesProps, WordProps } from '../types';

const imgStyles = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
} as CSSProperties;

export function PodcastVideo({
  styles,
  words,
  audio,
  audioDuration,
  image,
}: {
  styles: StylesProps;
  words?: WordProps;
  audio?: string;
  audioDuration?: number;
  image?: string;
}) {
  const { fps } = useVideoConfig();

  if (!words?.length || !audio || !audioDuration) {
    return null;
  }

  const durationInFrames = audioDuration
    ? Math.ceil(audioDuration * fps)
    : 60 * fps;

  return (
    <>
      {/* <GlobalStyles /> */}
      <div style={{ flex: 1, backgroundColor: 'white' }}>
        {image && (
          <AbsoluteFill>
            <Img src={image} alt="Cover" style={imgStyles} />
          </AbsoluteFill>
        )}
        <Sequence from={0} durationInFrames={Infinity}>
          <Heading
            title={styles.title}
            subtitle={styles.subtitle}
            fontFamily={styles.fontFamily}
            textColor={styles.textColor}
          />
          <Text
            textColor={styles.textColor}
            fontFamily={styles.fontFamily}
            fontSize={styles.fontSize}
            lineHeight={styles.lineHeight}
            words={flatten(words)}
          />
        </Sequence>
        <Sequence from={0} durationInFrames={durationInFrames}>
          {audio && (
            <TextAudio audio={audio} accentColor={styles.accentColor} />
          )}
        </Sequence>
      </div>
    </>
  );
}
