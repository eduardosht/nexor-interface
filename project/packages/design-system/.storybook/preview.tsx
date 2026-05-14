import type { Preview } from '@storybook/react';
import React from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { DesignSystemProvider, getBrandTokens, type DesignSystemBrand } from '../src';

const GlobalStyle = createGlobalStyle<{ $brand: DesignSystemBrand }>`
  *, *::before, *::after { box-sizing: border-box; }

  html, body, #storybook-root {
    margin: 0;
    min-height: 100%;
  }

  body {
    color: ${({ $brand }) => getBrandTokens($brand).colors.text};
    font-family: ${({ $brand }) => getBrandTokens($brand).fonts.body};
    -webkit-font-smoothing: antialiased;
  }
`;

const CanvasWrap = styled.div<{ $brand: DesignSystemBrand }>`
  width: 100%;
  padding: 0;
  color: ${({ $brand }) => getBrandTokens($brand).colors.text};
`;

const preview: Preview = {
  globalTypes: {
    brand: {
      name: 'Brand',
      description: 'Marca ativa do design system',
      defaultValue: 'biteplaner',
      toolbar: {
        icon: 'paintbrush',
        items: [
          { value: 'biteplaner', title: 'Biteplaner' },
          { value: 'nexor', title: 'Nexor' },
        ],
      },
    },
  },
  parameters: {
    controls: {
      expanded: true,
    },
    layout: 'padded',
    options: {
      storySort: {
        order: ['Introduction', 'Foundations', 'Components'],
      },
    },
  },
  decorators: [
    (Story, context) => {
      const brand = context.globals.brand as DesignSystemBrand;
      return (
        <DesignSystemProvider brand={brand}>
          <GlobalStyle $brand={brand} />
          <CanvasWrap $brand={brand}>
            <Story />
          </CanvasWrap>
        </DesignSystemProvider>
      );
    },
  ],
};

export default preview;
