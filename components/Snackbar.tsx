import { AnimatePresence, domAnimation, LazyMotion, m } from 'framer-motion';
import React, { useContext, useEffect } from 'react';
import styled from 'styled-components';
import { SnackbarContext } from './SnackbarContext';

// const loadFeatures = () =>
//   import('../utils/features').then((res) => res.default);

const SnackbarStyles = styled.div`
  position: fixed;
  z-index: 999999999;
  left: 50%;
  transform: translateX(-50%);
  bottom: 3rem;
  width: calc(100% - 40px);
  display: flex;
  justify-content: center;

  .inner {
    background: rgba(var(--color-p-rgb), 0.15);
    backdrop-filter: blur(10px);
    padding: 1rem 2rem 1rem 1rem;
    position: relative;
    border-bottom: 3px solid var(--medium-grey);
    box-shadow: var(--box-shadow);
  }

  &.error {
    .inner {
      border-color: var(--color-error);
    }
    // color: var(--color-error);
  }

  &.success {
    .inner {
      border-color: var(--color-success);
    }
  }

  p {
    color: inherit;
  }

  .close {
    position: absolute;
    top: 0;
    right: 0;
    padding: 0.5rem;
    font-size: 1.5rem;
    line-height: 0.75;
    color: var(--color-p);
    transition: var(--transition);

    &:hover {
      color: var(--color-accent);
    }
  }
`;

export default function Snackbar() {
  const { snackbar, addSnackbar, removeSnackbar } = useContext(SnackbarContext);

  useEffect(() => {
    if (snackbar) {
      const timer1 = setTimeout(() => removeSnackbar(), 8000);
      return () => {
        clearTimeout(timer1);
      };
    }
  }, [snackbar, removeSnackbar]);

  return (
    <LazyMotion features={domAnimation}>
      <AnimatePresence>
        {snackbar && (
          <SnackbarStyles
            className={`snackbar ${snackbar.status}`}
            role="alert"
          >
            <m.div
              className="inner"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <button
                type="button"
                className="close"
                onClick={() => removeSnackbar()}
              >
                &times;
              </button>
              <p>{snackbar.message}</p>
            </m.div>
          </SnackbarStyles>
        )}
      </AnimatePresence>
    </LazyMotion>
  );
}
