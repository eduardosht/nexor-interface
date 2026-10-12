import {
  Contato,
  CienciaAplicada,
  Evolucao,
  Depoimentos,
  Hero,
  Legal,
  ParceirosTeaserSection,
  Produtos,
  QuemSomos,
} from '../../sections';

export function Home() {
  return (
    <main id="main-content" tabIndex={-1}>
      <Hero />
      <QuemSomos />
      <CienciaAplicada />
      <Produtos />
      <Evolucao />
      <ParceirosTeaserSection />
      <Depoimentos />
      <Legal />
      <Contato />
    </main>
  );
}
