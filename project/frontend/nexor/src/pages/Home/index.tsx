import {
  Contato,
  Depoimentos,
  Hero,
  Legal,
  ParceirosTeaserSection,
  Produtos,
  QuemSomos,
} from '../../sections';

export function Home() {
  return (
    <main>
      <Hero />
      <QuemSomos />
      <Produtos />
      <ParceirosTeaserSection />
      <Depoimentos />
      <Legal />
      <Contato />
    </main>
  );
}
