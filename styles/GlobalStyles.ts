import * as styled from 'styled-components';
import { breakpoints } from './breakpoints';
import gridStyles from './gridStyles';
import typographyStyles from './typographyStyles';

const documentStyles = () => styled.css`
  :root {
    --slate: #0f172a;
    --dark-purple: #2f263c;
    --dark-blue: #7698b3;
    --blue: #83b5d1;
    /* --orange: #eb5231; */
    --white: #fff;
    --white-rgb: 255, 255, 255;
    --red: #70131f;
    /* --gold: #b47b28; */
    --yellow: #efc88b;
    --red: #e54b4b;
    --light-gold: #eddeca;
    --color-primary: var(--yellow);
    --color-accent: var(--yellow);
    --color-error: var(--red);
    --color-p: var(--white);
    --color-h: var(--white);
    --color-p-rgb: var(--white-rgb);
    --color-bg: var(--slate);
    --color-error: #cc2027;
    --color-success: #35ce8d;
    --medium-grey: #c4c4c4;
    --light-grey: #e3e3e3;
    --form-field-gap: 0.625rem;
    --grid-gap: 0.625rem;
    --transition: 0.3s ease;
    --box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16);
    --box-shadow-deep: 0 3px 6px rgba(0, 0, 0, 0.32);
    --font-primary: 'Autour One', -apple-system, BlinkMacSystemFont, 'Georgia',
      'Times New Roman', Times, serif;
    --font-secondary: 'Quicksand', -apple-system, BlinkMacSystemFont,
      'Helvetica', 'Arial', sans-serif;
    --font-size-body: 1rem;
    --font-size-small: 0.8rem;
    --section-spacing: 2.5rem;
    --border-radius: 5px;
    --stripe-gradient: repeating-linear-gradient(
      -45deg,
      #606dbc,
      #606dbc 10px,
      #465298 10px,
      #465298 20px
    );
    --stripe-gradient-accent: repeating-linear-gradient(
      -45deg,
      var(--color-accent),
      var(--color-accent) 10px,
      #e9b35e 10px,
      #e9b35e 20px
    );
  }

  html,
  body {
    overflow-x: hidden;
    background-color: var(--color-bg);
    color: var(--color-p);
  }

  html {
    &.no-scroll {
      overflow: hidden;

      body {
        overflow: hidden;
      }
    }
  }

  body {
    .site {
      display: flex;
      flex-direction: column;
      min-height: 100vh;

      .site-content {
        flex: 1;
      }
    }
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
    -webkit-font-smoothing: antialiased;
    /* word-break: break-word;
    word-wrap: break-word; */
  }
  * {
    margin: 0;
  }

  img,
  figure {
    max-width: 100%;
  }
`;

const accessibilityStyles = () => styled.css`
  .visually-hidden {
    clip: rect(0 0 0 0);
    clip-path: inset(50%);
    height: 1px;
    overflow: hidden;
    position: absolute;
    white-space: nowrap;
    width: 1px;
  }

  body:not(.is-keyboard) {
    *:focus {
      outline: none;
    }
  }

  [hidden] {
    display: none !important;
  }
`;

const buttonStyles = () => styled.css`
  button {
    font-family: var(--font-secondary);
    font-size: inherit;
  }

  .button {
    font-size: 1rem;
    /* box-shadow: var(--box-shadow); */
    color: var(--white);
    padding: 0.75rem 1.25rem;
    transition: var(--transition);
    display: inline-flex;
    align-items: center;
    border-radius: 1.5rem;
    border: 1px solid var(--white);

    &:hover {
      /* box-shadow: var(--box-shadow-deep); */
      color: var(--white);
      background-color: var(--color-accent);
      border-color: var(--color-accent);
      color: var(--color-bg);
    }

    &--popup {
      &::after {
        content: '';
        height: 1em;
        width: 1em;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 13 14' width='13' height='14'%3E%3Cpath fill='%23B47B28' d='M1.25 3.25H0V12C0 12.6875 0.5625 13.25 1.25 13.25H10V12H1.25V3.25ZM11.25 0.75H3.75C3.0625 0.75 2.5 1.3125 2.5 2V9.5C2.5 10.1875 3.0625 10.75 3.75 10.75H11.25C11.9375 10.75 12.5 10.1875 12.5 9.5V2C12.5 1.3125 11.9375 0.75 11.25 0.75ZM11.25 9.5H3.75V2H11.25V9.5Z'/%3E%3C/svg%3E");
        background-size: contain;
        background-position: center center;
        background-repeat: no-repeat;
        margin-left: 0.5em;
      }
    }
  }
  button,
  .button {
    &[disabled] {
      pointer-events: none;
      cursor: not-allowed;
      opacity: 0.35;
    }
    &.loading {
      pointer-events: none;
      cursor: not-allowed;
      opacity: 1;
    }
  }

  .button-group {
    display: flex;
    flex-flow: wrap;
    margin: -0.25rem -0.5rem;

    button,
    .button {
      margin: 0.25rem 0.5rem;
    }
  }
`;

const spacingStyles = () => styled.css`
  .section-m-t {
    margin-top: var(--section-spacing);
  }
  .section-m-b {
    margin-bottom: var(--section-spacing);
  }
  .section-p-t {
    padding-top: var(--section-spacing);
  }
  .section-p-b {
    padding-bottom: var(--section-spacing);
  }
`;

