import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

const { mockGet } = vi.hoisted(() => ({
  mockGet: vi.fn()
}));
vi.mock('../lib/api', () => ({
  api: { get: mockGet, post: vi.fn(), patch: vi.fn() },
  ApiError: class ApiError extends Error {
    status: number;

    constructor(message: string, status: number) {
      super(message);
      this.name = 'ApiError';
      this.status = status;
    }
  }
}));

vi.mock('../lib/pending-registration', () => ({
  loadPendingRegistration: vi.fn().mockReturnValue(null),
  clearPendingRegistration: vi.fn()
}));

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { access_token: 'tok', user: { id: '1', email: 'a@b.com' } } }
      }),
      signOut: vi.fn().mockResolvedValue({}),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } }
      }),
      signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
      resetPasswordForEmail: vi.fn().mockResolvedValue({ error: null })
    }
  }
}));

vi.mock('../features/demo/persona', () => ({
  clearActiveDemoPersona: vi.fn(),
  isMockModeEnabled: vi.fn().mockReturnValue(false),
  readActiveDemoPersona: vi.fn().mockReturnValue(null),
  writeActiveDemoPersona: vi.fn()
}));

import { ApiError } from '../lib/api';
import { AuthProvider, useAuth } from './useAuth';

function Consumer() {
  const { backendUser, backendUserResolved, loading } = useAuth();

  if (loading) {
    return <span>loading</span>;
  }

  return (
    <>
      <span data-testid="role">{backendUser?.roles[0] ?? 'none'}</span>
      <span data-testid="resolved">{backendUserResolved ? 'yes' : 'no'}</span>
    </>
  );
}

describe('useAuth backendUser', () => {
  beforeEach(() => {
    mockGet.mockReset();
  });

  it('exposes backendUser from /v1/auth/me', async () => {
    mockGet.mockResolvedValue({
      user: { id: '1', authUserId: '1', email: 'a@b.com', roles: ['admin'], clinicIds: [] }
    });

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId('role').textContent).toBe('admin'));
    expect(screen.getByTestId('resolved')).toHaveTextContent('yes');
  });

  it('sets backendUser to null when /v1/auth/me returns 404', async () => {
    mockGet.mockRejectedValue(new ApiError('not found', 404));

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId('role').textContent).toBe('none'));
    expect(screen.getByTestId('resolved')).toHaveTextContent('yes');
  });
});
