import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { lightTheme } from '../../../styles/theme';

const { mockUseAuth, mockApiGet, mockApiPost, mockNavigate } = vi.hoisted(() => ({
  mockUseAuth: vi.fn(),
  mockApiGet: vi.fn(),
  mockApiPost: vi.fn(),
  mockNavigate: vi.fn(),
}));
vi.mock('../../../hooks/useAuth', () => ({ useAuth: mockUseAuth }));
vi.mock('../../../lib/api', () => ({
  api: {
    get: mockApiGet,
    post: mockApiPost,
  },
}));
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

import { PainelHome } from './index';

async function findEnabledHeroDentistPurchaseAction() {
  const hero = await screen.findByTestId('biteplaner-product-banner');
  const buttons = within(hero).getAllByRole('button', { name: /comprar biteplaner/i });

  await waitFor(() => {
    expect(buttons.some((button) => !(button as HTMLButtonElement).disabled)).toBe(true);
  });

  return buttons.find((button) => !(button as HTMLButtonElement).disabled) as HTMLButtonElement;
}

function renderPage(
  overrides: Record<string, unknown> = {},
  productData: { productRoles?: unknown[]; orders?: unknown[] } = {}
) {
  mockApiGet.mockResolvedValue({});
  const { backendUser: backendUserOverride, ...authOverrides } = overrides;
  const backendUserOverrideRecord = backendUserOverride as Record<string, unknown> | undefined;
  const backendUser = {
    email: 'atleta@nexor.com',
    roles: [],
    ...backendUserOverrideRecord,
    productRoles: productData.productRoles ?? backendUserOverrideRecord?.productRoles ?? [],
  };
  mockUseAuth.mockReturnValue({
    loading: false,
    session: { access_token: 'tok', user: { id: '1' } },
    backendUser,
    backendUserResolved: true,
    isMockMode: false,
    demoPersona: null,
    ...authOverrides
  });
  return render(
    <MemoryRouter>
      <ThemeProvider theme={lightTheme}>
        <PainelHome />
      </ThemeProvider>
    </MemoryRouter>
  );
}

