import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { initDesignSystem } from '@nexor/design-system';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { lightTheme } from '../../../styles/theme';

const { mockUseAuth, mockApiGet, mockApiPost, mockApiPatch } = vi.hoisted(() => ({
  mockUseAuth: vi.fn(),
  mockApiGet: vi.fn(),
  mockApiPost: vi.fn(),
  mockApiPatch: vi.fn(),
}));

vi.mock('../../../hooks/useAuth', () => ({ useAuth: mockUseAuth }));
vi.mock('../../../lib/api', () => ({
  api: {
    get: mockApiGet,
    post: mockApiPost,
    patch: mockApiPatch,
  },
}));

import { PartnerReferralPage } from './index';

const { DesignSystemRoot } = initDesignSystem({ brand: 'nexor' });

function renderPage() {
  mockUseAuth.mockReturnValue({
    session: { access_token: 'tok' },
  });

  return render(
    <ThemeProvider theme={lightTheme}>
      <DesignSystemRoot>
        <MemoryRouter initialEntries={['/painel/biteplaner/indicar?mode=partner']}>
          <PartnerReferralPage />
        </MemoryRouter>
      </DesignSystemRoot>
    </ThemeProvider>
  );
}

describe('PartnerReferralPage', () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
    mockApiGet.mockReset();
    mockApiPost.mockReset();
    mockApiPatch.mockReset();
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it('creates a new individual partner link for a qualified customer', async () => {
    mockApiGet
      .mockResolvedValueOnce({
        inviteLinks: [],
        leads: [],
        summary: { leadsCaptured: 0, convertedToAccount: 0, activeOrders: 0 },
      })
      .mockResolvedValueOnce({
        inviteLinks: [
          {
            id: 'link-2',
            token: 'bp-partner-qualified-003',
            status: 'active',
            intendedCustomerName: 'Marina Demo',
            intendedCustomerEmail: 'marina@nexor.dev',
            created_at: '2026-05-02T10:00:00.000Z',
            expires_at: null,
            consumed_at: null,
          },
        ],
        leads: [],
        summary: { leadsCaptured: 0, convertedToAccount: 0, activeOrders: 0 },
      });
    mockApiPost.mockResolvedValueOnce({
      inviteLink: {
        id: 'link-2',
        token: 'bp-partner-qualified-003',
        status: 'active',
        intendedCustomerName: 'Marina Demo',
        intendedCustomerEmail: 'marina@nexor.dev',
        created_at: '2026-05-02T10:00:00.000Z',
        expires_at: null,
        consumed_at: null,
      },
    });

    renderPage();

    await waitFor(() => expect(screen.getByRole('button', { name: /gerar link/i })).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText(/cliente qualificado/i), { target: { value: 'Marina Demo' } });
    fireEvent.change(screen.getByLabelText(/e-mail do contato/i), { target: { value: 'marina@nexor.dev' } });
    fireEvent.click(screen.getByRole('button', { name: /gerar link/i }));

    await waitFor(() =>
      expect(mockApiPost).toHaveBeenCalledWith(
        '/v1/partner/invite-links',
        {
          customerName: 'Marina Demo',
          customerEmail: 'marina@nexor.dev',
        },
        'tok'
      )
    );
    await waitFor(() => expect(screen.getAllByText(/marina demo/i).length).toBeGreaterThan(0));
    expect(await screen.findByRole('dialog', { name: /visualizar link individual/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /enviar por e-mail/i })).toHaveAttribute(
      'href',
      expect.stringContaining('mailto:marina@nexor.dev')
    );
  }, 10000);

  it('opens a newly created link modal with e-mail sharing disabled when no contact e-mail is provided', async () => {
    mockApiGet
      .mockResolvedValueOnce({
        inviteLinks: [],
        leads: [],
        summary: { leadsCaptured: 0, convertedToAccount: 0, activeOrders: 0 },
      })
      .mockResolvedValueOnce({
        inviteLinks: [
          {
            id: 'link-no-email',
            token: 'bp-partner-no-email-001',
            status: 'active',
            intendedCustomerName: 'Cliente Sem Email',
            intendedCustomerEmail: null,
            created_at: '2026-05-02T10:00:00.000Z',
            expires_at: null,
            consumed_at: null,
          },
        ],
        leads: [],
        summary: { leadsCaptured: 0, convertedToAccount: 0, activeOrders: 0 },
      });
    mockApiPost.mockResolvedValueOnce({
      inviteLink: {
        id: 'link-no-email',
        token: 'bp-partner-no-email-001',
        status: 'active',
        intendedCustomerName: 'Cliente Sem Email',
        intendedCustomerEmail: null,
        created_at: '2026-05-02T10:00:00.000Z',
        expires_at: null,
        consumed_at: null,
      },
    });

    renderPage();

    await waitFor(() => expect(screen.getByRole('button', { name: /gerar link/i })).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText(/cliente qualificado/i), { target: { value: 'Cliente Sem Email' } });
    fireEvent.click(screen.getByRole('button', { name: /gerar link/i }));

    const dialog = await screen.findByRole('dialog', { name: /visualizar link individual/i });
    const emailAction = within(dialog).getByRole('link', { name: /enviar por e-mail/i });

    expect(emailAction).toHaveAttribute('aria-disabled', 'true');
    expect(emailAction).toHaveAttribute('href', '#');
  });

  it('opens the partner link modal and copies the invite link', async () => {
    mockApiGet.mockResolvedValueOnce({
      inviteLinks: [
        {
          id: 'link-1',
          token: 'bp-partner-demo-001',
          status: 'active',
          intendedCustomerName: 'Joao Demo',
          intendedCustomerEmail: 'joao@nexor.dev',
          created_at: '2026-05-01T10:00:00.000Z',
          expires_at: null,
          consumed_at: null,
        },
      ],
      leads: [],
      summary: { leadsCaptured: 0, convertedToAccount: 0, activeOrders: 0 },
    });

    renderPage();

    await waitFor(() => expect(screen.getByRole('button', { name: /visualizar link joao demo/i })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /visualizar link joao demo/i }));

    const dialog = await screen.findByRole('dialog', { name: /visualizar link individual/i });
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText(/nome:/i)).toBeInTheDocument();
    expect(within(dialog).getByText(/joao demo/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /copiar link individual/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Copiar link' })).not.toBeInTheDocument();
    expect(screen.getByDisplayValue(/bp-partner-demo-001/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /enviar por e-mail/i })).toHaveAttribute(
      'href',
      expect.stringContaining('mailto:joao@nexor.dev')
    );
    expect(screen.getByRole('link', { name: /abrir whatsapp/i })).toHaveAttribute(
      'href',
      expect.stringContaining('https://wa.me/')
    );

    expect(screen.queryByRole('tooltip', { name: /copiado/i })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /copiar link individual/i }));

    await waitFor(() =>
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expect.stringContaining('bp-partner-demo-001'))
    );
    expect(screen.getByRole('tooltip', { name: /copiado/i })).toBeInTheDocument();
  });

  it('removes a generated partner link from the list', async () => {
    mockApiGet
      .mockResolvedValueOnce({
        inviteLinks: [
          {
            id: 'link-1',
            token: 'bp-partner-demo-001',
            status: 'active',
            intendedCustomerName: 'Joao Demo',
            intendedCustomerEmail: 'joao@nexor.dev',
            created_at: '2026-05-01T10:00:00.000Z',
            expires_at: null,
            consumed_at: null,
          },
        ],
        leads: [],
        summary: { leadsCaptured: 0, convertedToAccount: 0, activeOrders: 0 },
      })
      .mockResolvedValueOnce({
        inviteLinks: [],
        leads: [],
        summary: { leadsCaptured: 0, convertedToAccount: 0, activeOrders: 0 },
      });
    mockApiPatch.mockResolvedValueOnce({
      inviteLink: { id: 'link-1', token: 'bp-partner-demo-001', status: 'inactive' },
    });

    renderPage();

    await waitFor(() => expect(screen.getAllByText(/joao demo/i).length).toBeGreaterThan(0));
    fireEvent.click(screen.getByRole('button', { name: /remover link joao demo/i }));

    await waitFor(() =>
      expect(mockApiPatch).toHaveBeenCalledWith('/v1/partner/invite-links/link-1/remove', {}, 'tok')
    );
    expect(await screen.findByText(/link individual removido/i)).toBeInTheDocument();
  });

  it('shows converted referrals without e-mail column and with status indicator layout', async () => {
    mockApiGet.mockResolvedValueOnce({
      inviteLinks: [],
      leads: [
        {
          id: 'lead-1',
          partnerId: 'partner-1',
          partnerLinkId: 'link-1',
          orderId: 'order-1',
          customerProfileId: 'customer-1',
          customerName: 'Cliente Convertido',
          customerEmail: 'convertido@nexor.dev',
          customerPhone: null,
          funnelStage: 'account_created',
          statusLabel: 'Conta criada',
          created_at: '2026-05-03T10:00:00.000Z',
          orderStatus: 'registration_started',
        },
      ],
      summary: { leadsCaptured: 1, convertedToAccount: 1, activeOrders: 0 },
    });

    renderPage();

    await waitFor(() => expect(screen.getAllByText(/cliente convertido/i).length).toBeGreaterThan(0));

    const convertedSection = screen.getByRole('heading', { name: /indicações convertidas/i }).closest('section');

    expect(convertedSection).not.toBeNull();
    expect(within(convertedSection as HTMLElement).queryByText(/^E-mail$/i)).not.toBeInTheDocument();
    expect(within(convertedSection as HTMLElement).queryByText(/convertido@nexor.dev/i)).not.toBeInTheDocument();
    expect(within(convertedSection as HTMLElement).getAllByText(/conta criada/i).length).toBeGreaterThan(0);
  });

  it('does not allow sharing or removing inactive partner links', async () => {
    mockApiGet.mockResolvedValueOnce({
      inviteLinks: [
        {
          id: 'link-expired',
          token: 'bp-partner-demo-expired',
          status: 'expired',
          intendedCustomerName: 'Contato Expirado',
          intendedCustomerEmail: null,
          created_at: '2026-03-01T10:00:00.000Z',
          expires_at: '2026-04-01T10:00:00.000Z',
          consumed_at: null,
        },
      ],
      leads: [],
      summary: { leadsCaptured: 0, convertedToAccount: 0, activeOrders: 0 },
    });

    renderPage();

    const viewButton = await screen.findByRole('button', { name: /visualizar link indisponível contato expirado/i });
    const removeButton = screen.getByRole('button', { name: /remover link indisponível contato expirado/i });

    expect(viewButton).toBeDisabled();
    expect(removeButton).toBeDisabled();

    fireEvent.click(viewButton);
    fireEvent.click(removeButton);

    expect(screen.queryByRole('dialog', { name: /visualizar link individual/i })).not.toBeInTheDocument();
    expect(mockApiPatch).not.toHaveBeenCalled();
  });

  it('hides view and delete actions for consumed partner links', async () => {
    mockApiGet.mockResolvedValueOnce({
      inviteLinks: [
        {
          id: 'link-consumed',
          token: 'bp-partner-demo-consumed',
          status: 'consumed',
          intendedCustomerName: 'Contato Consumido',
          intendedCustomerEmail: 'consumido@nexor.dev',
          created_at: '2026-03-01T10:00:00.000Z',
          expires_at: null,
          consumed_at: '2026-03-02T10:00:00.000Z',
        },
      ],
      leads: [],
      summary: { leadsCaptured: 1, convertedToAccount: 1, activeOrders: 0 },
    });

    renderPage();

    await waitFor(() => expect(screen.getAllByText(/contato consumido/i).length).toBeGreaterThan(0));

    expect(screen.queryByRole('button', { name: /visualizar link.*contato consumido/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /remover link.*contato consumido/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: /visualizar link individual/i })).not.toBeInTheDocument();
  });

  it('uses the admin design-system table for partner links and converted referrals', () => {
    const source = readFileSync(resolve(__dirname, 'index.tsx'), 'utf8');

    expect(source).toContain('AdminDataTable');
    expect(source).toContain('type AdminDataTableColumn');
    expect(source).not.toContain('type DataTableColumn');
    expect(source).not.toContain('<DataTable');
  });

  it('keeps the invite link modal compact and aligned with admin form actions', () => {
    const pageSource = readFileSync(resolve(__dirname, 'index.tsx'), 'utf8');
    const stylesSource = readFileSync(resolve(__dirname, '../BiteplanerHub/styles.ts'), 'utf8');
    const modalStyles = stylesSource.slice(
      stylesSource.indexOf('export const ReferralInviteModalBox'),
      stylesSource.indexOf('export const ModalForm')
    );

    expect(pageSource).not.toContain('AdminFormButton');
    expect(pageSource).not.toContain('<S.ReferralInviteCopyButton');
    expect(modalStyles).toContain('grid-template-columns: repeat(2, minmax(0, 1fr));');
    expect(modalStyles).toContain('width: min(100%, 640px);');
    expect(modalStyles).toContain('padding: 14px;');
    expect(modalStyles).toContain('font-size: 11px;');
    expect(modalStyles).toContain('background: #15803d;');
    expect(modalStyles).toContain('color: #f8fbff;');
  });
});
