import { useAudioData, visualizeAudio } from '@remotion/media-utils';
import React from 'react';
import { Audio, useCurrentFrame, interpolate, useVideoConfig } from 'remotion';

function AudioVisualization({
  visualization,
  accentColor,
}: {
  visualization: number[];
  accentColor: string;
}) {
  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {visualization?.length && (
        <div
          style={{
            position: 'absolute',
            zIndex: 1,
            bottom: 0,
            left: 0,
            display: 'flex',
            alignItems: 'flex-end',
            height: 150,
            width: '100%',
          }}
        >
          {visualization.map((v, i) => {
            const barHeight = Math.abs(
              Math.log(
                interpolate(v, [0.0, 1], [0, 100], {
                  extrapolateLeft: 'clamp',
                  // extrapolateRight: 'clamp',
                }) * 600
              ) * 6
            );
            return (
              <div
                key={`visualization-${i}`}
                style={{
                  flex: 1,
                  width: 'auto',
                  height: `${barHeight}%`,
                  padding: '0 5px',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: '100%',
                    backgroundColor: accentColor,
                    borderBottom: `2px solid ${accentColor}`,
                  }}
                />
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

export function TextAudio({
  audio,
  accentColor,
}: {
  accentColor: string;
  audio: string;
}) {
  const frame = useCurrentFrame();
  const audioData = useAudioData(audio);
  const { fps } = useVideoConfig();

  if (!audioData) {
    return null;
  }

  const visualization = visualizeAudio({
    fps,
    frame,
    audioData,
    numberOfSamples: 16,
  });

  return (
    <>
      <Audio src={audio} />
      <AudioVisualization
        visualization={visualization}
        accentColor={accentColor}
      />
    </>
  );
}
