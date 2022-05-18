import React from 'react';
import styled from 'styled-components';

const TitleStyles = styled.section`
  text-align: center;

  .beta {
    padding: 0.25rem 0.5rem;
    background-color: var(--color-accent);
    color: var(--color-bg);
    text-transform: uppercase;
    font-weight: 600;
    border-radius: 0.25rem;
    display: inline-block;
    margin-bottom: 0.25rem;
    box-shadow: 0 0 6px rgba(255, 255, 255, 0.5);
  }
`;

export default function Title() {
  return (
    <div className="container mx-auto">
      <div className="flex justify-center mb-6">
        <span className="inline-block bg-amber-100 px-2 py-1 rounded-md shadow-sm shadow-amber-300 uppercase font-bold text-xs text-slate-800">
          Beta
        </span>
      </div>
      <div className="flex justify-center mb-12">
        <h1 className="font-display text-4xl font-bold text-white text-center">
          Podcast Video Generator
        </h1>
      </div>
    </div>
  );
}
