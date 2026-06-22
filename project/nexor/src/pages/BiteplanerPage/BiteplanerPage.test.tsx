import { fireEvent, render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { lightTheme } from '../../styles/theme';
import { BiteplanerPage } from './index';

function renderPage() {
  return render(
    <MemoryRouter>
      <ThemeProvider theme={lightTheme}>
        <BiteplanerPage />
      </ThemeProvider>
    </MemoryRouter>,
  );
}

describe('BiteplanerPage', () => {
  it('uses the shared main-content landmark for skip navigation', () => {
    renderPage();
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content');
  });

  it('does not inject the deprecated Orbitron font stack', () => {
    renderPage();
    expect(document.head.textContent).not.toContain('Orbitron');
  });

  it('renders the Biteplaner hero and the comparison product image only in the comparison section', () => {
    renderPage();
    expect(screen.getAllByText('Biteplaner').length).toBeGreaterThan(0);
    expect(screen.getByRole('img', { name: /^biteplaner$/i })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /dispositivo biteplaner na comparação/i })).toBeInTheDocument();
  });

  it('positions Biteplaner as a guided athlete eligibility journey', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /segurança\.\s+conforto\.\s+performance\./i })).toBeInTheDocument();
    expect(screen.getByText(/dispositivo intraoral personalizado para atletas e praticantes de esportes/i)).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /iniciar elegibilidade/i })).toHaveLength(2);
    expect(screen.getByRole('link', { name: /ver como funciona/i })).toHaveAttribute('href', '#como-funciona');
  });

  it('places the product image section before the existing hero section', () => {
    const pageSource = readFileSync(join(process.cwd(), 'src/pages/BiteplanerPage/index.tsx'), 'utf8');
    const stylesSource = readFileSync(join(process.cwd(), 'src/pages/BiteplanerPage/styles.ts'), 'utf8');

    expect(pageSource).toContain("import heroSectionProductMobile from '../../assets/backgrounds/hero-section-product-mobile.png'");
    expect(pageSource).toContain("import heroSectionProduct from '../../assets/backgrounds/hero-section-product.png'");
    expect(pageSource.indexOf('<S.ProductImageHero')).toBeLessThan(pageSource.indexOf('<S.HeroSection>'));
    expect(pageSource).toContain('<S.ProductHeroPicture>');
    expect(pageSource).toContain('<source media="(max-width: 720px)" srcSet={heroSectionProductMobile} />');
    expect(pageSource).toContain('<S.ProductHeroImage src={heroSectionProduct} alt="Biteplaner" />');
    expect(stylesSource).toContain('export const ProductImageHero = styled.section');
    expect(stylesSource).toContain('export const ProductHeroPicture = styled.picture');
    expect(stylesSource).toContain('export const ProductHeroImage = styled.img');
  });

  it('layers the decorative hero item above the background and below the hero copy', () => {
    const pageSource = readFileSync(join(process.cwd(), 'src/pages/BiteplanerPage/index.tsx'), 'utf8');
    const stylesSource = readFileSync(join(process.cwd(), 'src/pages/BiteplanerPage/styles.ts'), 'utf8');

    expect(pageSource).toContain("import heroSectionItem from '../../assets/backgrounds/hero-section-item-1.png'");
    expect(pageSource).toContain('<S.HeroForegroundItem src={heroSectionItem} alt="" aria-hidden="true" />');
    expect(stylesSource).toContain('export const HeroForegroundItem = styled.img');
    expect(stylesSource).toContain('right: -90px;');
    expect(stylesSource).toContain('bottom: -200px;');
    expect(stylesSource).toContain('z-index: 1;');
    expect(stylesSource).toContain('z-index: 2;');
  });

  it('renders the approved journey with payment after clinical eligibility', () => {
    renderPage();
    expect(screen.getAllByText('Conta Nexor').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Pré-consulta').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Dentista licenciado').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Pagamento após aptidão').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Produção personalizada').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Adaptação e acompanhamento').length).toBeGreaterThan(0);
    expect(screen.getByText(/informe esporte, rotina, histórico e sintomas para selecionar um dentista licenciado/i)).toBeInTheDocument();
    expect(screen.getByText(/confirmada sua aptidão na primeira consulta, o pagamento será realizado através da plataforma nexor/i)).toBeInTheDocument();
    expect(screen.getByText(/a fabricação ocorre após confirmação do pagamento/i)).toBeInTheDocument();
    expect(screen.getByText(/a instalação inicial do dispositivo será feita pelo dentista/i)).toBeInTheDocument();
  });

  it('renders the process journey map container', () => {
    renderPage();
    expect(screen.getByTestId('biteplaner-process-journey')).toBeInTheDocument();
  });

  it('keeps the process journey mobile cards compact without the detached step rail', () => {
    const pageSource = readFileSync(join(process.cwd(), 'src/pages/BiteplanerPage/index.tsx'), 'utf8');
    const stylesSource = readFileSync(join(process.cwd(), 'src/pages/BiteplanerPage/styles.ts'), 'utf8');
    const journeyStyles = stylesSource.slice(
      stylesSource.indexOf('export const JourneyGrid'),
      stylesSource.indexOf('export const WarningSection'),
    );

    expect(pageSource).not.toContain('<S.JourneyIndexRail');
    expect(pageSource).not.toContain('<S.StepChevron');
    expect(stylesSource).not.toContain('export const JourneyIndexRail');
    expect(stylesSource).not.toContain('export const StepChevron');
    expect(journeyStyles).toContain('grid-template-columns: auto minmax(0, 1fr);');
    expect(journeyStyles).toContain('display: inline-grid;');
    expect(journeyStyles).not.toContain('padding-left: 32px;');
    expect(journeyStyles).not.toContain('transform: translateY(-68%) rotate(45deg);');
  });

  it('renders athlete storytelling with contextual sport cards', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /feito para a rotina real de treinos e competições/i })).toBeInTheDocument();
    expect(screen.getByText(/nos esportes individuais ou coletivos de combate, força e alta intensidade/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /esportes de combate/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /força e alta intensidade/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /esportes coletivos/i })).toBeInTheDocument();
    expect(screen.getByText(/para quem percebe apertamento, tensão mandibular ou dores em treinos de carga/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /protetores bucais vs biteplaner/i })).toBeInTheDocument();
    expect(screen.getByText(/adequação para treinos e competições de lutas/i)).toBeInTheDocument();
    expect(screen.getAllByText(/^alta$/i).length).toBeGreaterThan(0);
  });

  it('renders the four-column comparison table with collapsed and expanded rows', () => {
    renderPage();

    expect(screen.getByRole('columnheader', { name: /^critério$/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /protetor genérico/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /protetor tradicional/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /^biteplaner$/i })).toBeInTheDocument();
    expect(screen.getByText(/compare e entenda por que o Biteplaner oferece mais proteção/i)).toBeInTheDocument();
    expect(screen.getAllByTestId('comparison-criterion-icon')).toHaveLength(7);
    expect(screen.getByRole('columnheader', { name: /^biteplaner$/i })).toHaveAttribute('data-highlighted-column', 'true');
    expect(screen.queryByTestId('comparison-status-dot')).not.toBeInTheDocument();
    expect(screen.getByText(/conforto em uso prolongado/i)).toBeInTheDocument();
    expect(screen.queryByText(/interferência na fala/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /mostrar comparação completa/i }));

    expect(screen.getByText(/interferência na fala/i)).toBeInTheDocument();
    expect(screen.getByText(/integração com plataforma de dados/i)).toBeInTheDocument();
    expect(screen.getByText(/processo contínuo de aperfeiçoamento/i)).toBeInTheDocument();
    expect(screen.getByText(/^indireta$/i)).toBeInTheDocument();
    expect(screen.getByText(/parcial \(apenas proteção dental\)/i)).toBeInTheDocument();
    expect(screen.getByText(/muito alta \(proteção dental e articular\)/i)).toBeInTheDocument();
    expect(screen.getByText(/altamente relevante pois protege a ATM além dos dentes/i)).toBeInTheDocument();
    expect(screen.getByText(/limitada, pois não ataca o problema dos traumas na ATM/i)).toBeInTheDocument();
  });

  it('wraps the comparison table in a horizontal scroll region for narrow screens', () => {
    renderPage();

    const scrollRegion = screen.getByRole('region', { name: /tabela comparativa com rolagem horizontal/i });
    expect(scrollRegion).toContainElement(screen.getByRole('table'));
  });

  it('renders educational and trust sections without absolute medical claims', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /educação para decidir melhor/i })).toBeInTheDocument();
    expect(screen.getAllByTestId('education-layout-item')).toHaveLength(3);
    expect(screen.getAllByTestId('trust-rail-item')).toHaveLength(4);
    expect(screen.getByText(/pode auxiliar no conforto e prevenção/i)).toBeInTheDocument();
    expect(screen.getByText(/não promete resultados imediatos/i)).toBeInTheDocument();
    expect(screen.getByText(/produção sob padrões de excelência/i)).toBeInTheDocument();
    expect(screen.queryByText(/garante proteção/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/previne lesões/i)).not.toBeInTheDocument();
  });

  it('matches the reference education layout with contextual icons', () => {
    renderPage();

    const pageSource = readFileSync(join(process.cwd(), 'src/pages/BiteplanerPage/index.tsx'), 'utf8');
    const stylesSource = readFileSync(join(process.cwd(), 'src/pages/BiteplanerPage/styles.ts'), 'utf8');
    const educationStyles = stylesSource.slice(
      stylesSource.indexOf('export const TrustOuter'),
      stylesSource.indexOf('export const TrustRail'),
    );

    expect(screen.getByText(/informações e tecnologia para transformar performance/i)).toBeInTheDocument();
    expect(screen.getAllByTestId('education-icon')).toHaveLength(3);
    expect(pageSource).toContain('icon: Activity');
    expect(pageSource).toContain('icon: Heart');
    expect(pageSource).toContain('icon: ShieldCheck');
    expect(pageSource).toContain('<S.EducationIcon data-testid="education-icon">');
    expect(stylesSource).toContain('MarketingSectionLead');
    expect(stylesSource).toContain('export const EducationIcon');
    expect(stylesSource).toContain('MarketingSectionTitle');
    expect(stylesSource).toContain('MarketingSectionLead');
    expect(educationStyles).toContain('font-size: ${typeScale.contentTitle};');
    expect(educationStyles).toContain('font-size: ${typeScale.contentBody};');
    expect(educationStyles).not.toContain('font-size: clamp(38px, 4.5vw, 64px);');
    expect(educationStyles).not.toContain('font-size: clamp(18px, 1.7vw, 22px);');
    expect(educationStyles).toContain('repeating-radial-gradient');
    expect(educationStyles).toContain('grid-template-columns: repeat(3, minmax(0, 1fr));');
    expect(educationStyles).toContain('border-right: 1px solid #d9e2dd;');
  });

  it('keeps the education section free of background image assets', () => {
    const stylesSource = readFileSync(join(process.cwd(), 'src/pages/BiteplanerPage/styles.ts'), 'utf8');
    const optimizedImagesSource = readFileSync(join(process.cwd(), 'src/assets/publicOptimizedImages.ts'), 'utf8');
    const optimizerSource = readFileSync(join(process.cwd(), 'scripts/optimize-public-images.mjs'), 'utf8');

    expect(optimizerSource).not.toContain("source: 'backgrounds/hero-section-2.png'");
    expect(optimizerSource).not.toContain("name: 'biteplaner/education'");
    expect(optimizedImagesSource).not.toContain('biteplanerEducation');
    expect(optimizedImagesSource).not.toContain('education:');
    expect(stylesSource).not.toContain('publicOptimizedImages.biteplaner.education');
    expect(stylesSource).not.toContain('imageSet(publicOptimizedImages.biteplaner.education');
  });

  it('uses dedicated sport backgrounds on the real routine cards', () => {
    const stylesSource = readFileSync(join(process.cwd(), 'src/pages/BiteplanerPage/styles.ts'), 'utf8');

    expect(stylesSource).toContain("import esportesCombateBackground from '../../assets/backgrounds/esportes-combate.jpg'");
    expect(stylesSource).toContain("import forcaAltaIntensidadeBackground from '../../assets/backgrounds/forca-alta-intensidade.jpg'");
    expect(stylesSource).toContain("import esportesColetivosBackground from '../../assets/backgrounds/esportes-coletivos.jpg'");
    expect(stylesSource).toContain('export const RealRoutineSection');
    expect(stylesSource).toContain('export const RealRoutineContent');
    expect(stylesSource).toContain('MarketingSectionLead');
    expect(stylesSource).toContain('export const RealRoutineVisual');
    expect(stylesSource).toContain('export const RealRoutineCard');
    expect(stylesSource).toContain('grid-template-columns: repeat(3, minmax(0, 1fr));');
    expect(stylesSource).toContain('left: esportesCombateBackground');
    expect(stylesSource).toContain('center: forcaAltaIntensidadeBackground');
    expect(stylesSource).toContain('right: esportesColetivosBackground');
    expect(stylesSource).toContain('background-size: cover;');
    expect(stylesSource).toContain('background-image: url(${({ $imagePosition }) => sportContextBackgrounds[$imagePosition]});');
  });

  it('uses the horizontal banner background on the final CTA', () => {
    const stylesSource = readFileSync(join(process.cwd(), 'src/pages/BiteplanerPage/styles.ts'), 'utf8');

    expect(stylesSource).toContain("import finalCtaBackground from '../../assets/backgrounds/banner-horizontal.jpg'");
    expect(stylesSource).toContain('export const FinalCtaOuter');
    expect(stylesSource).toContain('url(${finalCtaBackground}) 24% center / cover no-repeat;');
    expect(stylesSource).not.toContain('publicOptimizedImages.biteplaner.finalCta');
  });

  it('renders the automatic customer comments carousel', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /clientes satisfeitos com o biteplaner/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/carrossel autom/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Marina Costa/i).length).toBeGreaterThan(1);
    expect(screen.getAllByText(/o biteplaner ficou firme/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/ajustando o dispositivo o tempo todo/i).length).toBeGreaterThan(0);
  });

  it('renders FAQ section', () => {
    renderPage();
    expect(screen.getByText(/perguntas frequentes/i)).toBeInTheDocument();
    expect(screen.getByText(/o que é Biteplaner/i)).toBeInTheDocument();
    expect(screen.getByText(/e se eu não for considerado apto/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /não\. a compra é feita através da plataforma nexor, na primeira consulta com o dentista, após a confirmação de sua aptidão clínica/i,
      ),
    ).toBeInTheDocument();
  });
});
