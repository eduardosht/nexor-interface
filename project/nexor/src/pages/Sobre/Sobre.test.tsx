import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { lightTheme } from '../../styles/theme';
import { Sobre } from './index';

function renderSobre() {
  return render(
    <MemoryRouter>
      <ThemeProvider theme={lightTheme}>
        <Sobre />
      </ThemeProvider>
    </MemoryRouter>
  );
}

describe('Sobre', () => {
  it('renders mission statement heading', () => {
    renderSobre();
    expect(screen.getByRole('heading', { name: /missão/i })).toBeInTheDocument();
  });

  it('renders three pillars', () => {
    renderSobre();
    expect(screen.getByText('Precisão')).toBeInTheDocument();
    expect(screen.getByText('Tecnologia')).toBeInTheDocument();
    expect(screen.getByText('Acompanhamento')).toBeInTheDocument();
  });

  it('renders Nossa Abordagem section', () => {
    renderSobre();
    expect(screen.getByText(/nossa abordagem/i)).toBeInTheDocument();
  });

  it('renders CTA links to /biteplaner and /', () => {
    renderSobre();
    const links = screen.getAllByRole('link');
    const hrefs = links.map((l) => l.getAttribute('href'));
    expect(hrefs).toContain('/biteplaner');
    expect(hrefs).toContain('/');
  });
});
