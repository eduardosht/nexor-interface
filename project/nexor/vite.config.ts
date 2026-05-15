import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const designSystemPath = fileURLToPath(new URL('../packages/design-system/src/index.ts', import.meta.url));
const projectRootPath = fileURLToPath(new URL('../..', import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom', 'styled-components'],
    alias: {
      '@nexor/design-system': designSystemPath,
      react: fileURLToPath(new URL('./node_modules/react', import.meta.url)),
      'react-dom': fileURLToPath(new URL('./node_modules/react-dom', import.meta.url)),
      'styled-components': fileURLToPath(new URL('./node_modules/styled-components', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    fs: {
      allow: [projectRootPath],
    },
  },
});
