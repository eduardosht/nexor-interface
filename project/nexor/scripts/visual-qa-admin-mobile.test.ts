import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('admin mobile visual QA script', () => {
  const source = readFileSync(join(process.cwd(), 'scripts/visual-qa-admin-mobile.mjs'), 'utf8');

  it('covers every administrative mobile route', () => {
    [
      '/painel/admin/home',
      '/painel/admin/ordens',
      '/painel/admin/relatorios',
      '/painel/admin/parceiros',
      '/painel/admin/remocoes-conta',
      '/painel/admin/dentistas',
      '/painel/admin/laboratorios',
      '/painel/admin/usuarios',
      '/painel/admin/configuracoes/negocio',
      '/painel/admin/configuracoes/sistema',
    ].forEach((route) => {
      expect(source).toContain(route);
    });
  });

  it('checks horizontal overflow and captures screenshots', () => {
    expect(source).toContain('scrollWidth');
    expect(source).toContain('clientWidth');
    expect(source).toContain('page.screenshot');
    expect(source).toContain('run-logs/visual-qa/admin-mobile');
  });
});
