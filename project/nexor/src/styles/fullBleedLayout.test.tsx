import { render, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { lightTheme } from './theme';
import { Contato, Depoimentos, Legal, ParceirosTeaserSection, Produtos, QuemSomos } from '../sections';
import { Sobre } from '../pages/Sobre';
import { Parceiros } from '../pages/Parceiros';
import { BiteplanerPage } from '../pages/BiteplanerPage';

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <MemoryRouter>
      <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>
    </MemoryRouter>
  );
}

function expectNoViewportWidthHack(ui: React.ReactElement) {
  render(ui, { wrapper: Wrapper });

  const styles = document.head.textContent ?? '';

  expect(styles).not.toContain('width:100vw');
  expect(styles).not.toContain('50vw');
}

afterEach(() => {
  cleanup();
  document.head.innerHTML = '';
});

describe('public layout full-bleed sections', () => {
  it('does not rely on viewport width hacks in landing sections', () => {
    expectNoViewportWidthHack(<QuemSomos />);
    expectNoViewportWidthHack(<Produtos />);
    expectNoViewportWidthHack(<ParceirosTeaserSection />);
    expectNoViewportWidthHack(<Depoimentos />);
    expectNoViewportWidthHack(<Legal />);
    expectNoViewportWidthHack(<Contato />);
  });

  it('does not rely on viewport width hacks in public pages', () => {
    expectNoViewportWidthHack(<Sobre />);
    expectNoViewportWidthHack(<Parceiros />);
    expectNoViewportWidthHack(<BiteplanerPage />);
  });
});
