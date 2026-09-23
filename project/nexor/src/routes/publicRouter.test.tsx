import { createMemoryRouter, RouterProvider } from 'react-router';
import { render, waitFor } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { describe, expect, it } from 'vitest';
import { lightTheme } from '../styles/theme';
import { publicRoutes } from './publicRouter';

const publicPaths = [
  '/',
  '/sobre',
  '/biteplaner',
  '/conheca-biteplaner',
  '/parceiros',
  '/privacidade',
  '/termos',
  '/cookies',
];

function routePaths() {
  return publicRoutes.flatMap((route) => route.children?.map((child) => child.path).filter((path) => path !== '*') ?? []);
}

describe('publicRouter', () => {
  it('exposes exactly the institutional route matrix', () => {
    expect(routePaths()).toEqual(publicPaths);
    expect(routePaths()).not.toContain('/entrar');
    expect(routePaths()).not.toContain('/painel/admin/home');
  });

  it('redirects unknown and protected paths to the public home', async () => {
    const router = createMemoryRouter(publicRoutes, { initialEntries: ['/painel/admin/home'] });

    render(
      <ThemeProvider theme={lightTheme}>
        <RouterProvider router={router} />
      </ThemeProvider>,
    );

    await waitFor(() => expect(router.state.location.pathname).toBe('/'));
  });
});
