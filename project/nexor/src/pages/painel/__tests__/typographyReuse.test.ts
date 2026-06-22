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
    expect(marketingTypography).toContain('font-size: clamp(3rem, 3.5vw, 5rem);');
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
    const reportsStyles = readSource('src/pages/painel/RelatoriosBiteplaner/styles.ts');
    const reviewsStyles = readSource('src/pages/painel/Avaliacoes/styles.ts');
    const profileStyles = readSource('src/pages/painel/CadastroPerfilBiteplaner/styles.ts');
    const prerequisiteStyles = readSource('src/pages/painel/PreRequisito/styles.ts');
    const purchaseStyles = readSource('src/pages/painel/Compra/styles.ts');
    const productionStyles = readSource('src/pages/painel/ProducaoDentista/styles.ts');
    const journeyStyles = readSource('src/pages/painel/Jornada/styles.ts');
    const accountStyles = readSource('src/pages/painel/MinhaConta/styles.ts');

    expect(portalTypography).toContain('export const PortalPageTitle');
    expect(portalTypography).toContain('export const PortalPageDescription');
    expect(portalTypography).toContain("'clamp(1.25rem, 2vw, 1.75rem)'");
    expect(portalTypography).toContain(": '14px'");
    expect(portalTypography).toContain('export const PortalSectionTitle');
    expect(portalTypography).toContain('export const PortalSectionDescription');
    expect(hubStyles).toContain("from '../styles/portalTypography'");
    expect(adminStyles).toContain("from '../styles/portalTypography'");
    expect(orderHeaderStyles).toContain("from '../styles/portalTypography'");
    expect(journeyStyles).toContain('export const SectionTitle = PortalPageTitle;');
    expect(accountStyles).toContain('PortalPageTitle');
    expect(accountStyles).toContain('PortalPageDescription');
    expect(reportsStyles).toContain('font-size: clamp(1.25rem, 2vw, 1.75rem);');
    expect(reportsStyles).toContain('font-size: 14px;');
    expect(reviewsStyles).toContain('font-size: clamp(1.25rem, 2vw, 1.75rem);');
    expect(profileStyles).toContain('font-size: clamp(1.25rem, 2vw, 1.75rem);');
    expect(profileStyles).toContain('font-size: 14px;');
    expect(prerequisiteStyles).toContain('font-size: clamp(1.25rem, 2vw, 1.75rem);');
    expect(prerequisiteStyles).toContain('font-size: 14px;');
    expect(purchaseStyles).toContain('font-size: clamp(1.25rem, 2vw, 1.75rem);');
    expect(purchaseStyles).toContain('font-size: 14px;');
    expect(productionStyles).toContain('font-size: clamp(1.25rem, 2vw, 1.75rem);');
    expect(productionStyles).toContain('font-size: 14px;');
  });
});
