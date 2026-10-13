import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import { reactRouter } from '@react-router/dev/vite';
import babel from '@rolldown/plugin-babel';

const designSystemPath = fileURLToPath(new URL('../packages/design-system/src/index.ts', import.meta.url));
const projectRootPath = fileURLToPath(new URL('../..', import.meta.url));

export default defineConfig({
  base: '/',
  plugins: [
    babel({
      plugins: [['babel-plugin-styled-components', { displayName: false, ssr: true }]],
    }),
    ...(process.env.VITEST ? [] : [reactRouter()]),
  ],
  envPrefix: ['VITE_', 'DISABLE_'],
  resolve: {
    dedupe: ['react', 'react-dom', 'styled-components'],
    alias: {
      '@nexor/design-system': designSystemPath,
      'styled-components': fileURLToPath(new URL('./node_modules/styled-components', import.meta.url)),
    },
  },
  ssr: {
    noExternal: ['styled-components'],
  },
  server: {
    host: '0.0.0.0',
    port: 4174,
    strictPort: true,
    fs: {
      allow: [projectRootPath],
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 4175,
    strictPort: true,
  },
});
