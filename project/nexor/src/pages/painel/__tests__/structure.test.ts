import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const painelRoot = resolve(__dirname, '..');
const routesFile = resolve(painelRoot, '..', '..', 'routes', 'index.tsx');
const workflowFormsPanelFile = resolve(painelRoot, 'components', 'WorkflowFormsPanel.tsx');
const painelBarrelFile = resolve(painelRoot, 'index.ts');

describe('painel page structure', () => {
  it('does not keep page files loose in the painel root', () => {
    const looseFiles = readdirSync(painelRoot, { withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .filter((name) => name !== 'index.ts');

    expect(looseFiles).toEqual([]);
  });

  it('keeps the Biteplaner profile registration page colocated in its own folder', () => {
    expect(existsSync(resolve(painelRoot, 'CadastroPerfilBiteplaner.tsx'))).toBe(false);
    expect(existsSync(resolve(painelRoot, 'CadastroPerfilBiteplaner.styles.ts'))).toBe(false);
    expect(existsSync(resolve(painelRoot, 'CadastroPerfilBiteplaner.test.tsx'))).toBe(false);

    expect(existsSync(resolve(painelRoot, 'CadastroPerfilBiteplaner', 'index.tsx'))).toBe(true);
    expect(existsSync(resolve(painelRoot, 'CadastroPerfilBiteplaner', 'styles.ts'))).toBe(true);
    expect(existsSync(resolve(painelRoot, 'CadastroPerfilBiteplaner', 'index.test.tsx'))).toBe(true);
  });

  it('routes lazy-load painel pages without static painel imports in the public entry', () => {
    const source = readFileSync(routesFile, 'utf8');

    expect(source).not.toMatch(/from '\.\.\/pages\/painel/);
    expect(source).toMatch(/lazy\(\(\) => import\('\.\.\/pages\/painel\/PainelHome'\)/);
    expect(source).toMatch(/lazy\(\(\) => import\('\.\.\/pages\/painel\/admin\/AdminHome'\)/);
  });

  it('uses explicit index imports for moved shared painel modules', () => {
    const sources = [
      readFileSync(workflowFormsPanelFile, 'utf8'),
      readFileSync(painelBarrelFile, 'utf8'),
    ].join('\n');

    expect(sources).not.toMatch(/['"].*biteplanerReviewForms['"]/);
    expect(sources).toContain('biteplanerReviewForms/index');
  });
});
