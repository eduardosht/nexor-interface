import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('browser icon', () => {
  const root = process.cwd();

  it('publishes Nexor favicons and references them from the app shell', () => {
    const html = readFileSync(join(root, 'index.html'), 'utf8');
    const packageJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as {
      scripts: Record<string, string>;
    };

    expect(packageJson.scripts['generate:favicons']).toBe('node scripts/generate-favicons.mjs');
    expect(existsSync(join(root, 'public/favicon-32.png'))).toBe(true);
    expect(existsSync(join(root, 'public/favicon-192.png'))).toBe(true);
    expect(existsSync(join(root, 'public/apple-touch-icon.png'))).toBe(true);
    expect(html).toContain('<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />');
    expect(html).toContain('<link rel="icon" type="image/png" sizes="192x192" href="/favicon-192.png" />');
    expect(html).toContain('<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />');
  });
});
