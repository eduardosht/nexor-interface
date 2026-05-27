import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { lightTheme } from '../../styles/theme';
import { ConhecaOBiteplaner } from './index';

function renderPage() {
  return render(
    <MemoryRouter>
      <ThemeProvider theme={lightTheme}>
        <ConhecaOBiteplaner />
      </ThemeProvider>
    </MemoryRouter>,
  );
}

describe('ConhecaOBiteplaner', () => {
  it('renders a QR campaign landing page without embedding a QR code', () => {
    renderPage();

    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content');
    expect(screen.getByRole('heading', { name: /conheça o biteplaner/i })).toBeInTheDocument();
    expect(screen.getByText(/você chegou aqui pelo qr code/i)).toBeInTheDocument();
    expect(screen.getByText(/protetor bucal premium/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /iniciar minha jornada/i })).toHaveAttribute('href', '/cadastro');
    expect(screen.queryByTestId('biteplaner-print-qr-code')).not.toBeInTheDocument();
  });
});
