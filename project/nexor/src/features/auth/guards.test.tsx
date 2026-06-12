import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

const { mockUseAuth } = vi.hoisted(() => ({ mockUseAuth: vi.fn() }));
vi.mock('../../hooks/useAuth', () => ({ useAuth: mockUseAuth }));

import { RequireAdmin, RequireAuth, RequireNonAdmin } from './guards';

describe('RequireAuth', () => {
  it('renders nothing while loading', () => {
    mockUseAuth.mockReturnValue({ loading: true, session: null });
    const { container } = render(
      <MemoryRouter><RequireAuth><div>protected</div></RequireAuth></MemoryRouter>
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('does not render children when no session', () => {
    mockUseAuth.mockReturnValue({ loading: false, session: null });
    render(
      <MemoryRouter initialEntries={['/painel/home']}>
        <RequireAuth><div>protected</div></RequireAuth>
      </MemoryRouter>
    );
    expect(screen.queryByText('protected')).not.toBeInTheDocument();
  });

  it('renders children when session exists', () => {
    mockUseAuth.mockReturnValue({ loading: false, session: { user: { id: '1' } } });
    render(
      <MemoryRouter>
        <RequireAuth><div>protected</div></RequireAuth>
      </MemoryRouter>
    );
    expect(screen.getByText('protected')).toBeInTheDocument();
  });

  it('keeps children mounted during transient loading when session exists', () => {
    mockUseAuth.mockReturnValue({ loading: true, session: { user: { id: '1' } } });
    render(
      <MemoryRouter>
        <RequireAuth><div>protected</div></RequireAuth>
      </MemoryRouter>
    );
    expect(screen.getByText('protected')).toBeInTheDocument();
  });
});

describe('RequireAdmin', () => {
  it('renders admin children for admin users', () => {
    mockUseAuth.mockReturnValue({
      loading: false,
      session: { user: { id: '1' } },
      backendUserResolved: true,
      backendUser: { roles: ['admin'] },
    });

    render(
      <MemoryRouter>
        <RequireAdmin><div>admin-only</div></RequireAdmin>
      </MemoryRouter>
    );

    expect(screen.getByText('admin-only')).toBeInTheDocument();
  });

  it('renders admin children for administrative report roles', () => {
    mockUseAuth.mockReturnValue({
      loading: false,
      session: { user: { id: '1' } },
      backendUserResolved: true,
      backendUser: { roles: ['finance'] },
    });

    render(
      <MemoryRouter>
        <RequireAdmin><div>admin-only</div></RequireAdmin>
      </MemoryRouter>
    );

    expect(screen.getByText('admin-only')).toBeInTheDocument();
  });

  it('keeps admin routes mounted during transient loading for resolved admins', () => {
    mockUseAuth.mockReturnValue({
      loading: true,
      session: { user: { id: '1' } },
      backendUserResolved: true,
      backendUser: { roles: ['admin'] },
    });

    render(
      <MemoryRouter>
        <RequireAdmin><div>admin-only</div></RequireAdmin>
      </MemoryRouter>
    );

    expect(screen.getByText('admin-only')).toBeInTheDocument();
  });

  it('blocks non-admin users from admin routes', () => {
    mockUseAuth.mockReturnValue({
      loading: false,
      session: { user: { id: '1' } },
      backendUserResolved: true,
      backendUser: { roles: ['customer'] },
    });

    render(
      <MemoryRouter>
        <RequireAdmin><div>admin-only</div></RequireAdmin>
      </MemoryRouter>
    );

    expect(screen.queryByText('admin-only')).not.toBeInTheDocument();
  });
});

describe('RequireNonAdmin', () => {
  it('keeps regular portal routes mounted during transient loading for resolved users', () => {
    mockUseAuth.mockReturnValue({
      loading: true,
      session: { user: { id: '1' } },
      backendUserResolved: true,
      backendUser: { roles: ['customer'] },
    });

    render(
      <MemoryRouter>
        <RequireNonAdmin><div>user-portal</div></RequireNonAdmin>
      </MemoryRouter>
    );

    expect(screen.getByText('user-portal')).toBeInTheDocument();
  });

  it('blocks admins from regular portal routes', () => {
    mockUseAuth.mockReturnValue({
      loading: false,
      session: { user: { id: '1' } },
      backendUserResolved: true,
      backendUser: { roles: ['admin'] },
    });

    render(
      <MemoryRouter>
        <RequireNonAdmin><div>user-portal</div></RequireNonAdmin>
      </MemoryRouter>
    );

    expect(screen.queryByText('user-portal')).not.toBeInTheDocument();
  });
});
