import React from 'react';
import styled, { keyframes } from 'styled-components';
import SEO from './Seo';

const rotate = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(359deg);
  }
`;

const LoadingDivStyles = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
`;

const LoadingSvgStyles = styled.svg`
  height: 3rem;
  width: 3rem;
  animation: ${rotate} 1s ease infinite;
  color: var(--color-p);
`;

export default function Loading({ text = 'Loading ...' }: { text?: string }) {
  return (
    <>
      <SEO title="Loading ..." />
      <div className="site">
        <div className="site-content">
          <main>
            <LoadingDivStyles>
              <LoadingSvgStyles
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 100 100"
              >
                <path
                  fill="currentColor"
                  d="M73,50c0-12.7-10.3-23-23-23S27,37.3,27,50 M30.9,50c0-10.5,8.5-19.1,19.1-19.1S69.1,39.5,69.1,50"
                />
              </LoadingSvgStyles>
              <p style={{ textAlign: 'center', marginTop: '1rem' }}>
                <small>{text}</small>
              </p>
            </LoadingDivStyles>
          </main>
        </div>
      </div>
    </>
  );
}
