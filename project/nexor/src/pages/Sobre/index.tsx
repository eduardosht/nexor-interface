import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { Button, Surface } from '@nexor/design-system';
import { fadeUp, staggerContainer } from '../../styles/motion';
import * as S from './styles';

























const PILLARS = [
  { icon: 'P', title: 'Precisão', body: 'Cada produto é desenvolvido com base em dados biométricos e análises individualizadas para máxima eficácia.' },
  { icon: 'T', title: 'Tecnologia', body: 'Processos digitais integrados com produção externa de alta complexidade e materiais premium.' },
  { icon: 'A', title: 'Acompanhamento', body: 'Rede de dentistas licenciados e operação Nexor para avaliação, produção externa e monitoramento contínuo dos resultados.' },
];

const APPROACH = [
  { title: 'Pesquisa e Desenvolvimento', body: 'Cada produto parte de pesquisa científica rigorosa. Nenhum lançamento chega ao mercado sem evidência de eficácia e segurança.' },
  { title: 'Personalização Total', body: 'Não existe produto genérico no portfólio Nexor. Cada solução é moldada para o atleta individualmente.' },
  { title: 'Rede Profissional', body: 'Dentistas licenciados, parceiros credenciados e fornecedores técnicos administrados pela Nexor compõem o ecossistema de entrega.' },
  { title: 'Acompanhamento Contínuo', body: 'O produto não termina na entrega. Monitoramento profissional garante resultado sustentado no longo prazo.' },
];

export function Sobre() {
  const missionRef = useRef(null);
  const pillarsRef = useRef(null);
  const approachRef = useRef(null);
  const ctaRef = useRef(null);
  const missionInView = useInView(missionRef, { once: true, margin: '-15%' });
  const pillarsInView = useInView(pillarsRef, { once: true, margin: '-15%' });
  const approachInView = useInView(approachRef, { once: true, margin: '-10%' });
  const ctaInView = useInView(ctaRef, { once: true, margin: '-15%' });

  return (
    <S.Page>
      <S.MissionOuter ref={missionRef}>
        <motion.div variants={staggerContainer} initial="hidden" animate={missionInView ? 'visible' : 'hidden'}>
          <S.SectionLabel>Sobre a Nexor</S.SectionLabel>
          <S.Title as={motion.h2} variants={fadeUp}>Nossa<br />Missão</S.Title>
        </motion.div>
        <S.Body as={motion.div} variants={staggerContainer} initial="hidden" animate={missionInView ? 'visible' : 'hidden'}>
          <S.Paragraph as={motion.p} variants={fadeUp}>
            A Nexor é uma empresa-plataforma de produtos de performance. Nossa missão é desenvolver soluções personalizadas que potencializam o desempenho atlético através de pesquisa científica, tecnologia de ponta e acompanhamento profissional especializado.
          </S.Paragraph>
          <S.Paragraph as={motion.p} variants={fadeUp}>
            Acreditamos que alta performance começa na ciência e termina no resultado. Cada produto que desenvolvemos parte de evidência clínica e passa por validação rigorosa antes de chegar ao atleta.
          </S.Paragraph>
        </S.Body>
      </S.MissionOuter>

      <S.PillarsOuter>
        <S.PillarsSection ref={pillarsRef}>
          <motion.div variants={staggerContainer} initial="hidden" animate={pillarsInView ? 'visible' : 'hidden'}>
            <S.SectionLabel as={motion.p} variants={fadeUp}>Nossos pilares</S.SectionLabel>
            <S.Title as={motion.h2} variants={fadeUp}>Tecnologia aplicada<br />à performance esportiva</S.Title>
            <S.PillarsGrid as={motion.div} variants={fadeUp}>
              {PILLARS.map((p) => (
                <Surface key={p.title} tone="subtle" padding="lg">
                  <S.PillarIcon>{p.icon}</S.PillarIcon>
                  <S.PillarTitle>{p.title}</S.PillarTitle>
                  <S.PillarBody>{p.body}</S.PillarBody>
                </Surface>
              ))}
            </S.PillarsGrid>
          </motion.div>
        </S.PillarsSection>
      </S.PillarsOuter>

      <S.ApproachOuter>
        <S.ApproachSection ref={approachRef}>
          <motion.div variants={staggerContainer} initial="hidden" animate={approachInView ? 'visible' : 'hidden'}>
            <S.ApproachLabel as={motion.p} variants={fadeUp}>Metodologia</S.ApproachLabel>
            <S.ApproachTitle as={motion.h2} variants={fadeUp}>Nossa Abordagem</S.ApproachTitle>
            <S.ApproachGrid as={motion.div} variants={fadeUp}>
              {APPROACH.map((a) => (
                <S.ApproachItem key={a.title}>
                  <S.ApproachItemTitle>{a.title}</S.ApproachItemTitle>
                  <S.ApproachItemBody>{a.body}</S.ApproachItemBody>
                </S.ApproachItem>
              ))}
            </S.ApproachGrid>
          </motion.div>
        </S.ApproachSection>
      </S.ApproachOuter>

      <S.CtaSection ref={ctaRef}>
        <motion.div variants={staggerContainer} initial="hidden" animate={ctaInView ? 'visible' : 'hidden'}>
          <S.CtaTitle as={motion.h2} variants={fadeUp}>Conheça nossos produtos</S.CtaTitle>
          <S.CtaBody as={motion.p} variants={fadeUp}>Comece pela moldeira Biteplaner — o primeiro produto de alta performance da Nexor.</S.CtaBody>
          <S.CtaButtons as={motion.div} variants={fadeUp}>
            <Link to="/biteplaner"><Button>Conhecer Biteplaner</Button></Link>
            <Link to="/"><Button variant="secondary">Voltar ao início</Button></Link>
          </S.CtaButtons>
        </motion.div>
      </S.CtaSection>
    </S.Page>
  );
}
