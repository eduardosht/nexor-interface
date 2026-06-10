import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const routesSource = readFileSync(join(process.cwd(), 'src/routes/index.tsx'), 'utf8');

describe('routes', () => {
  it('lazy-loads public marketing pages instead of importing them into the entry chunk', () => {
    expect(routesSource).toContain("lazy(() => import('../pages/Home')");
    expect(routesSource).toContain("lazy(() => import('../pages/BiteplanerPage')");
    expect(routesSource).not.toContain("import { Home } from '../pages/Home'");
    expect(routesSource).not.toContain("import { BiteplanerPage } from '../pages/BiteplanerPage'");
  });

  it('exposes the Biteplaner care guide at the requested public URL', () => {
    expect(routesSource).toContain("{ path: '/conheca-biteplaner', element: <LazyRoute><ConhecaOBiteplaner /></LazyRoute> }");
  });
});
