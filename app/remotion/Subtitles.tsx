import * as React from 'react';
import {
  continueRender,
  delayRender,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { FlatWordsProps, WordProps } from '../types';
import { SubtitlesTrack } from './SubtitlesTrack';
import useDebounce from '../hooks/useDebounce';
import {
  calculateLineOffsetTranslate,
  getCurrentSubtitleItem,
} from '../lib/subtitles';

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
  const { durationInFrames } = useVideoConfig();
  const windowRef = React.useRef<HTMLDivElement>(null);
  const zoomMeasurer = React.useRef<HTMLDivElement>(null);
  const [handle] = React.useState(() => delayRender());

  const subtitles = useWindowedFrameSubs(words, {
    windowStart: startFrame,
    windowEnd: endFrame,
  });

  const [lineOffsetPerFrame, setLineOffsetPerFrame] = React.useState<
    Record<string, number>
  >({});

  const debouncedSubtitles = useDebounce(subtitles, 1000);

  const calculateLinesToOffset = (currentSubtitleItem?: WordProps) => {
    if (typeof currentSubtitleItem === 'undefined') return null;

    let linesRendered = 0;

    const zoom =
      (zoomMeasurer.current?.getBoundingClientRect().height as number) /
      ZOOM_MEASURER_SIZE;

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

    const linesToOffset = Math.max(0, linesRendered - linesPerPage);

    return linesToOffset;
  };

  React.useEffect(() => {
    const timer = setTimeout(() => {
      const obj: Record<string, number> = {};
      let currentLinesToOffset: number = 0;

      // Loop over all frames
      for (let i = 0; i < durationInFrames; i += 1) {
        const curr = getCurrentSubtitleItem(debouncedSubtitles, i);
        const linesToOffset = calculateLinesToOffset(curr);
        if (linesToOffset !== null) {
          obj[i] = linesToOffset;
          currentLinesToOffset = linesToOffset;
        } else {
          obj[i] = currentLinesToOffset;
        }
      }

      setLineOffsetPerFrame(obj);
      continueRender(handle);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [debouncedSubtitles, linesPerPage]);

  const translateY = `-${calculateLineOffsetTranslate(
    lineOffsetPerFrame[frame],
    linesPerPage,
    lineHeightPx
  )}px`;

  return (
    <>
      {/* <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          textAlign: 'right',
        }}
      >
        Frame: {frame}
      </div> */}
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
            transform: `translateY(${translateY})`,
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
            words={subtitles}
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
    </>
  );
}
