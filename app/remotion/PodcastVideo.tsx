import { Sequence, useVideoConfig } from 'remotion';
import { Heading } from './Heading';
import { TextAudio } from './TextAudio';
import { flatten } from '../utils/helpers';
import { FontProps, StylesProps, WordsProps } from '../types';
import { useLoadFonts } from './useLoadFonts';
import { PaginatedSubtitles } from './Subtitles';
import { BackgroundImage } from './BackgroundImage';

export function PodcastVideo({
  styles,
  fontData,
  words,
  audio,
  audioDuration,
  image,
}: {
  styles: StylesProps;
  fontData?: FontProps;
  words?: WordsProps;
  audio?: string;
  audioDuration?: number;
  image?: string;
}) {
  const { fps } = useVideoConfig();

  useLoadFonts(styles.fontFamily, fontData);

  if (!words?.length || !audio || !audioDuration) {
    return null;
  }

  const durationInFrames = audioDuration
    ? Math.ceil(audioDuration * fps)
    : 60 * fps;

  return (
    <div style={{ flex: 1, backgroundColor: 'white' }}>
      {image && <BackgroundImage src={image} />}
      <Sequence from={0} durationInFrames={Infinity}>
        <Heading
          title={styles.title}
          subtitle={styles.subtitle}
          fontFamily={styles.fontFamily}
          textColor={styles.textColor}
        />
        <PaginatedSubtitles
          textColor={styles.textColor}
          fontFamily={styles.fontFamily}
          fontSize={styles.fontSize}
          lineHeight={styles.lineHeight}
          words={flatten(words)}
          startFrame={0}
          endFrame={0 + durationInFrames}
          animate
        />
      </Sequence>
      <Sequence from={0} durationInFrames={durationInFrames}>
        {audio && (
          <TextAudio
            audio={audio}
            accentColor={styles.accentColor}
            audioVisualization={styles.audioVisualization}
          />
        )}
      </Sequence>
    </div>
  );
}
