import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(import.meta.dirname, '..');

const filesWithExternalNavigation = [
  'sections/Contato/Contato.tsx',
  'pages/painel/BiteplanerHub/index.tsx',
  'pages/painel/ConsultaInicial/index.tsx',
  'pages/painel/MinhaConta/index.tsx',
  'pages/painel/PartnerReferralPage/index.tsx',
];

describe('frontend navigation hardening', () => {
  it('uses noopener with noreferrer for new tabs and window.open calls', () => {
    for (const file of filesWithExternalNavigation) {
      const source = readFileSync(resolve(root, file), 'utf8');
      const blankTargets = source.match(/<[^>]+target="_blank"[^>]*>/g) ?? [];

      for (const element of blankTargets) {
        expect(element, file).toMatch(/rel="noopener noreferrer"/);
      }

      const blankWindowOpenCalls = source.match(/window\.open\([^)]*'_blank'[^)]*\)/g) ?? [];

      for (const call of blankWindowOpenCalls) {
        expect(call, file).toMatch(/'noopener,noreferrer'/);
      }
    }
  });
});