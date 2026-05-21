import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { fadeUp, staggerContainer } from '../../styles/motion';
import * as S from './styles';

const PILLARS = [
  {
    title: 'Pesquisa Aplicada',
    desc: 'Estudos e validações científicas direcionadas a atletas de alta performance.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
        <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18" />
      </svg>
    ),
  },
  {
    title: 'Tecnologia de Ponta',
    desc: 'Desenvolvimento próprio com máxima precisão e controle de qualidade.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
      </svg>
    ),
  },
  {
    title: 'Acompanhamento Especializado',
    desc: 'Suporte de profissionais especialistas em todas as etapas do processo.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    title: 'Evolução Contínua',
    desc: 'Análise, feedback e melhorias constantes para máxima evolução do atleta.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
        <polyline points="23 4 23 10 17 10" />
        <polyline points="1 20 1 14 7 14" />
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
      </svg>
    ),
  },
];

export function QuemSomos() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-10%' });

  return (
    <S.Section id="quem-somos" ref={ref}>
      <S.BackgroundImage aria-hidden="true" />
      <S.BackgroundMesh aria-hidden="true" />

      <S.Content>
        <S.HeroCopy
          as={motion.div}
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          <div>
            <S.Headline as={motion.h2} variants={fadeUp}>
              Proteção. Tecnologia.
              <br />
              Performance<S.Dot>.</S.Dot>
            </S.Headline>
          </div>

          <motion.div variants={fadeUp} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <S.BodyText>
              A Nexor nasce da convicção de que o alto desempenho começa com informação precisa, métodos científicos e soluções desenvolvidas para o atleta.
            </S.BodyText>
            <S.BodyText>
              Estamos desenvolvendo uma nova abordagem para prevenção e performance biomecânica durante o treino.
            </S.BodyText>
            <S.BodyText>
              Unimos <S.EmphasisText>pesquisa científica, tecnologia de ponta</S.EmphasisText> e{' '}
              <S.EmphasisText>acompanhamento especializado</S.EmphasisText> para desenvolver produtos personalizados que elevam a performance com segurança, precisão e resultados reais.
            </S.BodyText>
          </motion.div>
        </S.HeroCopy>

        <S.PillarsGrid
          as={motion.div}
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          {PILLARS.map((pillar) => (
            <S.PillarItem key={pillar.title} as={motion.div} variants={fadeUp}>
              <S.PillarIcon>{pillar.icon}</S.PillarIcon>
              <S.PillarTitle>{pillar.title}</S.PillarTitle>
              <S.PillarDesc>{pillar.desc}</S.PillarDesc>
            </S.PillarItem>
          ))}
        </S.PillarsGrid>
      </S.Content>
    </S.Section>
  );
}
