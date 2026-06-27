import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { lightTheme } from '../../styles/theme';
import { Privacidade } from './index';

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <MemoryRouter>
      <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>
    </MemoryRouter>
  );
}

describe('Privacidade (Nexor)', () => {
  it('renderiza o título h1', () => {
    render(<Privacidade />, { wrapper: Wrapper });
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/política de privacidade/i);
  });

  it('renderiza pelo menos uma seção h2', () => {
    render(<Privacidade />, { wrapper: Wrapper });
    expect(screen.getAllByRole('heading', { level: 2 }).length).toBeGreaterThan(0);
  });

  it('não publica placeholders', () => {
    render(<Privacidade />, { wrapper: Wrapper });
    expect(screen.queryByText(/\[[^\]]+\]/)).not.toBeInTheDocument();
  });

  it('declara canal LGPD direto e direitos de exportação, correção, exclusão, portabilidade e revogação', () => {
    render(<Privacidade />, { wrapper: Wrapper });

    expect(screen.getByText(/contato@nexoradvance\.com\.br/i)).toBeInTheDocument();
    expect(screen.getByText(/assuntos sobre lgpd/i)).toBeInTheDocument();
    expect(screen.getByText(/exportar uma cópia dos dados/i)).toBeInTheDocument();
    expect(screen.getByText(/correção de dados incompletos/i)).toBeInTheDocument();
    expect(screen.getByText(/anonimização, bloqueio ou eliminação/i)).toBeInTheDocument();
    expect(screen.getByText(/portabilidade quando aplicável/i)).toBeInTheDocument();
    expect(screen.getByText(/revogação de consentimentos/i)).toBeInTheDocument();
  });

  it('cobre dados de conta, documentos, pagamentos, dados clínicos, notificações e retenção por categoria', () => {
    render(<Privacidade />, { wrapper: Wrapper });

    expect(screen.getByText(/cpf, cnpj, razão social/i)).toBeInTheDocument();
    expect(screen.getAllByText(/stripe/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/dados clínicos e de saúde/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/leitura de notificações/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/formulários clínicos do biteplaner/i)).toBeInTheDocument();
    expect(screen.getByText(/120 meses/i)).toBeInTheDocument();
    expect(screen.getByText(/60 meses/i)).toBeInTheDocument();
  });

  it('explica exportação em JSON e remoção com anonimização ou bloqueio quando necessário', () => {
    render(<Privacidade />, { wrapper: Wrapper });

    expect(screen.getByText(/json estruturado/i)).toBeInTheDocument();
    expect(screen.getByText(/não deve conter senha, tokens secretos/i)).toBeInTheDocument();
    expect(screen.getByText(/conta removida sem pendências operacionais relevantes/i)).toBeInTheDocument();
    expect(screen.getByText(/conta com ordens, pagamentos, produção ou obrigações pendentes/i)).toBeInTheDocument();
  });
});
