import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { BiteplanerCard } from './BiteplanerCard';
import { lightTheme } from '../../styles/theme';

function renderCard() {
  return render(
    <MemoryRouter>
      <ThemeProvider theme={lightTheme}>
        <BiteplanerCard />
      </ThemeProvider>
    </MemoryRouter>
  );
}

describe('BiteplanerCard', () => {
  it('aponta o link para /biteplaner', () => {
    renderCard();
    const link = screen.getByRole('link', { name: /biteplaner/i });
    expect(link).toHaveAttribute('href', '/biteplaner');
  });

  it('renderiza descrição do produto', () => {
    renderCard();
    expect(screen.getAllByText(/moldagem/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/personalizada/i).length).toBeGreaterThan(0);
  });
});
