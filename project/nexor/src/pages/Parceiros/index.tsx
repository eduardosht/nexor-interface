import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Button, Surface } from '@nexor/design-system';
import { fadeUp, staggerContainer } from '../../styles/motion';
import * as S from './styles';




















const TRACKS = [
  {
    anchor: 'dentistas',
    label: 'Dentistas licenciados',
    title: 'Dentista Licenciado',
    desc: 'Licenciamento para avaliação clínica, registro odontológico e acompanhamento dos atletas que adquirem o dispositivo Biteplaner. Faça parte da rede de dentistas licenciados da Nexor.',
    tipo: 'dentista',
    steps: [
      { title: 'Licenciamento', body: 'Cadastro, validação do CRO e aprovação operacional para atuar no protocolo Biteplaner.' },
      { title: 'Capacitação', body: 'Treinamento no protocolo Nexor de avaliação, indicação, adaptação e acompanhamento do dispositivo.' },
      { title: 'Atendimento', body: 'Consultas com avaliação odontológica, orientação ao atleta e documentação necessária para a jornada.' },
      { title: 'Retornos', body: 'Acompanhamento periódico do uso, ajustes do dispositivo e suporte técnico contínuo.' },
    ],
    benefits: ['Atuação como dentista licenciado', 'Acesso ao software de acompanhamento', 'Suporte técnico dedicado'],
  },
  {
    anchor: 'parceiros',
    label: 'Parceiros licenciados',
    title: 'Academia / Coach Licenciado',
    desc: 'Licenciamento para parceiros que recomendam o dispositivo Biteplaner a alunos, atletas e comunidades esportivas com rastreabilidade pela plataforma Nexor.',
    tipo: 'parceiro',
    steps: [
      { title: 'Licenciamento', body: 'Cadastro e aprovação como parceiro licenciado para atuar no ecossistema Biteplaner.' },
      { title: 'Link de indicação', body: 'Geração de link rastreável para recomendações do dispositivo aos seus alunos e atletas.' },
      { title: 'Indicação', body: 'Compartilhamento responsável com a sua base, mantendo a jornada clínica com dentistas licenciados.' },
      { title: 'Rastreabilidade', body: 'Acompanhamento das indicações, conversões e resultados gerados pelo seu link.' },
    ],
    benefits: ['Atuação como parceiro licenciado', 'Dashboard de acompanhamento', 'Material de apoio para divulgação'],
  },
  {
    anchor: 'laboratórios',
    label: 'Laboratórios licenciados',
    title: 'Laboratório Licenciado',
    desc: 'Licenciamento para produção laboratorial de alto padrão do dispositivo Biteplaner. Processos rigorosos, materiais premium e rastreabilidade total.',
    tipo: 'laboratório',
    steps: [
      { title: 'Licenciamento', body: 'Auditoria e validação dos processos laboratoriais para atuação como laboratório licenciado.' },
      { title: 'Integração', body: 'Conexão com a plataforma de gestão de ordens e recebimento das solicitações técnicas.' },
      { title: 'Produção', body: 'Produção do dispositivo conforme protocolo Nexor, com rastreabilidade de materiais e etapas.' },
      { title: 'Controle', body: 'Inspeção de qualidade e envio rastreado ao dentista licenciado ou local de atendimento.' },
    ],
    benefits: ['Atuação como laboratório licenciado', 'Integração com plataforma digital', 'Suporte técnico do time Nexor'],
  },
];

export function Parceiros() {
  return (
    <S.Page>
      <S.HeroSection>
        <S.HeroLabel>Ecossistema Nexor</S.HeroLabel>
        <S.HeroTitle>Seja licenciado<br />pela Nexor</S.HeroTitle>
        <S.HeroSubtitle>Faça parte do ecossistema Biteplaner com três trilhas de licenciamento: parceiro, dentista e laboratório licenciados para uma jornada rastreável, técnica e integrada.</S.HeroSubtitle>
      </S.HeroSection>

      {TRACKS.map((track, i) => (
        <TrackBlock key={track.tipo} track={track} alt={i % 2 === 1} />
      ))}
    </S.Page>
  );
}

function TrackBlock({ track, alt }: { track: typeof TRACKS[0]; alt: boolean }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-15%' });

  return (
    <S.TrackOuter $alt={alt}>
      <S.TrackSection id={track.anchor} ref={ref}>
        <motion.div variants={staggerContainer} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
          <S.TrackLabel as={motion.p} variants={fadeUp}>{track.label}</S.TrackLabel>
          <S.TrackTitle as={motion.h2} variants={fadeUp}>{track.title}</S.TrackTitle>
          <S.TrackDesc as={motion.p} variants={fadeUp}>{track.desc}</S.TrackDesc>
          <motion.div variants={fadeUp}>
            <S.TrackCta to={`/cadastro?tipo=${track.tipo}`}>
              <Button>Cadastrar como {track.title}</Button>
            </S.TrackCta>
          </motion.div>
        </motion.div>

        <motion.div variants={staggerContainer} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
          <S.StepsGrid as={motion.div} variants={fadeUp}>
            {track.steps.map((s, idx) => (
              <S.StepRow key={s.title}>
                <S.StepNum>{idx + 1}</S.StepNum>
                <S.StepContent>
                  <S.StepTitle>{s.title}</S.StepTitle>
                  <S.StepBody>{s.body}</S.StepBody>
                </S.StepContent>
              </S.StepRow>
            ))}
          </S.StepsGrid>
          <motion.div variants={fadeUp}>
            <Surface tone="subtle" padding="md">
              <S.BenefitsList>
                {track.benefits.map((b) => (
                  <S.BenefitItem key={b}>{b}</S.BenefitItem>
                ))}
              </S.BenefitsList>
            </Surface>
          </motion.div>
        </motion.div>
      </S.TrackSection>
    </S.TrackOuter>
  );
}
