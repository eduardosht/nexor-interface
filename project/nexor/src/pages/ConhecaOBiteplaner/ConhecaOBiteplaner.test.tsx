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
  it('renders an informative care guide based on the mouthguard PDF', () => {
    renderPage();

    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content');
    expect(screen.getByRole('heading', { name: /cuidados com o protetor bucal esportivo/i })).toBeInTheDocument();
    expect(screen.getByText(/lugar de protetor bucal é em boca/i)).toBeInTheDocument();
    expect(screen.getByText(/não lavar em água quente/i)).toBeInTheDocument();
    expect(screen.getByText(/nunca compartilhe seu protetor/i)).toBeInTheDocument();
    expect(screen.getByText(/protetor bucal não é eterno/i)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /iniciar minha jornada/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /ver página completa/i })).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/atleta usando protetor bucal biteplaner/i)).not.toBeInTheDocument();
    expect(screen.queryByTestId('biteplaner-print-qr-code')).not.toBeInTheDocument();
  });
});
