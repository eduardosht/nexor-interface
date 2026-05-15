import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { MemoryRouter } from 'react-router-dom';
import { lightTheme } from './styles/theme';
import { Home } from './pages/Home';

vi.mock('./sections', () => ({
  Contato: () => <section>Contato</section>,
  Depoimentos: () => <section>Depoimentos</section>,
  FullBleedBanner: () => <div />,
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

describe('App (Nexor)', () => {
  it('renderiza as seções principais', () => {
    render(<Home />, { wrapper: Wrapper });
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByText('Hero')).toBeInTheDocument();
  });
});
