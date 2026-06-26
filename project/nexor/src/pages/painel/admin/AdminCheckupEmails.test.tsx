import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { vi } from 'vitest';
import { lightTheme } from '../../../styles/theme';

const { mockUseAuth, mockUseAdminPortal, mockApiGet, mockApiPost } = vi.hoisted(() => ({
  mockUseAuth: vi.fn(),
  mockUseAdminPortal: vi.fn(),
  mockApiGet: vi.fn(),
  mockApiPost: vi.fn(),
}));

vi.mock('../../../hooks/useAuth', () => ({ useAuth: mockUseAuth }));
vi.mock('../../../features/admin/portal', () => ({ useAdminPortal: mockUseAdminPortal }));
vi.mock('../../../lib/api', () => ({
  api: {
    get: mockApiGet,
    post: mockApiPost,
  },
}));

import { AdminCheckupEmails } from './AdminCheckupEmails';

const emailRow = {
  id: '11111111-1111-4111-8111-111111111111',
  recipient_email: 'cliente3@gmail.com',
  order_id: 'order-3',
  follow_up_kind: 'return_30_days',
  reminder_sequence: 2,
  scheduled_for: '2026-06-21T11:00:00.000Z',
  status: 'scheduled',
  attempt_count: 0,
  last_error_message: null,
  skip_reason: null,
  metadata: { customerName: 'Cliente 3' },
  created_at: '2026-06-20T10:00:00.000Z',
  updated_at: '2026-06-20T10:00:00.000Z',
};

function renderPage() {
  mockUseAuth.mockReturnValue({ session: { access_token: 'tok' } });
  mockUseAdminPortal.mockReturnValue({ selectedProduct: { id: 'biteplaner', label: 'Biteplaner' } });
  mockApiGet.mockImplementation((path: string) => {
    if (path.startsWith('/v1/admin/platform-emails/job-runs')) {
      return Promise.resolve({
        runs: [
          {
            id: 'run-1',
            job_key: 'platform_email_daily',
            status: 'completed',
            started_at: '2026-06-20T11:00:00.000Z',
            finished_at: '2026-06-20T11:00:03.000Z',
            triggered_by: 'cron',
            summary: { sent: 1 },
            error_message: null,
          },
        ],
      });
    }

    if (path.startsWith('/v1/admin/platform-emails')) {
      return Promise.resolve({ emails: [emailRow] });
    }

    return Promise.resolve({});
  });
  mockApiPost.mockResolvedValue({
    jobRunId: 'run-2',
    alreadyRunning: false,
    processed: 1,
    sent: 1,
    failed: 0,
    retryScheduled: 0,
    skipped: 0,
    sentBeforeRun: 0,
    remainingDailyLimit: 89,
    dailyLimit: 90,
  });

  return render(
    <ThemeProvider theme={lightTheme}>
      <AdminCheckupEmails />
    </ThemeProvider>
  );
}

describe('AdminCheckupEmails', () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
    mockUseAdminPortal.mockReset();
    mockApiGet.mockReset();
    mockApiPost.mockReset();
  });

  it('lists scheduled check-up emails and runs the job manually after confirmation', async () => {
    renderPage();

    expect(await screen.findByRole('heading', { name: /e-mails de check-up/i })).toBeInTheDocument();
    expect(screen.getByText('Agendados')).toBeInTheDocument();
    expect(screen.getByText('Falhas')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getAllByText('cliente3@gmail.com').length).toBeGreaterThan(0);
    });

    fireEvent.click(screen.getByRole('button', { name: /executar job agora/i }));
    expect(screen.getByRole('dialog', { name: /executar job diário/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /executar agora/i }));

    await waitFor(() => {
      expect(mockApiPost).toHaveBeenCalledWith('/v1/admin/platform-emails/run-daily-job', {}, 'tok');
    });
    expect(await screen.findByRole('status')).toHaveTextContent(/job executado/i);
  });
});
