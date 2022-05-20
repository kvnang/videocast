import { CSSProperties, useContext, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useOnClickOutside from '../hooks/useOnClickOutside';
import { ModalContext } from './ModalContext';

const contentStyles: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  maxHeight: '100%',
  width: '100%',
  height: '100%',
  margin: 'auto',
  maxWidth: '100%',
  pointerEvents: 'none',
};

const closeStyles: CSSProperties = {
  position: 'absolute',
  right: '1rem',
  top: '1rem',
  cursor: 'pointer',
  transition: '0.25s ease-in-out',
  background: 'none',
  border: 'none',
  fontSize: '3rem',
  lineHeight: 1,
  fontWeight: 300,
  height: '3rem',
  width: '3rem',
};

const modalVariants = {
  initial: { opacity: 0 },
  open: { opacity: 1 },
  exit: { opacity: 0 },
};
const modalContentVariants = {
  initial: { opacity: 0, y: 10 },
  open: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
};

export default function Modal() {
  const { modal, setModal } = useContext(ModalContext);
  const { id, modalOpen, modalContent, children, wrapperClassName } = modal;

  const setModalOpen = (value: boolean) => {
    setModal({ ...modal, modalOpen: value });
  };

  const modalContentRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(modalContentRef, () => setModalOpen(false));

  return (
    <AnimatePresence>
      {modalOpen && (
        <motion.div
          key="modal"
          id={id || ''}
          className="fixed left-1/2 top-0 w-screen h-screen bg-black bg-opacity-50 backdrop-blur-sm pt-16 pb-16 z-40 -translate-x-[50%]"
          role="dialog"
          initial="initial"
          animate="open"
          exit="exit"
          variants={modalVariants}
        >
          <motion.div
            className={`modal__content container ${wrapperClassName || ''}`}
            ref={modalContentRef}
            style={{
              ...contentStyles,
            }}
            variants={modalContentVariants}
            transition={{ type: 'spring' }}
          >
            {modalContent?.youtube && (
              <div className="modal__youtube iframe-wrapper">
                <iframe
                  width="1920"
                  height="1080"
                  src={`https://www.youtube-nocookie.com/embed/${modalContent.youtube}`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ boxShadow: '0 3px 6px rgba(0, 0, 0, 0.16)' }}
                />
              </div>
            )}
            {modalContent?.vimeo && (
              <div className="modal__vimeo iframe-wrapper">
                <iframe
                  width="1920"
                  height="1080"
                  src={`https://player.vimeo.com/video/${modalContent.vimeo}?autoplay=1`}
                  title="Vimeo video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ boxShadow: '0 3px 6px rgba(0, 0, 0, 0.16)' }}
                />
              </div>
            )}
            {modalContent?.image && (
              <div
                className="modal__image"
                style={{
                  width: '100%',
                  height: 'inherit',
                  textAlign: 'center',
                }}
              >
                <img
                  src={modalContent.image}
                  alt=""
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    boxShadow: '0 3px 6px rgba(0, 0, 0, 0.16)',
                  }}
                />
              </div>
            )}
            <div
              className="modal__children"
              style={{
                margin: 'auto',
                pointerEvents: 'auto',
                maxWidth: '100%',
                maxHeight: '100%',
                display: 'flex',
                overflow: 'hidden',
              }}
            >
              {children}
            </div>
          </motion.div>
          <button
            type="button"
            className="modal__close"
            onClick={() => setModalOpen(false)}
            style={closeStyles}
          >
            &times;
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
