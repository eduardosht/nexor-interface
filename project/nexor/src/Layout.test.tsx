import { render, screen } from '@testing-library/react';
import { initDesignSystem } from '@nexor/design-system';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { lightTheme } from './styles/theme';
import { Layout } from './Layout';

vi.mock('./components/Header', () => ({ Header: () => <header>Header</header> }));
vi.mock('./components/Footer', () => ({ Footer: () => <footer>Footer</footer> }));

const { DesignSystemRoot } = initDesignSystem({ brand: 'nexor' });

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <MemoryRouter>
      <ThemeProvider theme={lightTheme}>
        <DesignSystemRoot>{children}</DesignSystemRoot>
      </ThemeProvider>
    </MemoryRouter>
  );
}

describe('Layout', () => {
  it('renderiza header, outlet e footer', () => {
    render(<Layout />, { wrapper: Wrapper });
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('renderiza link para pular direto ao conteúdo principal', () => {
    render(<Layout />, { wrapper: Wrapper });
    expect(screen.getByRole('link', { name: /pular para o conteúdo principal/i })).toHaveAttribute('href', '#main-content');
  });
});
