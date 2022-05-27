import type { AppProps } from 'next/app';
import { UserProvider } from '@auth0/nextjs-auth0';
import { Toaster } from 'react-hot-toast';
import NextNProgress from 'nextjs-progressbar';
import Header from '../components/Header';
import Modal from '../components/Modal';
import { ModalProvider } from '../components/ModalContext';
import 'normalize.css';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/700.css';
import '@fontsource/source-sans-pro/400.css';
import '@fontsource/source-sans-pro/700.css';
import '@fontsource/open-sans/400.css';
import '@fontsource/open-sans/700.css';
import '@fontsource/cabin/variable.css';
import '../styles/globals.css';
// import GlobalStyles from '../styles/GlobalStyles';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <UserProvider>
      <ModalProvider>
        <NextNProgress color="#6366f1" showOnShallow={false} />
        <Header />
        <Component {...pageProps} />
        <Modal />
        <Toaster
          toastOptions={{
            style: {
              background: '#334155',
              color: '#fff',
            },
            success: {
              iconTheme: {
                primary: '#0d9488',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </ModalProvider>
    </UserProvider>
  );
}
export default MyApp;
