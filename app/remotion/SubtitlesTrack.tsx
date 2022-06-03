import { Easing, interpolate } from 'remotion';
import { WordProps } from '../types';

const renderSubtitleItemDefault = (word: WordProps) => <span>{word.word}</span>;

const renderSubtitleItemAnimated = (
  word: WordProps,
  frame: number,
  showFullTrack?: boolean
) => {
  if (typeof word.start === 'undefined' || Number.isNaN(word.start)) {
    console.error(`This word is invalid. Skipping:`, word);
    return null;
  }

  const opacityInputRange = showFullTrack ? [0.25, 1] : [0, 1];
  const translateYInputRange = showFullTrack ? [1, 1] : [0.75, 1];

  return (
    <>
      <span
        style={{
          display: 'inline-block',
          backfaceVisibility: 'hidden',
          opacity: interpolate(
            frame,
            [word.start, word.start + 15],
            opacityInputRange,
            {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }
          ),
          transform: `perspective(1000px) scale(${interpolate(
            frame,
            [word.start, word.start + 15],
            translateYInputRange,
            {
              easing: Easing.out(Easing.quad),
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }
          )})`,
        }}
      >
        {word.word}
      </span>{' '}
    </>
  );
};

export function SubtitlesTrack({
  words,
  frame,
  showFullTrack,
  animate,
}: {
  words: WordProps[];
  frame: number;
  showFullTrack?: boolean;
  animate?: boolean;
}) {
  const renderSubtitleItem = animate
    ? renderSubtitleItemAnimated
    : renderSubtitleItemDefault;

  return (
    <>
      {words.map((word) => {
        const { start, end } = word;
        const key = `${word.word}-${word.startTime?.seconds}-${word.startTime?.nanos}`;

        if (
          typeof start === 'undefined' ||
          Number.isNaN(start) ||
          typeof end === 'undefined' ||
          Number.isNaN(end)
        ) {
          return null;
        }

        return (
          <span
            key={key}
            id={key}
            data-frames={`${start}-${end}`}
            style={{
              marginLeft: 10,
              marginRight: 10,
              backfaceVisibility: 'hidden',
              display: 'inline-block',
            }}
          >
            {renderSubtitleItem(word, frame, showFullTrack)}
          </span>
        );
      })}
    </>
  );
}
