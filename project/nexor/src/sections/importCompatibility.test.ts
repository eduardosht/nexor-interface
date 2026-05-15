import { describe, expect, it } from 'vitest';
import {
  BiteplanerCard,
  Contato,
  Depoimentos,
  FullBleedBanner,
  Hero,
  Legal,
  ParceirosTeaserSection,
  Produtos,
  QuemSomos,
} from './index';
import { BiteplanerCard as BiteplanerCardFile } from './BiteplanerCard/BiteplanerCard';
import { Contato as ContatoFile } from './Contato/Contato';
import { Depoimentos as DepoimentosFile } from './Depoimentos/Depoimentos';
import { FullBleedBanner as FullBleedBannerFile } from './FullBleedBanner/FullBleedBanner';
import { Hero as HeroFile } from './Hero/Hero';
import { Legal as LegalFile } from './Legal/Legal';
import { ParceirosTeaserSection as ParceirosTeaserSectionFile } from './ParceirosTeaserSection/ParceirosTeaserSection';
import { Produtos as ProdutosFile } from './Produtos/Produtos';
import { QuemSomos as QuemSomosFile } from './QuemSomos/QuemSomos';

describe('section import compatibility', () => {
  it('keeps the sections barrel resolving to the component files', () => {
    expect(BiteplanerCard).toBe(BiteplanerCardFile);
    expect(Contato).toBe(ContatoFile);
    expect(Depoimentos).toBe(DepoimentosFile);
    expect(FullBleedBanner).toBe(FullBleedBannerFile);
    expect(Hero).toBe(HeroFile);
    expect(Legal).toBe(LegalFile);
    expect(ParceirosTeaserSection).toBe(ParceirosTeaserSectionFile);
    expect(Produtos).toBe(ProdutosFile);
    expect(QuemSomos).toBe(QuemSomosFile);
  });
});
