import { registerRoot } from 'remotion';
import { RemotionVideo } from './Video';

// Replicate global styles to ensure consistency
import 'normalize.css';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/700.css';
import '@fontsource/source-sans-pro/400.css';
import '@fontsource/source-sans-pro/700.css';
import '@fontsource/open-sans/400.css';
import '@fontsource/open-sans/700.css';
import '../styles/globals.css';

registerRoot(RemotionVideo);
