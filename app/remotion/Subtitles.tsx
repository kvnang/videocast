import * as React from 'react';
import {
  continueRender,
  delayRender,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { FlatWordsProps, WordProps } from '../types';

const useWindowedFrameSubs = (
  words: FlatWordsProps,
  options: { windowStart?: number; windowEnd?: number } = {}
) => {
  const { windowStart = -Infinity, windowEnd = Infinity } = options;
  const { fps } = useVideoConfig();

  return React.useMemo(() => {
    const subsWithFrameNumbers = words.reduce<WordProps[]>((acc, item) => {
      const startInSeconds = parseFloat(
        `${item.startTime?.seconds}.${item.startTime?.nanos}`
      );
      const endInSeconds = parseFloat(
        `${item.endTime?.seconds}.${item.endTime?.nanos}`
      );
      const start = Math.floor(startInSeconds * fps);
      const end = Math.floor(endInSeconds * fps);

      if (start < windowStart || start > windowEnd) return acc;

      return [
        ...acc,
        {
          ...item,
          start,
          end,
        },
      ];
    }, []);

    return subsWithFrameNumbers;
  }, [fps, words, windowEnd, windowStart]);
};

const ZOOM_MEASURER_SIZE = 10;

const renderSubtitleItemDefault = (word: WordProps) => <span>{word.word}</span>;
const renderSubtitleItemAnimated = (word: WordProps, frame: number) => {
  if (typeof word.start === 'undefined' || word.start === null) return null;
  return (
    <>
      <span
        style={{
          display: 'inline-block',
          backfaceVisibility: 'hidden',
          opacity: interpolate(frame, [word.start, word.start + 15], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
          transform: `perspective(1000px) scale(${interpolate(
            frame,
            [word.start, word.start + 15],
            [0.75, 1],
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

export function PaginatedSubtitles({
  textColor,
  fontFamily,
  fontSize,
  lineHeight,
  words,
  startFrame,
  endFrame,
  animate,
}: {
  textColor: string;
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  words: FlatWordsProps;
  startFrame?: number;
  endFrame?: number;
  animate?: boolean;
}) {
  const linesPerPage = 4;
  const containerBottom = 200;
  const containerPadding = 40;
  const lineHeightPx = Math.floor(lineHeight * fontSize);

  const frame = useCurrentFrame();
  const windowRef = React.useRef<HTMLDivElement>(null);
  const zoomMeasurer = React.useRef<HTMLDivElement>(null);
  const [handle] = React.useState(() => delayRender());

  const subtitles = useWindowedFrameSubs(words, {
    windowStart: startFrame,
    windowEnd: endFrame,
  });

  const [lineOffset, setLineOffset] = React.useState(0);

  const currentSubtitleItem = subtitles
    .slice()
    .reverse()
    .find((item) => item.start && item.start < frame);

  const renderSubtitleItem = animate
    ? renderSubtitleItemAnimated
    : renderSubtitleItemDefault;

  React.useEffect(() => {
    const zoom =
      (zoomMeasurer.current?.getBoundingClientRect().height as number) /
      ZOOM_MEASURER_SIZE;
    const linesRendered =
      (windowRef.current?.getBoundingClientRect().height as number) /
      (lineHeightPx * zoom);
    const linesToOffset = Math.max(0, linesRendered - linesPerPage);

    if (linesToOffset === lineOffset) {
      continueRender(handle);
      return;
    }

    setLineOffset(linesToOffset);
    continueRender(handle);
  }, [frame, handle, linesPerPage]);

  const lineSubs = (() => {
    const finalLines: WordProps[][] = [];
    const lineIndex = 0;

    for (let i = 0; i < subtitles.length; i += 1) {
      const subtitleItem = subtitles[i];
      const shouldSkip =
        typeof subtitleItem.start !== 'undefined' &&
        subtitleItem.start !== null &&
        subtitleItem.start >= frame;
      if (!shouldSkip) {
        finalLines[lineIndex] = [
          ...(finalLines[lineIndex] ?? []),
          subtitleItem,
        ];
      }
    }

    return finalLines;
  })();

  const currentLineIndex = Math.max(
    0,
    lineSubs.findIndex((l) => l.includes(currentSubtitleItem as WordProps))
  );

  const startLine = Math.max(0, currentLineIndex - (linesPerPage - 1));

  const getLineHeightByOffset = (offset: number) =>
    `${((offset - 1) / linesPerPage + 1) * linesPerPage * lineHeightPx}`;

  const calculateLineOffsetTranslate = (
    offset: number,
    showPrevious?: boolean
  ) => {
    if (showPrevious) {
      return offset * lineHeightPx;
    }
    // if offset is 0, then translate to 0
    // if offset is 1, then translate to 4 x lineHeight
    // if offset is 5, then translate to 8 x lineHeight
    // ...etc

    if (offset === 0) {
      return 0;
    }

    if ((offset - 1) % linesPerPage === 0) {
      return getLineHeightByOffset(offset);
    }

    // Return previous translate
    const previous = offset - ((offset - 1) % linesPerPage);
    return getLineHeightByOffset(previous);
  };

  const lineOffsetTranslate = React.useCallback(
    () => calculateLineOffsetTranslate(lineOffset),
    [lineOffset]
  );

  return (
    <div
      style={{
        position: 'absolute',
        overflow: 'hidden',
        bottom: containerBottom,
        height: `${linesPerPage * lineHeightPx}px`,
        padding: `0 ${containerPadding}px`,
        width: '100%',
      }}
    >
      <h1
        ref={windowRef}
        style={{
          transform: `translateY(-${lineOffsetTranslate()}px)`,
          fontFamily: fontFamily.replace(/\+/g, ' '),
          fontSize: fontSize ? `${fontSize}px` : '60px',
          lineHeight: lineHeightPx ? `${lineHeightPx}px` : '80px',
          fontWeight: 700,
          textAlign: 'left',
          margin: '0 -10px',
          width: 'calc(100% + 20px)',
        }}
      >
        {lineSubs
          .slice(startLine, startLine + linesPerPage)
          .reduce((subs, item) => [...subs, ...item], [])
          .map((word) => (
            <span
              key={`${word.word}-${word.startTime?.seconds}-${word.startTime?.nanos}`}
              id={String(
                `${word.word}-${word.startTime?.seconds}-${word.startTime?.nanos}`
              )}
              style={{
                color: textColor,
                marginLeft: 10,
                marginRight: 10,
                backfaceVisibility: 'hidden',
                display: 'inline-block',
                // opacity,
              }}
            >
              {renderSubtitleItem(word, frame)}
            </span>
          ))}
      </h1>
      <div
        ref={zoomMeasurer}
        style={{ height: ZOOM_MEASURER_SIZE, width: ZOOM_MEASURER_SIZE }}
      />
    </div>
  );
}
