import { describe, expect, it } from 'vitest';
import { resolvePostLoginPath } from './navigation';

describe('resolvePostLoginPath', () => {
  it('routes admins to the administrative portal', () => {
    expect(resolvePostLoginPath(['admin'])).toBe('/painel/admin/home');
  });

  it('keeps non-admin users on the regular portal home', () => {
    expect(resolvePostLoginPath(['customer'])).toBe('/painel/home');
    expect(resolvePostLoginPath()).toBe('/painel/home');
  });

  it('routes non-admin users to a safe selected onboarding path when provided', () => {
    expect(resolvePostLoginPath(['customer'], '/painel/biteplaner/cadastro/dentista')).toBe(
      '/painel/biteplaner/cadastro/dentista'
    );
  });

  it('ignores unsafe or admin selected onboarding paths', () => {
    expect(resolvePostLoginPath(['customer'], 'https://evil.test')).toBe('/painel/home');
    expect(resolvePostLoginPath(['customer'], '//evil.test')).toBe('/painel/home');
    expect(resolvePostLoginPath(['customer'], '/painel/admin/home')).toBe('/painel/home');
  });
});
