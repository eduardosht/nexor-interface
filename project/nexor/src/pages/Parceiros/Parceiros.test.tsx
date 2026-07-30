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
  it('renders the public partner and dentist tracks', () => {
    renderPage();
    expect(screen.getByText('Dentista Licenciado')).toBeInTheDocument();
    expect(screen.getAllByText(/academia.*coach/i).length).toBeGreaterThan(0);
    expect(screen.queryByText('Laboratório Licenciado')).not.toBeInTheDocument();
  });

  it('keeps production as an externally managed supplier flow', () => {
    renderPage();

    expect(screen.getByRole('heading', { name: /seja licenciadopela nexor/i })).toBeInTheDocument();
    expect(screen.getByText(/trilhas de licenciamento para parceiros e dentistas/i)).toBeInTheDocument();
    expect(screen.getByText(/fornecedores administrados pela operação nexor/i)).toBeInTheDocument();
    expect(screen.getAllByText(/dispositivo biteplaner/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/atuação como parceiro licenciado/i)).toBeInTheDocument();
    expect(screen.getByText(/atuação como dentista licenciado/i)).toBeInTheDocument();
    expect(screen.queryByText(/moldeiras|moldagem/i)).not.toBeInTheDocument();
  });

  it('renders CTA links only for public registration tracks', () => {
    renderPage();
    const links = screen.getAllByRole('link');
    const hrefs = links.map((link) => link.getAttribute('href'));
    expect(hrefs.some((href) => href?.includes('/cadastro?tipo=dentista'))).toBe(true);
    expect(hrefs.some((href) => href?.includes('/cadastro?tipo=parceiro'))).toBe(true);
    expect(hrefs.some((href) => href?.includes('/cadastro?tipo=laboratório'))).toBe(false);
  });

  it('exposes stable anchors for public tracks only', () => {
    const { container } = renderPage();

    expect(container.querySelector('#dentistas')).toHaveTextContent('Dentista Licenciado');
    expect(container.querySelector('#parceiros')).toHaveTextContent('Academia / Coach Licenciado');
    expect(container.querySelector('#laboratórios')).not.toBeInTheDocument();
  });
});
