import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
  it('renderiza o título e os cards de perfil', () => {
    render(<Privacidade />, { wrapper: Wrapper });

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/políticas de privacidade/i);
    expect(screen.getByRole('button', { name: /geral nexor/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /usuário biteplaner/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /dentista licenciado/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /parceiro licenciado/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /laboratório licenciado/i })).toBeInTheDocument();
  });

  it('renderiza política específica do usuário Biteplaner com dados sensíveis de saúde', async () => {
    const user = userEvent.setup();
    render(<Privacidade />, { wrapper: Wrapper });

    await user.click(screen.getByRole('button', { name: /usuário biteplaner/i }));

    expect(screen.getByRole('heading', { level: 2, name: /aviso de privacidade do usuário biteplaner/i })).toBeInTheDocument();
    expect(screen.getByText(/privacy-biteplaner-client-v1\.0\.0/i)).toBeInTheDocument();
    expect(screen.getByText(/dados clínicos, dados de saúde/i)).toBeInTheDocument();
    expect(screen.getByText(/menores de 18 anos somente devem usar/i)).toBeInTheDocument();
    expect(screen.getByText(/geolocalização usada para encontrar clínicas próximas/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /baixar pdf/i })).toBeInTheDocument();
  });

  it('explica que dentista e laboratório não têm dados bancários armazenados na Nexor', async () => {
    const user = userEvent.setup();
    render(<Privacidade />, { wrapper: Wrapper });

    await user.click(screen.getByRole('button', { name: /dentista licenciado/i }));
    expect(screen.getByText(/dados bancários não devem ser armazenados pela Nexor/i)).toBeInTheDocument();
    expect(screen.getByText(/provedor externo de pagamento ou repasse/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /laboratório licenciado/i }));
    expect(screen.getByText(/receba o scan da arcada dentária necessário à produção/i)).toBeInTheDocument();
    expect(screen.getByText(/dado pessoal sensível\/de saúde/i)).toBeInTheDocument();
  });

  it('mantém canal LGPD e direitos do titular em todos os documentos', async () => {
    const user = userEvent.setup();
    render(<Privacidade />, { wrapper: Wrapper });

    await user.click(screen.getByRole('button', { name: /parceiro licenciado/i }));

    expect(screen.getByText(/comissão, prestação de contas, contratos/i)).toBeInTheDocument();
    expect(screen.getByText(/correção, anonimização, bloqueio, eliminação/i)).toBeInTheDocument();
    expect(screen.getByText(/portabilidade quando aplicável/i)).toBeInTheDocument();
    expect(screen.queryByText(/\[[^\]]+\]/)).not.toBeInTheDocument();
  });

  it('renderiza a política geral com empresa, canal LGPD, retenção e incidentes', async () => {
    const user = userEvent.setup();
    render(<Privacidade />, { wrapper: Wrapper });

    await user.click(screen.getByRole('button', { name: /geral nexor/i }));

    expect(screen.getByText(/ETHOSME SERVICOS EDUCACIONAIS LTDA/i)).toBeInTheDocument();
    expect(screen.getByText(/35\.434\.764\/0001-70/i)).toBeInTheDocument();
    expect(screen.getByText(/Canal de Privacidade Nexor/i)).toBeInTheDocument();
    expect(screen.getByText(/120 meses/i)).toBeInTheDocument();
    expect(screen.getByText(/18 meses/i)).toBeInTheDocument();
    expect(screen.getByText(/5 anos/i)).toBeInTheDocument();
    expect(screen.getByText(/acesso indevido a dados clínicos ou scans/i)).toBeInTheDocument();
    expect(screen.getAllByText(/privacy-general-v1\.0\.0/i).length).toBeGreaterThan(0);
  });
});
