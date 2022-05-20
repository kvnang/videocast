import React, { useEffect, useRef, useState } from 'react';
import {
  continueRender,
  delayRender,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { getWordTimeInSeconds } from '../utils/helpers';

interface FrameProps {
  [key: number]: {
    page: number;
    start: number;
    end?: number;
  };
}

export function Text({
  textColor,
  fontFamily,
  fontSize,
  lineHeight,
  words,
}: {
  textColor: string;
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  words: Array<any>;
}) {
  const lines = 4;
  const containerBottom = 200;
  const containerPadding = 40;
  const lineHeightPx = Math.floor(lineHeight * fontSize);

  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();

  const textContainerRef = useRef<HTMLDivElement>(null);
  const [firstFramesOfPage, setFirstFramesOfPage] = useState<FrameProps>({});

  const [handle] = useState(() => delayRender());

  useEffect(() => {
    const textContainer = textContainerRef.current;

    function calculateFirstFrames() {
      const firstFrames: FrameProps = {};

      if (!textContainer) {
        return;
      }
      const spans = textContainer.querySelectorAll('span');

      let referencePage = 1;
      let previousPage = 0;
      for (let i = 0; i < spans.length; i += 1) {
        const span = spans[i];
        if (span.offsetTop === (referencePage - 1) * lineHeightPx * lines) {
          firstFrames[referencePage] = {
            page: referencePage,
            start: spans[i - 1] ? Number(spans[i - 1].dataset.end) : 0,
          };
          if (firstFrames[previousPage]) {
            firstFrames[previousPage].end = spans[i - 1]
              ? Number(spans[i - 1].dataset.end) - 1
              : 0;
          }
          referencePage += 1;
          previousPage += 1;
        }
      }

      return firstFrames;
    }

    const timer1 = setTimeout(() => {
      const firstFrames = calculateFirstFrames();
      if (firstFrames) {
        setFirstFramesOfPage(firstFrames);
      }
      continueRender(handle);
    }, 1000);

    // ref.current = firstFrames;
    // setFirstFramesOfPage(firstFrames);

    return () => {
      clearTimeout(timer1);
    };
  }, [textContainerRef]);

  // useEffect(() => {
  //   if (firstFramesOfPage) {
  //     if (firstFramesOfPage[frame]) {
  //       const page = firstFramesOfPage[frame];
  //       setTextScroll(
  //         (firstFramesOfPage[frame] - 1) * (lines * lineHeight) * -1
  //       );
  //       // setPage();
  //     }
  //   }
  // }, [frame]);

  // useEffect(() => {
  //   if (page) {
  //     setTextScroll((page - 1) * (lines * lineHeight) * -1);
  //   }
  // }, [page]);

  const getCurrentPage = (framesData: FrameProps, frameNumber: number) => {
    if (!Object.keys(framesData).length) {
      return 1;
    }

    const array = Object.values(framesData);
    const page = array.find(
      (p) =>
        (p.start <= frameNumber && p.end >= frameNumber) ||
        (p.start <= frameNumber && !p.end)
    );

    return page ? page.page : 1;
  };

  return (
    <div
      ref={textContainerRef}
      id="text-container"
      style={{
        position: 'absolute',
        bottom: containerBottom,
        overflow: 'hidden',
        height: `${lines * lineHeightPx}px`,
        padding: `0 ${containerPadding}px`,
      }}
    >
      <h1
        style={{
          fontFamily: fontFamily.replace(/\+/g, ' '),
          fontSize: fontSize ? `${fontSize}px` : '60px',
          lineHeight: lineHeightPx ? `${lineHeightPx}px` : '80px',
          fontWeight: 700,
          textAlign: 'left',
          margin: '0 -10px',
          width: 'calc(100% + 20px)',
          position: 'relative',
          top: `${
            Object.keys(firstFramesOfPage).length
              ? (getCurrentPage(firstFramesOfPage, frame) - 1) *
                (lines * lineHeightPx) *
                -1
              : 0
          }px`,
        }}
      >
        {words.map((word, i) => {
          const { startTime, endTime } = word;
          const startTimeSecond = getWordTimeInSeconds(startTime);
          const endTimeSecond = getWordTimeInSeconds(endTime);
          // parseFloat(startTime.replace(/\:$/, ''))

          // const endTimeSecond = parseFloat(endTime.replace(/\:$/, ''));
          const fadeInFrame = Math.floor(startTimeSecond * fps);
          const fadeOutFrame = Math.floor(endTimeSecond * fps);
          // console.log(fadeInFrame, fadeOutFrame);
          let opacity;
          const duration = 5;
          if (frame >= fadeInFrame + duration) {
            opacity = 1;
          } else if (frame >= fadeInFrame) {
            opacity = 0.5 + ((frame - fadeInFrame) / duration) * 0.5; // fading in
          } else {
            opacity = 0.5;
          }

          return (
            <span
              key={`word-${i}`}
              id={`word-${i}`}
              data-start={fadeInFrame}
              data-end={fadeOutFrame}
              style={{
                color: textColor,
                marginLeft: 10,
                marginRight: 10,
                opacity,
                display: 'inline-block',
              }}
            >
              {word.word}
            </span>
          );
        })}
      </h1>
    </div>
  );
}