const formStyles = () => styled.css`
  input[type='text'],
  input[type='number'],
  input[type='search'],
  input[type='tel'],
  input[type='email'],
  input[type='url'],
  input[type='password'],
  input[type='file'],
  select,
  textarea {
    padding: 1rem;
    width: 100%;
    border: 1px solid transparent;
    background: rgba(var(--color-p-rgb), 0.15);
    color: var(--color-p);
    font-family: var(--font-secondary);
    font-size: 1rem;
    border-radius: 0.25rem;
    /* padding: 1rem; */
    /* border: 1px solid var(--color-primary); */
    appearance: none;

    &[aria-invalid='true'] {
      border: 1px solid var(--color-error);
    }

    &::placeholder {
      opacity: 0.5;
      color: var(--color-p);
      transition: opacity var(--transition);
    }

    &:focus {
      &::placeholder {
        opacity: 0.35;
      }
    }
  }

  input[type='checkbox'],
  input[type='radio'],
  input[type='submit'] {
    width: auto;
    padding: 0;
  }

  input[type='search'] {
    &::-webkit-search-cancel-button {
      position: relative;
      right: 0;
      -webkit-appearance: none;
      height: 10px;
      width: 10px;
      background-image: url("data:image/svg+xml,%3Csvg width='16' height='16' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M14.36 15.78L8 9.41l-6.36 6.37-1.42-1.42L6.59 8 .22 1.64 1.64.22 8 6.59 14.36.23l1.41 1.41L9.41 8l6.36 6.36z' fill='%23000'/%3E%3C/svg%3E");
      background-size: contain;
      opacity: 0.25;
      cursor: pointer;
      transition: var(--transition);

      &:hover {
        opacity: 0.5;
      }
    }
    &:not(:focus)::-webkit-search-cancel-button {
      opacity: 0;
    }
  }

  textarea {
    resize: vertical;
    /* border: 1px solid var(--light-grey); */

    /* border-radius: var(--border-radius); */
  }

  .label {
    display: block;
    margin-bottom: 0.5rem;
    font-style: italic;
  }

  [aria-invalid='true'] {
    box-shadow: 0 0 3px var(--color-error);
  }

  .form-fields {
    display: flex;
    flex-flow: wrap;
    margin: calc(var(--form-field-gap) * -1);

    .form-field {
      padding: var(--form-field-gap);
      flex: 0 0 100%;
      max-width: 100%;

      &--half {
        flex: 0 0 50%;
        max-width: 50%;
      }

      &--submit {
        text-align: right;
      }
    }
  }

  .search-wrapper {
    position: relative;

    /* &::after {
      content: '';
      position: absolute;
      right: 1rem;
      top: 50%;
      transform: translateY(-50%);
      height: 1.5rem;
      width: 1.5rem;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 26 25' width='26' height='25'%3E%3Cpath fill='%23B47B28' d='M10.1044 17.4102C11.6698 17.4102 13.1858 16.9785 14.4878 16.1611L15.6271 15.4463L16.4563 14.416C17.5509 13.0566 18.1295 11.4277 18.1295 9.70508C18.1295 5.45605 14.5295 2 10.1044 2C5.68085 2 2.08191 5.45605 2.08191 9.70508C2.08191 13.9541 5.68085 17.4102 10.1044 17.4102ZM23.0874 25L15.6271 17.835C14.0399 18.8311 12.1426 19.4102 10.1044 19.4102C4.52323 19.4102 -0.000488281 15.0654 -0.000488281 9.70508C-0.000488281 4.34473 4.52323 0 10.1044 0C15.6876 0 20.2119 4.34473 20.2119 9.70508C20.2119 11.9395 19.4254 13.998 18.1035 15.6396L25.4687 22.7129L23.0874 25Z'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: center center;
      background-size: contain;
    } */

    input[type='search'] {
      width: 100%;
      padding-right: 3.5rem;
    }

    button[type='submit'] {
      height: 3.5rem;
      width: 3.5rem;
      position: absolute;
      padding: 1rem;
      right: 0;
      top: 50%;
      transform: translateY(-50%);

      svg {
        height: 100%;
        width: 100%;
        fill: var(--color-accent);
        transition: fill var(--transition);
      }

      &:hover svg {
        fill: var(--color-primary);
      }
    }

    .ais-SearchBox-reset {
      display: none;
    }
  }

  .select-wrapper {
    position: relative;

    &::after {
      content: '';
      position: absolute;
      right: 1rem;
      top: 50%;
      transform: translateY(-50%);
      height: 1.5rem;
      width: 1.5rem;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 0 24 24' width='24px' fill='%23fff'%3E%3Cpath d='M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: center center;
      background-size: contain;
    }

    select {
      width: 100%;
      padding-right: 2rem;
    }
  }

  .input-file-wrapper {
    position: relative;
    height: 100%;

    .input-file-icon {
      position: absolute;
      width: 1rem;
      right: 1rem;
      top: 50%;
      transform: translateY(-50%);
      z-index: 1;
      display: flex;
      pointer-events: none;
    }

    input[type='file'] {
      position: relative;
      padding-right: 3rem;
      cursor: pointer;

      &::file-selector-button,
      &::-webkit-file-upload-button {
        appearance: none;
        -webkit-appearance: none;
        color: transparent;
        border: 0;
        background: none;
        width: 3rem;
        height: 2rem;
        position: absolute;
        top: 50%;
        right: 0;
        transform: translateY(-50%);
      }
    }
  }

  // Skeleton
  .skeleton-bg {
    background: rgba(var(--white-rgb), 0.08);
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

const GlobalStyles = styled.createGlobalStyle`
  ${documentStyles()};
  ${accessibilityStyles()};
`;

export default GlobalStyles;
