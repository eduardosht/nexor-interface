import { fireEvent, render, screen } from '@testing-library/react';
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
    expect(screen.getByRole('heading', { name: /proteção, conforto e performance/i })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /iniciar elegibilidade/i })).toHaveLength(2);
    expect(screen.getByRole('link', { name: /ver como funciona/i })).toHaveAttribute('href', '#como-funciona');
  });

  it('renders the approved journey with payment after clinical eligibility', () => {
    renderPage();
    expect(screen.getAllByText('Conta Nexor').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Pré-consulta').length).toBeGreaterThan(0);
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
    expect(screen.getByRole('heading', { name: /feito para a rotina real de treino e competições/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /esportes de combate/i })).toBeInTheDocument();
    const strengthDumbbellIcon = screen.getByTestId('biteplaner-strength-dumbbell-icon');
    const strengthZapIcon = screen.getByTestId('biteplaner-strength-zap-icon');

    expect(screen.getByTestId('biteplaner-combat-glove-icon')).toBeInTheDocument();
    expect(strengthDumbbellIcon).toBeInTheDocument();
    expect(strengthZapIcon).toBeInTheDocument();
    expect(strengthDumbbellIcon).toHaveAttribute('width', '48');
    expect(strengthDumbbellIcon).toHaveAttribute('height', '48');
    expect(strengthZapIcon).toHaveAttribute('width', '48');
    expect(strengthZapIcon).toHaveAttribute('height', '48');
    expect(screen.getByTestId('biteplaner-team-sport-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('biteplaner-team-strength-energy-icon')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /genérico vs biteplaner/i })).toBeInTheDocument();
    expect(screen.getByText(/adequação para treinos e competições de lutas/i)).toBeInTheDocument();
    expect(screen.getAllByText(/^alta$/i).length).toBeGreaterThan(0);
  });

  it('renders the four-column comparison table with collapsed and expanded rows', () => {
    renderPage();

    expect(screen.getByRole('columnheader', { name: /^critério$/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /protetor genérico/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /protetor tradicional/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /^biteplaner$/i })).toBeInTheDocument();
    expect(screen.getByText(/conforto em uso prolongado/i)).toBeInTheDocument();
    expect(screen.queryByText(/interferência na fala/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /mostrar comparação completa/i }));

    expect(screen.getByText(/interferência na fala/i)).toBeInTheDocument();
    expect(screen.getByText(/integração com plataforma de dados/i)).toBeInTheDocument();
    expect(screen.getByText(/processo contínuo de aperfeiçoamento/i)).toBeInTheDocument();
  });

  it('wraps the comparison table in a horizontal scroll region for narrow screens', () => {
    renderPage();

    const scrollRegion = screen.getByRole('region', { name: /tabela comparativa com rolagem horizontal/i });
    expect(scrollRegion).toContainElement(screen.getByRole('table'));
  });

  it('renders educational and trust sections without absolute medical claims', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /educação para decidir melhor/i })).toBeInTheDocument();
    expect(screen.getByText(/pode auxiliar no conforto e prevenção/i)).toBeInTheDocument();
    expect(screen.queryByText(/garante proteção/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/previne lesões/i)).not.toBeInTheDocument();
  });

  it('renders the automatic customer comments carousel', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /clientes satisfeitos com o biteplaner/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/carrossel autom/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Marina Costa/i).length).toBeGreaterThan(1);
    expect(screen.getAllByText(/o biteplaner ficou firme/i).length).toBeGreaterThan(0);
  });

  it('renders FAQ section', () => {
    renderPage();
    expect(screen.getByText(/perguntas frequentes/i)).toBeInTheDocument();
    expect(screen.getByText(/o que é Biteplaner/i)).toBeInTheDocument();
    expect(screen.getByText(/e se eu não for considerado apto/i)).toBeInTheDocument();
  });
});
