import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Button, Surface } from '@nexor/design-system';
import { fadeUp, staggerContainer } from '../../styles/motion';
import * as S from './styles';




















const TRACKS = [
  {
    anchor: 'dentistas',
    label: 'Dentistas',
    title: 'Dentista Licenciado',
    desc: 'Credenciamento para avaliação, moldagem e acompanhamento dos pacientes que adquirem o Biteplaner. Faça parte da rede de dentistas parceiros da Nexor.',
    tipo: 'dentista',
    steps: [
      { title: 'Credenciamento', body: 'Cadastro e validação do CRO e habilitação profissional.' },
      { title: 'Capacitação', body: 'Treinamento no protocolo Nexor de avaliação e moldagem.' },
      { title: 'Atendimento', body: 'Consultas de moldagem e avaliação odontológica dos clientes.' },
      { title: 'Retornos', body: 'Acompanhamento periódico e suporte técnico contínuo.' },
    ],
    benefits: ['Renda adicional por consulta', 'Acesso ao software de acompanhamento', 'Suporte técnico dedicado'],
  },
  {
    anchor: 'parceiros',
    label: 'Academias e Coaches',
    title: 'Academia / Coach Licenciado',
    desc: 'Programa de indicação para academias e coaches que recomendam o Biteplaner para seus alunos e atletas. Ganhe por cada conversão.',
    tipo: 'parceiro',
    steps: [
      { title: 'Cadastro', body: 'Registro como parceiro comercial da Nexor.' },
      { title: 'Link de indicação', body: 'Geração de link rastreável para indicações.' },
      { title: 'Indicação', body: 'Compartilhamento com alunos e atletas da sua base.' },
      { title: 'Comissão', body: 'Recebimento automático por cada conversão realizada.' },
    ],
    benefits: ['Comissão por indicação convertida', 'Dashboard de acompanhamento', 'Material de apoio para divulgação'],
  },
  {
    anchor: 'laboratórios',
    label: 'Laboratórios',
    title: 'Laboratório Licenciado',
    desc: 'Licenciamento para produção laboratorial de alto padrão dos dispositivos personalizados Biteplaner. Processos rigorosos, materiais premium e rastreabilidade total.',
    tipo: 'laboratório',
    steps: [
      { title: 'Certificação', body: 'Auditoria e validação dos processos laboratoriais.' },
      { title: 'Integração', body: 'Conexão com a plataforma de gestão de ordens.' },
      { title: 'Produção', body: 'Fabricação das moldeiras conforme protocolo Nexor.' },
      { title: 'Controle', body: 'Inspeção de qualidade e envio rastreado ao cliente.' },
    ],
    benefits: ['Volume garantido de ordens', 'Integração com plataforma digital', 'Suporte técnico do time Nexor'],
  },
];

export function Parceiros() {
  return (
    <S.Page>
      <S.HeroSection>
        <S.HeroLabel>Ecossistema Nexor</S.HeroLabel>
        <S.HeroTitle>Seja parceiro<br />da Nexor</S.HeroTitle>
        <S.HeroSubtitle>Faça parte do ecossistema de produtos de alta performance. Três trilhas de parceria, cada uma desenhada para o seu perfil profissional.</S.HeroSubtitle>
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
