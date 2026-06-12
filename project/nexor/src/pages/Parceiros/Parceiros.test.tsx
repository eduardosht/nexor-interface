import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { lightTheme } from '../../styles/theme';
import { Parceiros } from './index';

function renderPage() {
  return render(
    <MemoryRouter>
      <ThemeProvider theme={lightTheme}>
        <Parceiros />
      </ThemeProvider>
    </MemoryRouter>
  );
}

describe('Parceiros', () => {
  it('renders three partner tracks', () => {
    renderPage();
    expect(screen.getByText('Dentista Licenciado')).toBeInTheDocument();
    expect(screen.getAllByText(/academia.*coach/i).length).toBeGreaterThan(0);
    expect(screen.getByText('Laboratório Licenciado')).toBeInTheDocument();
  });

  it('uses licensing and device language consistently', () => {
    renderPage();

    expect(screen.getByRole('heading', { name: /seja licenciado pela nexor/i })).toBeInTheDocument();
    expect(screen.getByText(/três trilhas de licenciamento/i)).toBeInTheDocument();
    expect(screen.getAllByText(/dispositivo biteplaner/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/atuação como parceiro licenciado/i)).toBeInTheDocument();
    expect(screen.getByText(/atuação como dentista licenciado/i)).toBeInTheDocument();
    expect(screen.getAllByText(/atuação como laboratório licenciado/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/moldeiras|moldagem/i)).not.toBeInTheDocument();
  });

  it('renders CTA links to /cadastro with tipo param', () => {
    renderPage();
    const links = screen.getAllByRole('link');
    const hrefs = links.map((l) => l.getAttribute('href'));
    expect(hrefs.some((h) => h?.includes('/cadastro?tipo=dentista'))).toBe(true);
    expect(hrefs.some((h) => h?.includes('/cadastro?tipo=parceiro'))).toBe(true);
    expect(hrefs.some((h) => h?.includes('/cadastro?tipo=laboratório'))).toBe(true);
  });

  it('exposes stable anchors for each partner track', () => {
    const { container } = renderPage();

    expect(container.querySelector('#dentistas')).toHaveTextContent('Dentista Licenciado');
    expect(container.querySelector('#parceiros')).toHaveTextContent('Academia / Coach Licenciado');
    expect(container.querySelector('#laboratórios')).toHaveTextContent('Laboratório Licenciado');
  });
});
