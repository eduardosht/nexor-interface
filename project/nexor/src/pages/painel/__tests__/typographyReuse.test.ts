import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('shared typography styled components', () => {
  function readSource(path: string) {
    return readFileSync(join(process.cwd(), path), 'utf8');
  }

  it('keeps public Biteplaner typography reusable instead of section-contextual', () => {
    const marketingTypography = readSource('src/styles/marketingTypography.ts');
    const biteplanerPage = readSource('src/pages/BiteplanerPage/index.tsx');
    const biteplanerStyles = readSource('src/pages/BiteplanerPage/styles.ts');

    expect(marketingTypography).toContain('export const MarketingSectionTitle');
    expect(marketingTypography).toContain('export const MarketingSectionLead');
    expect(marketingTypography).toContain('export const MarketingCardTitle');
    expect(biteplanerPage).toContain('<S.MarketingSectionTitle');
    expect(biteplanerPage).toContain('<S.MarketingSectionLead');
    expect(biteplanerPage).not.toContain('<S.RealRoutineTitle');
    expect(biteplanerPage).not.toContain('<S.ComparisonTitle');
    expect(biteplanerStyles).not.toContain('export const RealRoutineTitle');
    expect(biteplanerStyles).not.toContain('export const ComparisonTitle');
  });

  it('keeps portal typography shared across hub and administrative surfaces', () => {
    const portalTypography = readSource('src/pages/painel/styles/portalTypography.ts');
    const hubStyles = readSource('src/pages/painel/BiteplanerHub/styles.ts');
    const adminStyles = readSource('src/pages/painel/admin/styles.ts');
    const orderHeaderStyles = readSource('src/pages/painel/components/OrderStepHeader.styles.ts');

    expect(portalTypography).toContain('export const PortalPageTitle');
    expect(portalTypography).toContain('export const PortalPageDescription');
    expect(portalTypography).toContain('export const PortalSectionTitle');
    expect(portalTypography).toContain('export const PortalSectionDescription');
    expect(hubStyles).toContain("from '../styles/portalTypography'");
    expect(adminStyles).toContain("from '../styles/portalTypography'");
    expect(orderHeaderStyles).toContain("from '../styles/portalTypography'");
  });
});
