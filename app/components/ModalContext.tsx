import * as React from 'react';

interface ModalProps {
  id?: string;
  modalOpen: Boolean;
  modalContent?: {
    youtube?: string | null;
    vimeo?: string | null;
    image?: string | null;
  };
  children?: any;
  wrapperClassName?: string;
}

interface ModalContextProps {
  modal: ModalProps;
  setModal: Function;
}

const modalDefaults = {
  id: '',
  modalOpen: false,
  modalContent: undefined,
  children: undefined,
  wrapperClassName: '',
};

export const ModalContext = React.createContext<ModalContextProps>({
  modal: modalDefaults,
  setModal: () => {},
});

export function ModalProvider({ children }: any) {
  const [modal, setModal] = React.useState(modalDefaults);

  return (
    <ModalContext.Provider
      // eslint-disable-next-line react/jsx-no-constructed-context-values
      value={{ modal, setModal }}
    >
      {children}
    </ModalContext.Provider>
  );
}
