import type { AppProps } from 'next/app';
import { UserProvider } from '@auth0/nextjs-auth0';
import { Toaster } from 'react-hot-toast';
import NextNProgress from 'nextjs-progressbar';
import Header from '../components/Header';
import Modal from '../components/Modal';
import { ModalProvider } from '../components/ModalContext';
import 'normalize.css';
import '@fontsource/cabin/variable.css';
import '../styles/globals.css';
import Footer from '../components/Footer';
// import GlobalStyles from '../styles/GlobalStyles';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <UserProvider>
      <ModalProvider>
        <NextNProgress color="#6366f1" showOnShallow={false} />
        <div className="flex flex-col min-h-screen">
          <Header />
          <div className="flex-1">
            <Component {...pageProps} />
          </div>
          <Footer />
        </div>
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
            duration: 5000,
          }}
        />
      </ModalProvider>
    </UserProvider>
  );
}
export default MyApp;
