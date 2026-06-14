import type { StorybookConfig } from '@storybook/react-vite';
import { fileURLToPath, URL } from 'node:url';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  viteFinal: async (config) => {
    config.resolve ??= {};
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      '@nexor/design-system': fileURLToPath(new URL('../src/index.ts', import.meta.url)),
      react: fileURLToPath(new URL('../node_modules/react', import.meta.url)),
      'react-dom': fileURLToPath(new URL('../node_modules/react-dom', import.meta.url)),
      'styled-components': fileURLToPath(new URL('../node_modules/styled-components', import.meta.url)),
    };
    config.resolve.dedupe = ['react', 'react-dom', 'styled-components'];
    config.server ??= {};
    config.server.fs ??= {};
    config.server.fs.allow = [
      ...(config.server.fs.allow ?? []),
      fileURLToPath(new URL('../../..', import.meta.url)),
    ];
    return config;
  },
};

export default config;
