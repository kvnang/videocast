import { Audio } from 'remotion';
import { AudioVisualization } from './AudioVisualization';

export function TextAudio({
  audio,
  accentColor,
}: {
  accentColor: string;
  audio: string;
}) {
  return (
    <>
      <Audio src={audio} />
      <AudioVisualization
        src={audio}
        accentColor={accentColor}
        type="mirrored"
      />
    </>
  );
}
