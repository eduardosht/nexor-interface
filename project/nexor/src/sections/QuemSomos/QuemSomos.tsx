import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { fadeUp, staggerContainer } from '../../styles/motion';
import * as S from './styles';

const PILLARS = [
  {
    title: 'Pesquisa Aplicada',
    desc: 'Estudos e validações técnicas orientados à interação entre corpo, movimento e performance humana.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
        <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18" />
      </svg>
    ),
  },
  {
    title: 'Tecnologia de Precisão',
    desc: 'Dados, parâmetros e processos aplicados a soluções personalizadas para o corpo e o movimento.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
      </svg>
    ),
  },
  {
    title: 'Aplicação profissional',
    desc: 'Profissionais e parceiros especializados participam das etapas que exigem avaliação, produção ou acompanhamento.',
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
    desc: 'Análise, feedback e melhorias constantes para avançar cada interface entre corpo, movimento e tecnologia.',
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
              Precisão. Personalização.
              <br />
              Performance<S.Dot>.</S.Dot>
            </S.Headline>
          </div>

          <motion.div variants={fadeUp} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <S.BodyText>
              A NEXOR ADVANCE desenvolve tecnologias de precisão para compreender, personalizar e avançar a performance humana.
            </S.BodyText>
            <S.BodyText>
              Trabalhamos na interface entre corpo, movimento e tecnologia, começando pela aplicação esportiva do BITEPLANER.
            </S.BodyText>
            <S.BodyText>
              Unimos <S.EmphasisText>conhecimento aplicado e personalização</S.EmphasisText> com{' '}
              <S.EmphasisText>evolução contínua</S.EmphasisText> para transformar necessidades específicas do corpo em soluções de performance.
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
