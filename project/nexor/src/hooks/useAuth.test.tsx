import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

const { mockGet, mockOnAuthStateChange } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockOnAuthStateChange: vi.fn()
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
      onAuthStateChange: mockOnAuthStateChange,
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
    mockOnAuthStateChange.mockReset();
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } }
    });
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

  it('keeps the resolved backend user during token refresh events', async () => {
    let authCallback = (_event: string, _nextSession: { access_token: string; user: { id: string; email: string } }) => {};
    mockOnAuthStateChange.mockImplementation((callback) => {
      authCallback = callback;
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });
    mockGet.mockResolvedValue({
      user: { id: '1', authUserId: '1', email: 'a@b.com', roles: ['dentist'], clinicIds: [] }
    });

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId('role')).toHaveTextContent('dentist'));

    authCallback('TOKEN_REFRESHED', {
      access_token: 'tok-refreshed',
      user: { id: '1', email: 'a@b.com' },
    });

    expect(screen.queryByText('loading')).not.toBeInTheDocument();
    expect(screen.getByTestId('role')).toHaveTextContent('dentist');
    expect(screen.getByTestId('resolved')).toHaveTextContent('yes');
  });

  it('keeps the resolved backend user during same-user signed-in events', async () => {
    let authCallback = (_event: string, _nextSession: { access_token: string; user: { id: string; email: string } }) => {};
    mockOnAuthStateChange.mockImplementation((callback) => {
      authCallback = callback;
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });
    mockGet.mockResolvedValue({
      user: { id: '1', authUserId: '1', email: 'a@b.com', roles: ['customer'], clinicIds: [] }
    });

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId('role')).toHaveTextContent('customer'));

    authCallback('SIGNED_IN', {
      access_token: 'tok-focus-restored',
      user: { id: '1', email: 'a@b.com' },
    });

    expect(screen.queryByText('loading')).not.toBeInTheDocument();
    expect(screen.getByTestId('role')).toHaveTextContent('customer');
    expect(screen.getByTestId('resolved')).toHaveTextContent('yes');
  });

  it('fetches the backend user on token refresh when the previous profile was missing', async () => {
    let authCallback = (_event: string, _nextSession: { access_token: string; user: { id: string; email: string } }) => {};
    mockOnAuthStateChange.mockImplementation((callback) => {
      authCallback = callback;
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });
    mockGet
      .mockRejectedValueOnce(new ApiError('not found', 404))
      .mockResolvedValueOnce({
        user: { id: '1', authUserId: '1', email: 'a@b.com', roles: ['customer'], clinicIds: [] }
      });

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId('role')).toHaveTextContent('none'));

    authCallback('TOKEN_REFRESHED', {
      access_token: 'tok-refreshed',
      user: { id: '1', email: 'a@b.com' },
    });

    await waitFor(() => expect(screen.getByTestId('role')).toHaveTextContent('customer'));
    expect(mockGet).toHaveBeenLastCalledWith('/v1/auth/me', 'tok-refreshed');
  });
});