describe('PainelHome', () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
    mockApiGet.mockReset();
    mockApiPost.mockReset();
    mockNavigate.mockReset();
    vi.unstubAllEnvs();
    vi.stubEnv('DISABLE_BITEPLANER', 'true');
  });

  it('sends an unlicensed account to dentist licensing instead of purchase', async () => {
    vi.stubEnv('DISABLE_BITEPLANER', 'false');

    renderPage();

    const action = await screen.findByRole('button', { name: /solicitar licenciamento/i });
    fireEvent.click(action);

    expect(mockNavigate).toHaveBeenCalledWith('/painel/biteplaner/cadastro/dentista');
  });

  it('renders the coming soon hero and licensing heading', async () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /em breveno nosso site/i })).toBeInTheDocument();
    expect(screen.getByText(/a compra do biteplaner estar/i)).toBeInTheDocument();
    expect(screen.getByText(/fique ligado/i)).toBeInTheDocument();
    expect(screen.getByText(/tecnologia/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /licenciamentos/i })).toBeInTheDocument();
    expect(screen.getByText(/licenciamento profissional para vender e operar o Biteplaner/i)).toBeInTheDocument();
    expect(screen.queryByText(/laborat.rio/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /informações da conta/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /comprar biteplaner/i })).not.toBeInTheDocument();
  });

  it('renders Biteplaner coming soon content', async () => {
    renderPage();
    expect(screen.getByTestId('biteplaner-coming-soon-hero')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /em breveno nosso site/i })).toBeInTheDocument();
    expect(screen.queryByText(/R\$ 400/)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /comprar biteplaner/i })).not.toBeInTheDocument();
  });

  it('renders the product purchase banner when Biteplaner is enabled', async () => {
    vi.stubEnv('DISABLE_BITEPLANER', 'false');

    renderPage();

    expect(screen.queryByTestId('biteplaner-coming-soon-hero')).not.toBeInTheDocument();
    expect(screen.getByTestId('biteplaner-product-banner')).toBeInTheDocument();
    expect(screen.getByTestId('biteplaner-product-banner')).toHaveTextContent(/produto nexor para dentistas/i);
    expect(screen.getByTestId('biteplaner-product-banner')).not.toHaveTextContent(/triagem odontol.gica/i);
    expect(screen.getByText('R$ 1.370,00')).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: /valor é referente a uma unidade do biteplaner/i,
      })
    ).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /solicitar licenciamento/i })).toBeInTheDocument();
    const trustLine = screen.getByLabelText(/compra segura, suporte especializado e atualizações inclusas/i);
    expect(within(trustLine).getByText(/compra segura/i)).toBeInTheDocument();
    expect(within(trustLine).getByText(/suporte especializado/i)).toBeInTheDocument();
    expect(within(trustLine).getByText(/atualizações inclusas/i)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /ver jornada/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /ver detalhes/i })).not.toBeInTheDocument();
  });

  it('does not request retired Biteplaner role or order endpoints from the Nexor home', async () => {
    vi.stubEnv('DISABLE_BITEPLANER', 'false');

    renderPage();

    expect(await screen.findByRole('button', { name: /solicitar licenciamento/i })).toBeInTheDocument();
    expect(mockApiGet).not.toHaveBeenCalledWith('/v1/account/product-roles', 'tok');
    expect(mockApiGet).not.toHaveBeenCalledWith('/v1/orders?as=user', 'tok');

    fireEvent.click(await screen.findByRole('button', { name: /solicitar licenciamento/i }));

    expect(mockApiPost).not.toHaveBeenCalledWith(
      '/v1/account/products/biteplaner/roles/customer',
      {},
      'tok'
    );
    expect(mockNavigate).toHaveBeenCalledWith('/painel/biteplaner/cadastro/dentista');
  });

  it('uses the administration dashboard background for the Biteplaner card', () => {
    const source = readFileSync(join(process.cwd(), 'src/pages/painel/PainelHome/index.tsx'), 'utf8');
    const styles = readFileSync(join(process.cwd(), 'src/pages/painel/PainelHome/styles.ts'), 'utf8');

    expect(source).toContain('background-biteplaner-administration-dash.png');
    expect(source).not.toContain('biteplaner-transparent-2.png');
    expect(styles).toContain('background: url(${({ $backgroundImage }) => $backgroundImage}) center / cover no-repeat;');
  });

  it('uses the generated Biteplaner product as a hero image', async () => {
    renderPage();

    expect(screen.getByTestId('biteplaner-coming-soon-hero')).toBeInTheDocument();
    expect(screen.getByTestId('biteplaner-coming-soon-product')).toHaveAttribute(
      'src',
      expect.stringContaining('biteplaner-coming-soon-product')
    );
    expect(document.querySelector('img[src*="biteplaner-moldera"]')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /comprar biteplaner/i })).not.toBeInTheDocument();
  });

  it('renders the licensing area with operational Biteplaner actions', async () => {
    renderPage();
    expect(screen.getByTestId('biteplaner-coming-soon-hero')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /licenciamentos/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /comprar biteplaner/i })).not.toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /solicitar parceria comercial/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /solicitar licença de dentista/i })).toBeInTheDocument();
  });

  it('shows only partner and dentist licensing actions for an account without product roles', async () => {
    renderPage();

    expect(screen.queryByRole('button', { name: /comprar biteplaner/i })).not.toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /solicitar parceria comercial/i })).toBeInTheDocument();
    expect(screen.getByText(/indique dentistas para o biteplaner/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /solicitar licença de dentista/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /solicitar cadastro de laborat.rio/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/laborat.rio/i)).not.toBeInTheDocument();
  });

  it('highlights available licensing badges in green', async () => {
    renderPage();

    const partnerAction = await screen.findByRole('button', { name: /solicitar parceria comercial/i });
    const availableBadge = within(partnerAction.closest('article') as HTMLElement).getByText('Disponível');

    expect(getComputedStyle(availableBadge).backgroundColor).toBe('rgba(22, 163, 74, 0.1)');
    expect(getComputedStyle(availableBadge).color).toBe('rgb(21, 128, 61)');
  });

  it('keeps licensing cards in two desktop columns after removing legacy supplier onboarding', () => {
    const source = readFileSync(join(process.cwd(), 'src/pages/painel/PainelHome/styles.ts'), 'utf8');

    expect(source).toContain('grid-template-columns: repeat(2, minmax(0, 1fr));');
  });

  it('opens the Nexor Biteplaner purchase flow without creating legacy customer roles', async () => {
    vi.stubEnv('DISABLE_BITEPLANER', 'false');
    renderPage({}, {
      productRoles: [{ productKey: 'biteplaner', role: 'dentist', status: 'active' }],
      orders: [],
    });

    fireEvent.click(await findEnabledHeroDentistPurchaseAction());

    expect(mockApiPost).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/painel/compra');
  });

  it('keeps the acquisition CTA when Biteplaner is active but no order exists yet', async () => {
    vi.stubEnv('DISABLE_BITEPLANER', 'false');
    renderPage(
      {},
      {
        productRoles: [{ productKey: 'biteplaner', role: 'dentist', status: 'active' }],
        orders: [],
      }
    );

    const action = await findEnabledHeroDentistPurchaseAction();
    expect(screen.queryByRole('button', { name: /acompanhar sua ordem/i })).not.toBeInTheDocument();
    expect(screen.getByTestId('biteplaner-product-banner')).toHaveTextContent(/comprar biteplaner/i);

    fireEvent.click(action);

    expect(mockApiPost).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/painel/compra');
  });

  it('ignores legacy onboarding orders on the Nexor home CTA', async () => {
    vi.stubEnv('DISABLE_BITEPLANER', 'false');
    renderPage(
      {},
      {
        productRoles: [{ productKey: 'biteplaner', role: 'dentist', status: 'active' }],
        orders: [{ id: 'BP-TESTE4-001', status: 'registration_started', stage: 'new_user_onboarding' }],
      }
    );

    expect(await findEnabledHeroDentistPurchaseAction()).toBeInTheDocument();
    const action = await findEnabledHeroDentistPurchaseAction();
    expect(screen.getByTestId('biteplaner-product-banner')).toHaveTextContent(/comprar biteplaner/i);
    expect(screen.queryByRole('button', { name: /acompanhar sua ordem/i })).not.toBeInTheDocument();

    fireEvent.click(action);

    expect(mockApiPost).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/painel/compra');
  });

  it('ignores legacy in-progress orders on the Nexor home CTA', async () => {
    vi.stubEnv('DISABLE_BITEPLANER', 'false');
    renderPage(
      {},
      {
        productRoles: [{ productKey: 'biteplaner', role: 'dentist', status: 'active' }],
        orders: [{ id: 'BP-TESTE4-001', status: 'registration_started', stage: 'pre_requisite_pending' }],
      }
    );

    const action = await findEnabledHeroDentistPurchaseAction();
    expect(screen.getByTestId('biteplaner-product-banner')).toHaveTextContent(/comprar biteplaner/i);
    expect(screen.queryByRole('button', { name: /acompanhar sua ordem/i })).not.toBeInTheDocument();

    fireEvent.click(action);

    expect(mockApiPost).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/painel/compra');
  });
  it('sends professional role requests to the dedicated registration page', async () => {
    renderPage();

    fireEvent.click(await screen.findByRole('button', { name: /solicitar licença de dentista/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/painel/biteplaner/cadastro/dentista');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('sends partner requests to the dedicated registration page and does not expose legacy supplier requests', async () => {
    renderPage();

    fireEvent.click(await screen.findByRole('button', { name: /solicitar parceria comercial/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/painel/biteplaner/cadastro/parceiro');
    expect(screen.queryByRole('button', { name: /solicitar cadastro de laborat.rio/i })).not.toBeInTheDocument();
  });

  it('shows a review notice inside pending licensing cards', async () => {
    renderPage(
      {},
      {
        productRoles: [{ productKey: 'biteplaner', role: 'dentist', status: 'pending' }],
        orders: [],
      }
    );

    const pendingCard = (await screen.findByText(/licença de dentista biteplaner/i)).closest('article');

    expect(pendingCard).toBeInTheDocument();
    expect(pendingCard).toHaveTextContent(
      'Cadastro enviado. Aguarde a Nexor verificar seus dados para seguir para aprovação.'
    );
  });
  it('blocks other operational role requests while dentist licensing is pending', async () => {
    renderPage(
      {},
      {
        productRoles: [
          { productKey: 'biteplaner', role: 'customer', status: 'active' },
          { productKey: 'biteplaner', role: 'dentist', status: 'pending' },
        ],
        orders: [],
      }
    );

    const blockedPartnerCard = (await screen.findByText(/parceria comercial Biteplaner/i)).closest('article');
    expect(within(blockedPartnerCard as HTMLElement).getByRole('button', { name: /indispon.vel/i })).toBeDisabled();
    const pendingDentistCard = screen.getByText(/licença de dentista biteplaner/i).closest('article');
    expect(pendingDentistCard).toBeInTheDocument();
    expect(within(pendingDentistCard as HTMLElement).getByText(/pendente/i)).toBeInTheDocument();
    expect(within(pendingDentistCard as HTMLElement).queryByText(/^solicitar cadastro$/i)).not.toBeInTheDocument();
    expect(within(pendingDentistCard as HTMLElement).queryByRole('button')).not.toBeInTheDocument();
    expect(blockedPartnerCard).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    expect(blockedPartnerCard).toHaveStyle({
      opacity: '0.58',
    });
    expect(screen.getAllByText(/indispon/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/perfil de dentista/i).length).toBeGreaterThanOrEqual(1);
  });

  it.each([
    ['partner', /parceria comercial biteplaner/i, '/painel/biteplaner'],
    ['dentist', /licença de dentista biteplaner/i, '/painel/biteplaner'],
  ])('shows a dashboard button for an active %s licensing card', async (role, titleMatcher, expectedPath) => {
    renderPage(
      {},
      {
        productRoles: [
          { productKey: 'biteplaner', role, status: 'active' },
        ],
        orders: [],
      }
    );

    const activeCard = (await screen.findByText(titleMatcher)).closest('article');

    expect(activeCard).toBeInTheDocument();
    const dashboardButton = within(activeCard as HTMLElement).getByRole('button', { name: /ir para dashboard/i });

    fireEvent.click(dashboardButton);

    expect(mockNavigate).toHaveBeenCalledWith(expectedPath);
  });

  it('shows active demo profile banner when using mock persona', async () => {
    renderPage({ isMockMode: true, demoPersona: 'partner' });

    expect(screen.getByTestId('demo-banner-active-profile')).toBeInTheDocument();
    expect(screen.getByTestId('demo-banner-active-profile')).toHaveTextContent(/parceiro/i);
    expect(screen.getByRole('heading', { name: /licenciamentos/i })).toBeInTheDocument();
  });
});
