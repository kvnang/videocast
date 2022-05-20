import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, './src/index.ts'),
      name: 'index',
      formats: ['umd'],
      fileName: (format) => 'worker.js',
    },
    sourcemap: true,
  },
});
