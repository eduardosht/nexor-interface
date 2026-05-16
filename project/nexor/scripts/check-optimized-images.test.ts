import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('optimized image verification script', () => {
  const root = process.cwd();

  it('exposes a pre-push image optimization check', () => {
    const packageJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as {
      scripts: Record<string, string>;
    };

    expect(packageJson.scripts['verify:images']).toBe('node scripts/check-optimized-images.mjs');
    expect(packageJson.scripts['prepush']).toBe('npm run verify:images && npm run typecheck && npm run test:run && npm run build');
    expect(existsSync(join(root, 'scripts/check-optimized-images.mjs'))).toBe(true);
  });
});
