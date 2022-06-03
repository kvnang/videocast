import * as React from 'react';
import {
  continueRender,
  delayRender,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { FlatWordsProps, WordProps } from '../types';
import { SubtitlesTrack } from './SubtitlesTrack';

const useWindowedFrameSubs = (
  words: FlatWordsProps,
  options: { windowStart?: number; windowEnd?: number } = {}
) => {
  const { windowStart = -Infinity, windowEnd = Infinity } = options;
  const { fps } = useVideoConfig();

  return React.useMemo(() => {
    const subsWithFrameNumbers = words.reduce<WordProps[]>((acc, item) => {
      const startInSeconds = parseFloat(
        `${item.startTime?.seconds || 0}.${item.startTime?.nanos || 0}`
      );
      const endInSeconds = parseFloat(
        `${item.endTime?.seconds || 0}.${item.endTime?.nanos || 0}`
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
  const showFullTrack = true;

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
    .find(
      (item) =>
        typeof item.start !== 'undefined' &&
        !Number.isNaN(item.start) &&
        (item.start < frame || (item.start === 0 && frame === 0))
    );

  React.useEffect(() => {
    let linesRendered = 0;

    const zoom =
      (zoomMeasurer.current?.getBoundingClientRect().height as number) /
      ZOOM_MEASURER_SIZE;

    if (showFullTrack) {
      const currentSubtitleItemEl =
        windowRef.current?.querySelector<HTMLSpanElement>(
          `span[data-frames="${currentSubtitleItem?.start}-${currentSubtitleItem?.end}"]`
        );
      if (currentSubtitleItemEl) {
        linesRendered =
          (currentSubtitleItemEl.offsetTop +
            currentSubtitleItemEl.getBoundingClientRect().height) /
          (lineHeightPx * zoom);
      }
    } else {
      linesRendered =
        (windowRef.current?.getBoundingClientRect().height as number) /
        (lineHeightPx * zoom);
    }

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
        !Number.isNaN(subtitleItem.start) &&
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
          color: textColor,
        }}
      >
        <SubtitlesTrack
          words={
            !showFullTrack
              ? lineSubs
                  .slice(startLine, startLine + linesPerPage)
                  .reduce((subs, item) => [...subs, ...item], [])
              : subtitles
          }
          frame={frame}
          showFullTrack={showFullTrack}
          animate={animate}
        />
      </h1>
      <div
        ref={zoomMeasurer}
        style={{ height: ZOOM_MEASURER_SIZE, width: ZOOM_MEASURER_SIZE }}
      />
    </div>
  );
}
