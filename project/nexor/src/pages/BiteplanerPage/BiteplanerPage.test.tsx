import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { lightTheme } from '../../styles/theme';
import { BiteplanerPage } from './index';

function renderPage() {
  return render(
    <MemoryRouter>
      <ThemeProvider theme={lightTheme}>
        <BiteplanerPage />
      </ThemeProvider>
    </MemoryRouter>,
  );
}

describe('BiteplanerPage', () => {
  it('uses the shared main-content landmark for skip navigation', () => {
    renderPage();
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content');
  });

  it('renders the Biteplaner hero without the FAQ product image', () => {
    renderPage();
    expect(screen.getAllByText('Biteplaner').length).toBeGreaterThan(0);
    expect(screen.queryByRole('img', { name: /biteplaner/i })).not.toBeInTheDocument();
  });

  it('positions Biteplaner as a guided athlete eligibility journey', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /proteção personalizada para atletas de impacto/i })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /iniciar elegibilidade/i })).toHaveLength(2);
    expect(screen.getByRole('link', { name: /ver como funciona/i })).toHaveAttribute('href', '#como-funciona');
  });

  it('renders the approved journey with payment after clinical eligibility', () => {
    renderPage();
    expect(screen.getAllByText('Conta Nexor').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Pre-check Biteplaner').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Dentista licenciado').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Pagamento após aptidão').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Produção personalizada').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Adaptação e acompanhamento').length).toBeGreaterThan(0);
  });

  it('renders the process journey map container', () => {
    renderPage();
    expect(screen.getByTestId('biteplaner-process-journey')).toBeInTheDocument();
  });

  it('renders athlete storytelling, use cases, and comparison content', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /feito para a rotina real de treino/i })).toBeInTheDocument();
    expect(screen.getByText(/esportes de combate/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /genérico vs biteplaner/i })).toBeInTheDocument();
    expect(screen.getByText(/sem avaliação profissional/i)).toBeInTheDocument();
    expect(screen.getByText(/avaliação odontológica antes da compra/i)).toBeInTheDocument();
  });

  it('renders educational and trust sections without absolute medical claims', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /educação para decidir melhor/i })).toBeInTheDocument();
    expect(screen.getByText(/pode auxiliar no conforto/i)).toBeInTheDocument();
    expect(screen.queryByText(/garante proteção/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/previne lesões/i)).not.toBeInTheDocument();
  });

  it('renders the automatic customer comments carousel', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /clientes que passaram pela jornada/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/carrossel autom/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Marina Costa/i).length).toBeGreaterThan(1);
    expect(screen.getAllByText(/avalia/i).length).toBeGreaterThan(0);
  });

  it('renders FAQ section', () => {
    renderPage();
    expect(screen.getByText(/perguntas frequentes/i)).toBeInTheDocument();
    expect(screen.getByText(/visão do Biteplaner/i)).toBeInTheDocument();
    expect(screen.getByText(/e se eu não for considerado apto/i)).toBeInTheDocument();
  });
});
