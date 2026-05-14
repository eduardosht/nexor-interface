import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { fadeUp, staggerContainer } from '../../styles/motion';
import * as S from './styles';

const PARTNERS = [
  {
    title: 'Dentista Licenciado',
    body: 'Credenciamento para avaliação, moldagem e acompanhamento dos pacientes Biteplaner.',
  },
  {
    title: 'Academia / Coach',
    body: 'Programa de indicação com benefícios para parceiros que recomendam o Biteplaner.',
  },
  {
    title: 'Laboratório Certificado',
    body: 'Parceria para produção laboratorial de alto padrão das moldeiras personalizadas.',
  },
];

export function ParceirosTeaserSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-15%' });

  return (
    <S.SectionOuter>
      <S.Section id="parceiros-teaser" ref={ref}>
        <motion.div variants={staggerContainer} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
          <S.SectionLabel as={motion.p} variants={fadeUp}>Ecossistema</S.SectionLabel>
          <S.Title as={motion.h2} variants={fadeUp}>Faça parte da rede Nexor</S.Title>

          <S.Grid as={motion.div} variants={fadeUp}>
            {PARTNERS.map((p) => (
              <S.Card key={p.title}>
                <S.CardTitle>{p.title}</S.CardTitle>
                <S.CardBody>{p.body}</S.CardBody>
              </S.Card>
            ))}
          </S.Grid>

          <S.CtaRow as={motion.div} variants={fadeUp}>
            <S.CtaLink to="/parceiros">Ver como ser parceiro →</S.CtaLink>
          </S.CtaRow>
        </motion.div>
      </S.Section>
    </S.SectionOuter>
  );
}
