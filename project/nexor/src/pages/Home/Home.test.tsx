import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { lightTheme } from '../../styles/theme';
import { Home } from './index';

vi.mock('../../sections', () => ({
  Contato: () => <section>Contato</section>,
  Depoimentos: () => <section>Depoimentos</section>,
  Hero: () => <section aria-label="hero">Hero</section>,
  Legal: () => <section>Legal</section>,
  ParceirosTeaserSection: () => <section>ParceirosTeaserSection</section>,
  Produtos: () => <section>Produtos</section>,
  QuemSomos: () => <section>QuemSomos</section>,
}));

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <MemoryRouter>
      <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>
    </MemoryRouter>
  );
}

describe('Home', () => {
  it('renderiza o main com todas as seções', () => {
    render(<Home />, { wrapper: Wrapper });
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByText('Hero')).toBeInTheDocument();
    expect(screen.getByText('Produtos')).toBeInTheDocument();
  });
});
