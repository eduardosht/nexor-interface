import {
  Activity,
  BadgeCheck,
  Dumbbell,
  Heart,
  Quote,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  Target,
  Trophy,
  UsersRound,
  Zap,
} from 'lucide-react';
import type { Variants } from 'motion/react';
import { Collapse } from '@nexor/design-system';
import * as S from './styles';

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 34, scale: 0.98 },
  show: (index = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 1.05,
      delay: index * 0.16,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

const HERO_PROOFS = [
  { icon: ShieldCheck, title: 'Avaliação antes da compra' },
  { icon: BadgeCheck, title: 'Produção personalizada' },
  { icon: ShieldCheck, title: 'Protocolo e acompanhamento profissional' },
];

const USE_CASES = [
  {
    icon: Trophy,
    title: 'Esportes de combate',
    body: 'Para atletas de Jiu-Jitsu, MMA, boxe e kickboxing que vivem contato, pressão e repetição de impacto nos treinos.',
  },
  {
    icon: Zap,
    title: 'Força e alta intensidade',
    body: 'Para quem percebe apertamento, tensão mandibular ou dores mais previsíveis em treinos de carga e esforço.',
  },
  {
    icon: UsersRound,
    title: 'Esportes coletivos',
    body: 'Para atletas com contato, disputas físicas, cabeçadas ou choques frequentes em quadra, campo ou pista.',
  },
];

const JOURNEY_STEPS = [
  {
    n: 1,
    icon: Dumbbell,
    label: 'Entrada',
    title: 'Conta Nexor',
    body: 'Crie ou acesse sua conta para iniciar o processo de elegibilidade e garantir segurança dos dados.',
  },
  {
    n: 2,
    icon: Trophy,
    label: 'Elegibilidade',
    title: 'Pré-consulta',
    body: 'Informe esporte, rotina, histórico e sintomas para entender uma clínica licenciada.',
  },
  {
    n: 3,
    icon: ShieldCheck,
    label: 'Avaliação',
    title: 'Dentista licenciado',
    body: 'Profissional avalia sua condição clínica e conduz até a produção do dispositivo.',
  },
  {
    n: 4,
    icon: Activity,
    label: 'Compra segura',
    title: 'Pagamento após aptidão',
    body: 'Confirmada sua aptidão, o pagamento será realizado após a primeira consulta do dentista.',
  },
  {
    n: 5,
    icon: SlidersHorizontal,
    label: 'Laboratório',
    title: 'Produção personalizada',
    body: 'A fabricação segue a solicitação profissional, os padrões necessários e o processo operacional do produto.',
  },
  {
    n: 6,
    icon: BadgeCheck,
    label: 'Uso real',
    title: 'Adaptação e acompanhamento',
    body: 'A entrega será feito pelo dentista, o qual realizará os devidos ajustes e adaptações, com retornos para os novos ajustes.',
  },
];

const COMPARISON = [
  ['Avaliação', 'Sem avaliação profissional', 'Avaliação odontológica antes da compra'],
  ['Ajuste', 'Tentativa padrão e adaptação limitada', 'Processo personalizado a partir da jornada profissional'],
  ['Compra', 'Usuário decide sozinho', 'Pagamento após aptidão clínica declarada'],
  ['Acompanhamento', 'Normalmente não incluído', 'Entrega, adaptação e retornos orientados'],
];

const EDUCATION = [
  {
    icon: ShieldCheck,
    title: 'Impacto e apertamento',
    body: 'Treinos intensos podem envolver contato, tensão e apertamento mandibular. Entender esse contexto ajuda a decidir com clareza.',
  },
  {
    icon: Heart,
    title: 'Conforto e consistência',
    body: 'Um produto que pode auxiliar no conforto e prevenção, trazendo mais segurança e longevidade.',
  },
  {
    icon: Target,
    title: 'Limites claros',
    body: 'Biteplaner não promete resultado universal. A proposta é clareza, diagnóstico, personalização, adaptação e acompanhamento.',
  },
];

const TRUST_POINTS = [
  { icon: ShieldCheck, title: 'Avaliação profissional antes da compra' },
  { icon: SlidersHorizontal, title: 'Plano com dentistas licenciados' },
  { icon: Activity, title: 'Produção sob padrões excelência' },
  { icon: Heart, title: 'Acompanhamento após recebimento' },
];

const CUSTOMER_COMMENTS = [
  {
    name: 'Marina Costa',
    context: 'Jiu-jitsu',
    quote:
      'O Biteplaner ficou firme sem incomodar durante o rola. Senti mais confiança para treinar sem ficar ajustando o protetor o tempo todo.',
  },
  {
    name: 'Rafael Nunes',
    context: 'Boxe amador',
    quote:
      'A diferença para um protetor comum foi grande. O encaixe ficou melhor, a respiração fluiu bem e consegui manter foco no treino.',
  },
  {
    name: 'Bianca Torres',
    context: 'Cross training',
    quote:
      'Nos treinos com carga alta, o Biteplaner trouxe conforto e estabilidade. Virou um item que eu uso junto com munhequeira e cinturão.',
  },
  {
    name: 'Lucas Almeida',
    context: 'MMA',
    quote:
      'O produto encaixou bem na rotina de sparring. Gostei porque protege sem dar aquela sensação volumosa que atrapalha a comunicação.',
  },
  {
    name: 'Camila Rocha',
    context: 'Handebol',
    quote:
      'Depois dos ajustes com o dentista, o Biteplaner ficou confortável para jogo e treino. Senti segurança para usar sem pensar nele.',
  },
];

const FAQ = [
  {
    q: 'O que é Biteplaner?',
    a: 'O Biteplaner é um dispositivo bucal personalizado para atletas, com avaliação odontológica, produção sob protocolo e acompanhamento profissional.',
  },
  {
    q: 'Por que preciso passar por avaliação odontológica?',
    a: 'A avaliação é necessária para confirmar se o cliente está apto para o uso.',
  },
  {
    q: 'Eu pago antes da avaliação?',
    a: 'Não. A compra do produto é feita após a primeira consulta do dentista, dado a aptidão clínica. Os valores da consulta odontológica serão feitos diretamente com o dentista.',
  },
  {
    q: 'E se eu não for considerado apto?',
    a: 'A jornada é encerrada sem cobrança do produto. O dentista também pode indicar tratamento necessário antes de aprovar a aptidão.',
  },
  {
    q: 'Para quais esportes o Biteplaner é indicado?',
    a: 'O Biteplaner é indicado para TODOS esportes, principalmente para praticantes expostos a contato, impacto repetido ou treinos intensos.',
  },
];

export function BiteplanerPage() {
  return (
    <S.Page id="main-content" tabIndex={-1}>
      <S.HeroSection>
        <S.HeroCopy>
          <S.ProductLabel>Biteplaner</S.ProductLabel>
          <S.HeroTitle>PROTEÇÃO, CONFORTO E PERFORMANCE</S.HeroTitle>
          <S.HeroSubtitle>
            Dispositivo bucal personalizado para atletas construído através de uma jornada com avaliação
            odontológica, produção sob protocolo e acompanhamento profissional.
          </S.HeroSubtitle>
          <S.HeroActions>
            <S.PrimaryCta to="/cadastro" whileHover={{ y: -2, scale: 1.015 }} whileTap={{ scale: 0.98 }}>
              Iniciar elegibilidade <span aria-hidden="true">→</span>
            </S.PrimaryCta>
            <S.SecondaryCta href="#como-funciona">Ver como funciona</S.SecondaryCta>
          </S.HeroActions>
        </S.HeroCopy>

        <S.HeroProof aria-label="Resumo da jornada Biteplaner">
          {HERO_PROOFS.map(({ icon: Icon, title }) => (
            <S.ProofItem key={title}>
              <Icon aria-hidden="true" size={28} strokeWidth={1.8} />
              <span>{title}</span>
            </S.ProofItem>
          ))}
        </S.HeroProof>
      </S.HeroSection>

      <S.SplitSection>
        <S.SectionIntro>
          <S.SectionLabel>Contexto esportivo</S.SectionLabel>
          <S.SectionTitle>Feito para a rotina real de treino e competições</S.SectionTitle>
          <S.SectionLead>
            Durante esportes de combate, força e alta intensidade, esportes coletivos de treinos e
            competições, muitos atletas absorvem contato, apertam a mandíbula ou acumulam tensão sem
            perceber. O Biteplaner modula as sobrecargas com protocolo, avaliação e acompanhamento.
          </S.SectionLead>
        </S.SectionIntro>
        <S.CardGrid>
          {USE_CASES.map(({ icon: Icon, title, body }, index) => (
            <S.FeatureCard
              key={title}
              custom={index}
              variants={cardVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.34 }}
            >
              <S.CardIcon><Icon aria-hidden="true" size={48} strokeWidth={1.6} /></S.CardIcon>
              <S.CardTitle>{title}</S.CardTitle>
              <S.CardBody>{body}</S.CardBody>
            </S.FeatureCard>
          ))}
        </S.CardGrid>
      </S.SplitSection>

      <S.ProcessOuter id="como-funciona">
        <S.SplitSection>
          <S.SectionIntro>
            <S.SectionLabel>Como funciona</S.SectionLabel>
            <S.SectionTitle>Da elegibilidade ao acompanhamento</S.SectionTitle>
            <S.SectionLead>
              A jornada foi desenhada para que o atleta entenda o próximo passo, passe por avaliação
              profissional e compre apenas quando houver objetivo declarado.
            </S.SectionLead>
          </S.SectionIntro>
          <S.JourneyGrid data-testid="biteplaner-process-journey">
            {JOURNEY_STEPS.map(({ icon: Icon, ...step }, index) => (
              <S.StepCard
                key={step.n}
                custom={index}
                variants={cardVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
              >
                <S.StepHeader>
                  <S.StepNumber>{step.n}</S.StepNumber>
                  <div>
                    <S.StepLabel>{step.label}</S.StepLabel>
                    <S.StepTitle>{step.title}</S.StepTitle>
                  </div>
                </S.StepHeader>
                <S.StepBody>{step.body}</S.StepBody>
                <S.StepIcon aria-hidden="true">
                  <Icon size={34} strokeWidth={1.5} />
                </S.StepIcon>
              </S.StepCard>
            ))}
          </S.JourneyGrid>
        </S.SplitSection>
      </S.ProcessOuter>

      <S.ComparisonSection>
        <S.SectionIntro>
          <S.SectionLabel>Comparação</S.SectionLabel>
          <S.SectionTitle>Genérico vs Biteplaner</S.SectionTitle>
        </S.SectionIntro>
        <S.ComparisonTable>
          <thead>
            <tr>
              <th>Decisão</th>
              <th>Protetor genérico</th>
              <th>Biteplaner</th>
            </tr>
          </thead>
          <tbody>
            {COMPARISON.map(([label, common, biteplaner]) => (
              <tr key={label}>
                <td>{label}</td>
                <td><S.Cross aria-hidden="true">×</S.Cross>{common}</td>
                <td><S.Check aria-hidden="true">✓</S.Check>{biteplaner}</td>
              </tr>
            ))}
          </tbody>
        </S.ComparisonTable>
      </S.ComparisonSection>

      <S.TrustOuter>
        <S.SplitSection>
          <S.SectionIntro>
            <S.SectionLabel>Confiança</S.SectionLabel>
            <S.SectionTitle>Educação para decidir melhor</S.SectionTitle>
          </S.SectionIntro>
          <S.CardGrid>
          {EDUCATION.map(({ icon: Icon, title, body }, index) => (
              <S.FeatureCard
                key={title}
                custom={index}
                variants={cardVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.34 }}
              >
                <S.CardIcon><Icon aria-hidden="true" size={46} strokeWidth={1.6} /></S.CardIcon>
                <S.CardTitle>{title}</S.CardTitle>
                <S.CardBody>{body}</S.CardBody>
              </S.FeatureCard>
            ))}
          </S.CardGrid>
        </S.SplitSection>
        <S.TrustRail>
          {TRUST_POINTS.map(({ icon: Icon, title }) => (
            <S.TrustPoint key={title}>
              <Icon aria-hidden="true" size={30} strokeWidth={1.6} />
              <span>{title}</span>
            </S.TrustPoint>
          ))}
        </S.TrustRail>
      </S.TrustOuter>

      <S.CommentsSection aria-labelledby="biteplaner-comments-title">
        <S.SectionIntro>
          <S.SectionLabel>Comentários</S.SectionLabel>
          <S.SectionTitle id="biteplaner-comments-title">Clientes satisfeitos com o Biteplaner</S.SectionTitle>
          <S.SectionLead>
            Relatos sobre conforto, adaptação e confiança no uso real do produto.
          </S.SectionLead>
        </S.SectionIntro>
        <S.CommentsViewport data-comments-viewport>
          <S.CommentsTrack data-comments-track aria-label="Carrossel automático de comentários dos clientes">
            {[...CUSTOMER_COMMENTS, ...CUSTOMER_COMMENTS].map((comment, index) => (
              <S.CommentCard key={`${comment.name}-${index}`}>
                <S.CommentTopLine>
                  <S.CommentQuoteIcon aria-hidden="true">
                    <Quote size={18} strokeWidth={2} />
                  </S.CommentQuoteIcon>
                  <S.CommentStars aria-label="Avaliação 5 de 5">
                    {Array.from({ length: 5 }).map((_, starIndex) => (
                      <Star key={starIndex} size={15} fill="currentColor" aria-hidden="true" />
                    ))}
                  </S.CommentStars>
                </S.CommentTopLine>
                <S.CommentText>{comment.quote}</S.CommentText>
                <S.CommentAuthor>
                  <strong>{comment.name}</strong>
                  <span>{comment.context}</span>
                </S.CommentAuthor>
              </S.CommentCard>
            ))}
          </S.CommentsTrack>
        </S.CommentsViewport>
      </S.CommentsSection>

      <S.FaqSection>
        <S.FaqMedia>
          <S.SectionLabel>Dúvidas</S.SectionLabel>
          <S.SectionTitle>Perguntas frequentes</S.SectionTitle>
        </S.FaqMedia>
        <S.FaqContent>
          <S.FaqList>
            {FAQ.map((item, index) => (
              <Collapse key={item.q} trigger={item.q} defaultOpen={index === FAQ.length - 1}>
                {item.a}
              </Collapse>
            ))}
          </S.FaqList>
        </S.FaqContent>
      </S.FaqSection>

      <S.FinalCtaOuter>
        <S.FinalCtaMedia aria-hidden="true" />
        <S.FinalCtaContent>
          <S.FinalCtaTitle>Comece pela elegibilidade</S.FinalCtaTitle>
          <S.FinalCtaBody>
            Crie sua conta Nexor, escolha o Biteplaner e avance para a avaliação inicial antes de
            qualquer pagamento do produto.
          </S.FinalCtaBody>
        </S.FinalCtaContent>
        <S.FinalCtaAction>
          <S.FinalButton to="/cadastro" whileHover={{ y: -2, scale: 1.015 }} whileTap={{ scale: 0.98 }}>
            Iniciar elegibilidade <span aria-hidden="true">→</span>
          </S.FinalButton>
        </S.FinalCtaAction>
      </S.FinalCtaOuter>
    </S.Page>
  );
}
