import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { describe, expect, it } from 'vitest';
import { lightTheme } from '../../../styles/theme';
import { BiteplanerHome } from './index';

function renderPage() {
  return render(
    <MemoryRouter>
      <ThemeProvider theme={lightTheme}>
        <BiteplanerHome />
      </ThemeProvider>
    </MemoryRouter>
  );
}

describe('BiteplanerHome', () => {
  it('shows current Biteplaner shortcuts without the retired finance onboarding entry', () => {
    renderPage();

    expect(screen.getByRole('heading', { name: /home biteplaner/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /comprar biteplaner/i })).toHaveAttribute('href', '/painel/compra');
    expect(screen.getByRole('link', { name: /ver ordens/i })).toHaveAttribute('href', '/painel/biteplaner/ordens');
    expect(screen.getByText(/produção com fornecedores externos fora da plataforma/i)).toBeInTheDocument();
    expect(screen.queryByText(/cadastro financeiro|asaas|split/i)).not.toBeInTheDocument();
  });
});