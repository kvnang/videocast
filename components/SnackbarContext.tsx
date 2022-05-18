import React, { useCallback, useState } from 'react';

interface SnackbarProps {
  message?: string;
  status?: string;
}
interface ContextProps {
  snackbar: SnackbarProps | null;
  addSnackbar: Function;
  removeSnackbar: Function;
}

interface ProviderProps {
  children?: React.ReactNode;
}

export const SnackbarContext = React.createContext<ContextProps>({
  snackbar: null,
  addSnackbar: () => {},
  removeSnackbar: () => {},
});

export function SnackbarProvider({ children }: ProviderProps) {
  const [snackbar, setSnackbar] = useState<SnackbarProps | null>(null);

  const addSnackbar = (message?: string, status?: string) =>
    setSnackbar({ message, status });
  const removeSnackbar = () => setSnackbar(null);

  const contextValue = {
    snackbar,
    addSnackbar: useCallback(
      (message, status) => addSnackbar(message, status),
      []
    ),
    removeSnackbar: useCallback(() => removeSnackbar(), []),
  };
  return (
    <SnackbarContext.Provider value={contextValue}>
      {children}
    </SnackbarContext.Provider>
  );
}
