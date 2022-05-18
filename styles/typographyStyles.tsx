import * as styled from 'styled-components';
import { breakpoints } from './breakpoints';

const typographyStyles = () => styled.css`
  html {
    font-size: 100%; /* 1rem = 16px */
  }

  body {
    color: var(--color-p);
    font-family: var(--font-secondary);
    font-size: var(--font-size-body);
    color-adjust: economy;
    -webkit-print-color-adjust: economy;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  button,
  .button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
  }

  figure {
    margin: 0;
  }

  .image-wrapper {
    width: 100%;
  }

  /* Copy & lists */
  p {
    word-break: break-word;
    hyphens: none;
    line-height: 1.5em;
    color: var(--color-p);
    margin: 0;

    &:not(:last-child) {
      margin-bottom: 1.5rem;
    }

    &.medium {
      font-weight: 500;
    }
  }

  ul,
  ol {
    margin: 0;

    &:not(:last-child) {
      margin-bottom: 1.5em;
    }

    li {
      line-height: 1.5em;
    }

    ul,
    ol {
      margin-top: 0;
      margin-bottom: 0;
    }
  }

  small,
  .small {
    font-size: var(--font-size-small);
  }

  strong {
    font-weight: 700;
  }

  /* Headings */
  h1,
  .h1,
  h2,
  .h2,
  h3,
  .h3,
  h4,
  .h4,
  h5,
  .h5,
  h6,
  .h6 {
    margin-top: 0;
    margin-bottom: 0;
    line-height: 1.35;
    color: var(--color-h);
    font-family: var(--font-primary);
    word-break: break-word;
  }

  h1,
  .h1 {
    font-size: 2rem;
    font-weight: 400;
    letter-spacing: 0.015em;

    @media ${breakpoints.tabletS} {
      font-size: 2.75rem;
    }

    @media ${breakpoints.laptopS} {
      font-size: 3.125rem;
    }

    &:not(:last-child) {
      margin-bottom: 0.625em;
    }
  }

  h2,
  .h2 {
    font-size: 1.5rem;
    font-weight: 600;

    &:not(:last-child) {
      margin-bottom: 1em;
    }
  }

  h3,
  .h3 {
    font-size: 1.125rem;
    font-weight: 600;

    &:not(:last-child) {
      margin-bottom: 1em;
    }
  }

  h4,
  .h4 {
    font-family: var(--font-secondary);
    font-size: 1.125rem;
    font-weight: 400;

    &:not(:last-child) {
      margin-bottom: 0.5em;
    }
  }

  h5,
  .h5 {
    font-size: var(--font-size-h5);
    font-weight: var(--font-weight-h5);
  }

  h6,
  .h6 {
    font-size: var(--font-size-h6);
    font-weight: 600;
  }

  /* Links */
  a {
    text-decoration: none;
    color: var(--color-p);
    transition: color var(--transition);

    &:hover {
      color: var(--color-accent);
    }

    &.inline-link {
      position: relative;
      z-index: 0;
      &::before {
        height: 15%;
        position: absolute;
        background: var(--color-accent);
        content: '';
        width: 100%;
        bottom: -2px;
        z-index: -1;
        transition: transform 0.1s ease 0s;
        transform: skew(-20deg);
      }
    }
  }

  .underline {
    position: relative;
    z-index: 0;

    &::before {
      height: 35%;
      position: absolute;
      background: var(--color-accent);
      content: '';
      width: 100%;
      bottom: -2px;
      z-index: -1;
      transition: transform 0.1s ease 0s;
      transform: skew(-20deg);
    }
  }

  button {
    background: none;
    border: 0;
    cursor: pointer;
    color: inherit;
  }

  /* Image & iframes */

  img,
  iframe,
  video,
  audio {
    max-width: 100%;
  }

  img {
    height: auto;
  }

  .iframe-wrapper {
    position: relative;
    width: 100%;
    height: 0;
    padding-bottom: 56.25%;

    iframe {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
    }
  }

  strong {
    font-weight: 600;
  }

  code,
  .code {
    font-family: 'Inconsolata', 'Courier New';
    color: var(--black);
    font-weight: 400;
  }

  /* blockquote */
  blockquote {
    padding-top: 1em;
    position: relative;

    &:not(:last-child) {
      margin-bottom: var(--p-spacing);
    }
    /* &:not(:first-of-type) {
      margin-top: var(--p-spacing);
    } */

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: calc(50% + 1.25rem);
      height: 1px;
      background-color: var(--color-accent);

      @media ${breakpoints.tabletS} {
        width: calc(100% - 2.5em);
      }
    }

    &.inline {
      max-width: 25rem;

      @media ${breakpoints.mobileL} {
        width: 50%;
      }

      &--right {
        @media ${breakpoints.mobileL} {
          float: right;
          margin-top: 0;
          margin-left: 1rem;
          margin-bottom: var(--p-spacing);
        }

        @media ${breakpoints.laptopS} {
          margin-left: 1.5rem;
        }
      }
    }
    > p {
      font-family: var(--font-primary);
      font-weight: 700;
      font-size: var(--font-size-blockquote);
    }
  }

  /* Utils */
  .box-shadow {
    box-shadow: var(--box-shadow);
  }

  .separator {
    color: var(--light-grey);
  }

  .posts-grid {
    display: flex;
    flex-flow: wrap;
    align-items: flex-start;
    margin: calc(var(--post-grid-gap) * -1);
  }

  .skeleton-bg {
    background: var(--x-light-grey);
    position: relative;
    overflow: hidden;

    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
      background-image: linear-gradient(
        90deg,
        hsla(0, 100%, 100%, 0) 0,
        hsla(0, 100%, 100%, 0.25) 30%,
        hsla(0, 100%, 100%, 0.5) 60%,
        hsla(0, 100%, 100%, 0) 100%
      );
      z-index: 1;
      animation: shimmer 1.5s infinite;
      transform: translateX(-100%);
    }
  }
  @keyframes shimmer {
    100% {
      transform: translateX(100%);
    }
  }
`;

export default typographyStyles;
