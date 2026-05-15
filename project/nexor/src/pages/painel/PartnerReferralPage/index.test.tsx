import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { initDesignSystem } from '@nexor/design-system';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { lightTheme } from '../../../styles/theme';

const { mockUseAuth, mockApiGet, mockApiPost } = vi.hoisted(() => ({
  mockUseAuth: vi.fn(),
  mockApiGet: vi.fn(),
  mockApiPost: vi.fn(),
}));

vi.mock('../../../hooks/useAuth', () => ({ useAuth: mockUseAuth }));
vi.mock('../../../lib/api', () => ({
  api: {
    get: mockApiGet,
    post: mockApiPost,
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
      inviteLink: { id: 'link-2', token: 'bp-partner-qualified-003' },
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
    expect(await screen.findByText(/marina demo/i)).toBeInTheDocument();
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

    expect(await screen.findByRole('dialog', { name: /visualizar link individual/i })).toBeInTheDocument();
    expect(screen.getByDisplayValue(/bp-partner-demo-001/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /enviar por e-mail/i })).toHaveAttribute(
      'href',
      expect.stringContaining('mailto:joao@nexor.dev')
    );
    expect(screen.getByRole('link', { name: /abrir whatsapp/i })).toHaveAttribute(
      'href',
      expect.stringContaining('https://wa.me/')
    );

    fireEvent.click(screen.getByRole('button', { name: /copiar link/i }));

    await waitFor(() =>
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expect.stringContaining('bp-partner-demo-001'))
    );
  });
});
