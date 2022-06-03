import { useAudioData, visualizeAudio } from '@remotion/media-utils';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

interface Props {
  src: string;
  accentColor: string;
}

export function AudioVisualizationDefault({ src, accentColor }: Props) {
  const audioData = useAudioData(src);
  const frame = useCurrentFrame();
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

export function AudioVisualizationMirrored({
  src,
  accentColor,
}: {
  src: string;
  accentColor: string;
}) {
  const audioData = useAudioData(src);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (!audioData) {
    return null;
  }

  const allVisualizationValues = visualizeAudio({
    fps,
    frame,
    audioData,
    numberOfSamples: 256, // Use more samples to get a nicer visualisation
  });

  // Pick the low values because they look nicer than high values
  // feel free to play around :)
  const visualization = allVisualizationValues.slice(8, 30);

  const mirrored = [...visualization.slice(1).reverse(), ...visualization];

  return (
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
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          height: '100%',
          width: '100%',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
          marginTop: '1rem',
        }}
      >
        {mirrored.map((v, i) => (
          <div
            key={i}
            className="bar"
            style={{
              height: `${500 * Math.sqrt(v)}%`,
              backgroundColor: accentColor,
              borderRadius: `0.5rem`,
              width: `0.5rem`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function AudioVisualization({
  src,
  accentColor,
  type = 'default',
}: Props & { type?: 'default' | 'mirrored' }) {
  if (type === 'mirrored') {
    return <AudioVisualizationMirrored src={src} accentColor={accentColor} />;
  }
  return <AudioVisualizationDefault src={src} accentColor={accentColor} />;
}
