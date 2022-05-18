import React from 'react';
import styled from 'styled-components';

interface TextProps {
  fontFamily: string;
  textColor: string;
}

const TextStyles = styled.div<TextProps>`
  text-align: left;
  width: 100%;
  position: relative;
  font-size: 22px;

  h1 {
    font-family: ${(props) => `'${props.fontFamily.replace(/\+/g, ' ')}'`};
    font-size: 1em;
    line-height: 1.5;
    font-weight: 700;
    margin: 0 !important;
    color: ${(props) => props.textColor};
  }

  h2 {
    font-family: ${(props) => `'${props.fontFamily.replace(/\+/g, ' ')}'`};
    font-size: 0.7em;
    font-weight: normal;
    margin: 0 !important;
    color: ${(props) => props.textColor};
  }
`;

export const Heading: React.FC<{
  title?: string;
  subtitle?: string;
  fontFamily: string;
  textColor: string;
}> = ({ title, subtitle, fontFamily, textColor }) => {
  const containerPadding = 40;

  return (
    <div
      style={{
        position: 'absolute',
        top: containerPadding,
        overflow: 'hidden',
        padding: `0 ${containerPadding}px`,
      }}
    >
      <TextStyles fontFamily={fontFamily} textColor={textColor}>
        {subtitle && <h2>{subtitle}</h2>}
        {title && <h1>{title}</h1>}
      </TextStyles>
    </div>
  );
};
