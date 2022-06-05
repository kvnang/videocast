import { Audio } from 'remotion';
import { AudioVisualizationType } from '../types';
import { AudioVisualization } from './AudioVisualization';

export function TextAudio({
  audio,
  accentColor,
  audioVisualization,
}: {
  accentColor: string;
  audio: string;
  audioVisualization?: AudioVisualizationType;
}) {
  return (
    <>
      <Audio src={audio} />
      <AudioVisualization
        src={audio}
        accentColor={accentColor}
        type={audioVisualization}
      />
    </>
  );
}
