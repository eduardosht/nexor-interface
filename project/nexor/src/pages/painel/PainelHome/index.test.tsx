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

async function findEnabledHeroCustomerAction() {
  const hero = await screen.findByTestId('biteplaner-product-banner');
  const buttons = within(hero).getAllByRole('button', { name: /adquira seu biteplaner/i });

  await waitFor(() => {
    expect(buttons.some((button) => !(button as HTMLButtonElement).disabled)).toBe(true);
  });

  return buttons.find((button) => !(button as HTMLButtonElement).disabled) as HTMLButtonElement;
}

function renderPage(
  overrides: Record<string, unknown> = {},
  productData: { productRoles?: unknown[]; orders?: unknown[] } = {}
) {
  mockApiGet.mockImplementation((url: string) => {
    if (url.includes('/v1/orders')) {
      return Promise.resolve({ orders: productData.orders ?? [] });
    }

    return Promise.resolve({ productRoles: productData.productRoles ?? [] });
  });
  mockUseAuth.mockReturnValue({
    loading: false,
    session: { access_token: 'tok', user: { id: '1' } },
    backendUser: { email: 'atleta@nexor.com', roles: [], productRoles: [] },
    isMockMode: false,
    demoPersona: null,
    ...overrides
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

  it('renders the coming soon hero and licensing heading', async () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /em breveno nosso site/i })).toBeInTheDocument();
    expect(screen.getByText(/a compra do biteplaner estar/i)).toBeInTheDocument();
    expect(screen.getByText(/fique ligado/i)).toBeInTheDocument();
    expect(screen.getByText(/tecnologia/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /licenciamentos/i })).toBeInTheDocument();
    expect(screen.getByText(/inicie os licenciamentos das categorias de laboratório, dentista ou parceiro/i)).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /informações da conta/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /adquira seu biteplaner/i })).not.toBeInTheDocument();
  });

  it('renders Biteplaner coming soon content', async () => {
    renderPage();
    expect(screen.getByTestId('biteplaner-coming-soon-hero')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /em breveno nosso site/i })).toBeInTheDocument();
    expect(screen.queryByText(/R\$ 400/)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /adquira seu biteplaner/i })).not.toBeInTheDocument();
  });

  it('renders the product purchase banner when Biteplaner is enabled', async () => {
    vi.stubEnv('DISABLE_BITEPLANER', 'false');

    renderPage();

    expect(screen.queryByTestId('biteplaner-coming-soon-hero')).not.toBeInTheDocument();
    expect(screen.getByTestId('biteplaner-product-banner')).toBeInTheDocument();
    expect(screen.getByText('R$ 1.370,00')).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: /valor é referente a uma unidade do biteplaner/i,
      })
    ).toBeInTheDocument();
    expect(await findEnabledHeroCustomerAction()).toBeInTheDocument();
    const trustLine = screen.getByLabelText(/compra segura, suporte especializado e atualizações inclusas/i);
    expect(within(trustLine).getByText(/compra segura/i)).toBeInTheDocument();
    expect(within(trustLine).getByText(/suporte especializado/i)).toBeInTheDocument();
    expect(within(trustLine).getByText(/atualizações inclusas/i)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /ver jornada/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /ver detalhes/i })).not.toBeInTheDocument();
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
    expect(screen.queryByRole('button', { name: /adquira seu biteplaner/i })).not.toBeInTheDocument();
  });

  it('renders the licensing area with operational Biteplaner actions', async () => {
    renderPage();
    expect(screen.getByTestId('biteplaner-coming-soon-hero')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /licenciamentos/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /adquira seu biteplaner/i })).not.toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /solicitar cadastro de coach\/academia/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^solicitar parceria$/i })).not.toBeInTheDocument();
  });

  it('shows the three Biteplaner licensing actions for an account without product roles', async () => {
    renderPage();

    expect(screen.queryByRole('button', { name: /adquira seu biteplaner/i })).not.toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /solicitar cadastro de coach\/academia/i })).toBeInTheDocument();
    expect(screen.getByText(/cadastre coach ou academia para indicar atletas/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /solicitar cadastro de dentista/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /solicitar cadastro de laboratório/i })).toBeInTheDocument();
  });

  it('highlights available licensing badges in green', async () => {
    renderPage();

    const partnerAction = await screen.findByRole('button', { name: /solicitar cadastro de coach\/academia/i });
    const availableBadge = within(partnerAction.closest('article') as HTMLElement).getByText('Disponível');

    expect(getComputedStyle(availableBadge).backgroundColor).toBe('rgba(22, 163, 74, 0.1)');
    expect(getComputedStyle(availableBadge).color).toBe('rgb(21, 128, 61)');
  });

  it('keeps licensing cards in three desktop columns', () => {
    const source = readFileSync(join(process.cwd(), 'src/pages/painel/PainelHome/styles.ts'), 'utf8');

    expect(source).toContain('grid-template-columns: repeat(3, minmax(0, 1fr));');
  });

  it('creates active customer role and sends the user to Biteplaner onboarding flow', async () => {
    vi.stubEnv('DISABLE_BITEPLANER', 'false');
    mockApiPost
      .mockResolvedValueOnce({
        productRole: { productKey: 'biteplaner', role: 'customer', status: 'active' },
        order: { id: 'order-1', status: 'registration_started' },
      });
    renderPage();

    fireEvent.click(await findEnabledHeroCustomerAction());

    await waitFor(() => {
      expect(mockApiPost).toHaveBeenNthCalledWith(
        1,
        '/v1/account/products/biteplaner/roles/customer',
        {},
        'tok'
      );
      expect(mockApiPost).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/painel/biteplaner/onboarding');
    });
  });

  it('keeps the acquisition CTA when Biteplaner is active but no order exists yet', async () => {
    vi.stubEnv('DISABLE_BITEPLANER', 'false');
    mockApiPost
      .mockResolvedValueOnce({
        productRole: { productKey: 'biteplaner', role: 'customer', status: 'active' },
        order: { id: 'order-1', status: 'registration_started' },
      });
    renderPage(
      {},
      {
        productRoles: [{ productKey: 'biteplaner', role: 'customer', status: 'active' }],
        orders: [],
      }
    );

    const action = await findEnabledHeroCustomerAction();
    expect(screen.queryByRole('button', { name: /acompanhar sua ordem/i })).not.toBeInTheDocument();
    expect(screen.getByTestId('biteplaner-product-banner')).toHaveTextContent(/adquira seu biteplaner/i);

    fireEvent.click(action);

    await waitFor(() => {
      expect(mockApiPost).toHaveBeenNthCalledWith(
        1,
        '/v1/account/products/biteplaner/roles/customer',
        {},
        'tok'
      );
      expect(mockApiPost).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/painel/biteplaner/onboarding');
    });
  });

  it('keeps the acquisition CTA when the only Biteplaner order is still in new-user onboarding', async () => {
    vi.stubEnv('DISABLE_BITEPLANER', 'false');
    renderPage(
      {},
      {
        productRoles: [{ productKey: 'biteplaner', role: 'customer', status: 'active' }],
        orders: [{ id: 'BP-TESTE4-001', status: 'registration_started', stage: 'new_user_onboarding' }],
      }
    );

    expect(await findEnabledHeroCustomerAction()).toBeInTheDocument();
    const action = await findEnabledHeroCustomerAction();
    expect(screen.getByTestId('biteplaner-product-banner')).toHaveTextContent(/adquira seu biteplaner/i);
    expect(screen.queryByRole('button', { name: /acompanhar sua ordem/i })).not.toBeInTheDocument();

    fireEvent.click(action);

    expect(mockApiPost).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/painel/biteplaner/onboarding');
  });

  it('keeps the acquisition CTA when the order is registration_started before onboarding is finished', async () => {
    vi.stubEnv('DISABLE_BITEPLANER', 'false');
    renderPage(
      {},
      {
        productRoles: [{ productKey: 'biteplaner', role: 'customer', status: 'active' }],
        orders: [{ id: 'BP-TESTE4-001', status: 'registration_started', stage: 'pre_requisite_pending' }],
      }
    );

    const action = await findEnabledHeroCustomerAction();
    expect(screen.getByTestId('biteplaner-product-banner')).toHaveTextContent(/adquira seu biteplaner/i);
    expect(screen.queryByRole('button', { name: /acompanhar sua ordem/i })).not.toBeInTheDocument();

    fireEvent.click(action);

    expect(mockApiPost).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/painel/biteplaner/onboarding');
  });

  it('replaces the acquisition CTA with order tracking when there is an order in progress', async () => {
    vi.stubEnv('DISABLE_BITEPLANER', 'false');
    renderPage(
      {},
      {
        productRoles: [],
        orders: [{ id: 'BP-DEMO-001', status: 'awaiting_scheduling' }],
      }
    );

    await waitFor(() => expect(screen.getAllByRole('button', { name: /acompanhar sua ordem/i }).length).toBeGreaterThan(0));
    expect(screen.queryByRole('button', { name: /adquirir biteplaner/i })).not.toBeInTheDocument();
  });

  it('keeps order tracking available for completed orders in check-up stage', async () => {
    vi.stubEnv('DISABLE_BITEPLANER', 'false');
    renderPage(
      {},
      {
        productRoles: [{ productKey: 'biteplaner', role: 'customer', status: 'active' }],
        orders: [{ id: 'BP-CHECKUP-001', status: 'completed' }],
      }
    );

    await waitFor(() => expect(screen.getAllByRole('button', { name: /acompanhar sua ordem/i }).length).toBeGreaterThan(0));
    expect(screen.queryByRole('button', { name: /adquirir biteplaner/i })).not.toBeInTheDocument();
  });
  it('sends professional role requests to the dedicated registration page', async () => {
    renderPage();

    fireEvent.click(await screen.findByRole('button', { name: /solicitar cadastro de dentista/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/painel/biteplaner/cadastro/dentista');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('sends partner and laboratory requests to dedicated registration pages', async () => {
    renderPage();

    fireEvent.click(await screen.findByRole('button', { name: /solicitar cadastro de coach\/academia/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/painel/biteplaner/cadastro/parceiro');

    fireEvent.click(screen.getByRole('button', { name: /solicitar cadastro de laboratório/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/painel/biteplaner/cadastro/laboratório');
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

    expect(await screen.findByRole('button', { name: /solicitar cadastro de coach\/academia/i })).toBeDisabled();
    const pendingDentistCard = screen.getByText(/cadastro de dentista em an.lise/i).closest('article');
    expect(pendingDentistCard).toBeInTheDocument();
    expect(within(pendingDentistCard as HTMLElement).queryByText(/^solicitar cadastro$/i)).not.toBeInTheDocument();
    expect(within(pendingDentistCard as HTMLElement).queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /solicitar cadastro de laborat/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /solicitar cadastro de coach\/academia/i }).closest('article')).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    expect(screen.getByRole('button', { name: /solicitar cadastro de coach\/academia/i }).closest('article')).toHaveStyle({
      opacity: '0.58',
    });
    expect(screen.getAllByText(/indispon/i).length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText(/perfil de dentista/i).length).toBeGreaterThanOrEqual(2);
  });

  it('hides the laboratory request link when the account already has an active lab registration', async () => {
    renderPage(
      {
        backendUser: {
          email: 'eduardoshoitifujiwara123@gmail.com',
          roles: ['lab'],
          productRoles: [],
        },
      },
      {
        productRoles: [
          { productKey: 'biteplaner', role: 'lab', status: 'active' },
        ],
        orders: [],
      }
    );

    const labCard = (await screen.findByText(/solicitar cadastro de laborat.rio/i)).closest('article');

    expect(labCard).toBeInTheDocument();
    expect(within(labCard as HTMLElement).getByText(/ativo/i)).toBeInTheDocument();
    expect(within(labCard as HTMLElement).queryByRole('button', { name: /solicitar cadastro/i })).not.toBeInTheDocument();
  });

  it.each([
    ['partner', /solicitar cadastro de coach\/academia/i, '/painel/biteplaner?mode=partner'],
    ['dentist', /solicitar cadastro de dentista/i, '/painel/biteplaner?mode=dentist'],
    ['lab', /solicitar cadastro de laborat.rio/i, '/painel/biteplaner?mode=lab'],
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
