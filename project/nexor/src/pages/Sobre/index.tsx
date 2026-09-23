import { useRef } from 'react';
import { Link } from 'react-router';
import { motion, useInView } from 'framer-motion';
import { Button, Surface } from '@nexor/design-system';
import { fadeUp, staggerContainer } from '../../styles/motion';
import * as S from './styles';

























const PILLARS = [
  { icon: 'P', title: 'Precisão', body: 'Transformamos medidas, parâmetros e conhecimento especializado em soluções pensadas para cada contexto de uso.' },
  { icon: 'T', title: 'Personalização', body: 'Desenvolvemos tecnologias que aproximam dados, corpo e movimento para tornar cada aplicação mais individualizada.' },
  { icon: 'A', title: 'Evolução', body: 'Pesquisamos, testamos e aprimoramos continuamente a forma como a tecnologia interage com o corpo humano.' },
];

const APPROACH = [
  { title: 'Conhecimento aplicado', body: 'Partimos de perguntas concretas sobre o corpo, o movimento e a performance para orientar cada desenvolvimento.' },
  { title: 'Tecnologia de precisão', body: 'Usamos dados, parâmetros técnicos e processos digitais para criar soluções personalizadas, sem depender de uma fórmula genérica.' },
  { title: 'Aplicação profissional', body: 'Construímos jornadas com profissionais e parceiros especializados quando a solução exige avaliação, produção ou acompanhamento.' },
  { title: 'Evolução contínua', body: 'Cada produto é uma oportunidade de aprender, validar e avançar a próxima interface entre corpo, movimento e tecnologia.' },
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
            A NEXOR ADVANCE desenvolve tecnologias de precisão para compreender, personalizar e avançar a performance humana. Nosso ponto de partida é a interface entre corpo, movimento e tecnologia.
          </S.Paragraph>
          <S.Paragraph as={motion.p} variants={fadeUp}>
            O BITEPLANER é a primeira manifestação concreta dessa tese: uma tecnologia personalizada para a interface mandibular durante o treinamento de força. A partir dele, construímos conhecimento, processos e capacidade para evoluir novas soluções.
          </S.Paragraph>
        </S.Body>
      </S.MissionOuter>

      <S.PillarsOuter>
        <S.PillarsSection ref={pillarsRef}>
          <motion.div variants={staggerContainer} initial="hidden" animate={pillarsInView ? 'visible' : 'hidden'}>
            <S.SectionLabel as={motion.p} variants={fadeUp}>Nossos pilares</S.SectionLabel>
            <S.Title as={motion.h2} variants={fadeUp}>Tecnologia aplicada<br />à performance humana</S.Title>
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
          <S.CtaBody as={motion.p} variants={fadeUp}>Conheça o BITEPLANER, a primeira tecnologia da NEXOR ADVANCE aplicada à interface mandibular durante o treinamento de força.</S.CtaBody>
          <S.CtaButtons as={motion.div} variants={fadeUp}>
            <Link to="/biteplaner"><Button>Conhecer Biteplaner</Button></Link>
            <Link to="/"><Button variant="secondary">Voltar ao início</Button></Link>
          </S.CtaButtons>
        </motion.div>
      </S.CtaSection>
    </S.Page>
  );
}
