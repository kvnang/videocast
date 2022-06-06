import { WordProps } from '../types';

export const getCurrentSubtitleItem = (subtitles: WordProps[], frame: number) =>
  subtitles
    .slice()
    .reverse()
    .find(
      (item) =>
        typeof item.start !== 'undefined' &&
        !Number.isNaN(item.start) &&
        (item.start < frame || (item.start === 0 && frame === 0))
    );

export const getLineHeightByOffset = (
  offset: number,
  linesPerPage: number,
  lineHeightPx: number
) => `${((offset - 1) / linesPerPage + 1) * linesPerPage * lineHeightPx}`;

export const calculateLineOffsetTranslate = (
  offset: number,
  linesPerPage: number,
  lineHeightPx: number
  // showPrevious?: boolean
) => {
  // if (showPrevious) {
  //   return offset * lineHeightPx;
  // }

  // if offset is 0, then translate to 0
  // if offset is 1, then translate to 4 x lineHeight
  // if offset is 5, then translate to 8 x lineHeight
  // ...etc

  if (offset === 0) {
    return 0;
  }

  if ((offset - 1) % linesPerPage === 0) {
    return getLineHeightByOffset(offset, linesPerPage, lineHeightPx);
  }

  // Return previous translate
  const previous = offset - ((offset - 1) % linesPerPage);
  return getLineHeightByOffset(previous, linesPerPage, lineHeightPx);
};
