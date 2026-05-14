import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('GlobalStyles', () => {
  it('keeps button text out of bold weight globally', () => {
    const source = readFileSync(join(process.cwd(), 'src/styles/GlobalStyles.ts'), 'utf8');

    expect(source).toContain('button,');
    expect(source).toContain('button *');
    expect(source).toContain('font-weight: 400 !important');
  });
});
