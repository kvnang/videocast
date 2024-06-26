import { Composition, getInputProps } from 'remotion';
import { compositionId, defaultStyles, fps } from '../lib/config';
import { PodcastVideo } from './PodcastVideo';
import type { FontProps } from '../types';

export function RemotionVideo() {
  const inputProps = getInputProps();
  const compositionFps = (inputProps?.fps as number | undefined) || fps;
  return (
    <Composition
      id={compositionId}
      component={PodcastVideo}
      durationInFrames={60 * compositionFps}
      fps={compositionFps}
      width={720}
      height={720}
      defaultProps={{
        styles: defaultStyles,
        fontData: inputProps.fontData as FontProps | undefined,
      }}
    />
  );
}
