import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('GlobalStyles', () => {
  it('applies the configured body font without swallowing the rest of the stylesheet', () => {
    const source = readFileSync(join(process.cwd(), 'src/styles/GlobalStyles.ts'), 'utf8');
    const bodyStart = source.indexOf('body {');
    const bodyEnd = source.indexOf('\n  }', bodyStart);
    const headingsStart = source.indexOf('h1, h2, h3, h4, h5, h6');

    expect(source).toContain('font-family: ${({ theme }) => theme.fonts.body};');
    expect(bodyStart).toBeGreaterThanOrEqual(0);
    expect(bodyEnd).toBeGreaterThan(bodyStart);
    expect(headingsStart).toBeGreaterThan(bodyEnd);
  });

  it('loads Inter from the app document for portal typography', () => {
    const source = readFileSync(join(process.cwd(), 'index.html'), 'utf8');

    expect(source).toContain('fonts.googleapis.com');
    expect(source).toContain('family=Inter:wght@400;500;600;700;800');
  });

  it('keeps button text out of bold weight globally', () => {
    const source = readFileSync(join(process.cwd(), 'src/styles/GlobalStyles.ts'), 'utf8');

    expect(source).toContain('button,');
    expect(source).toContain('button *');
    expect(source).toContain('font-weight: 400 !important');
  });
});
