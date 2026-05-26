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
  Volleyball,
  Zap,
} from 'lucide-react';
import { useState, type SVGProps } from 'react';
import type { Variants } from 'motion/react';
import { Collapse } from '@nexor/design-system';
import * as S from './styles';

type InlineIconProps = SVGProps<SVGSVGElement> & {
  size?: number | string;
  strokeWidth?: number | string;
};

function BoxingGloveIcon({ size = 24, strokeWidth = 2, ...props }: InlineIconProps) {
  return (
    <svg
      {...props}
      data-testid="biteplaner-combat-glove-icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M9.4 3.2h3.8c3.4 0 6.1 2.7 6.1 6.1v2.3c0 2.5-2 4.5-4.5 4.5h-4.7c-3.1 0-5.6-2.5-5.6-5.6V8.1c0-2.7 2.2-4.9 4.9-4.9Z" />
      <path d="M9.5 3.3v7.5" />
      <path d="M12.8 3.3v7.5" />
      <path d="M16.1 4.6v6.2" />
      <path d="M14.8 10.8h2.7c1 0 1.8.8 1.8 1.8" />
      <path d="M8.7 16v3.2c0 .9.7 1.6 1.6 1.6h5.2c.9 0 1.6-.7 1.6-1.6V16" />
      <path d="M8.9 18.6h8" />
    </svg>
  );
}

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
    icon: BoxingGloveIcon,
    iconTestId: 'biteplaner-combat-glove-icon',
    title: 'Esportes de combate',
    body: 'Para atletas de Jiu-Jitsu, MMA, boxe e kickboxing que vivem contato, pressão e repetição de impacto nos treinos.',
  },
  {
    icon: Dumbbell,
    iconTestId: 'biteplaner-strength-dumbbell-icon',
    secondaryIcon: Zap,
    secondaryIconTestId: 'biteplaner-strength-zap-icon',
    title: 'Força e alta intensidade',
    body: 'Para quem percebe apertamento, tensão mandibular ou dores em treinos de carga e esforço.',
  },
  {
    icon: Volleyball,
    iconTestId: 'biteplaner-team-sport-icon',
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
    body: 'Informe esporte, rotina, histórico e sintomas para selecionar um dentista licenciado.',
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
    body: 'Confirmada sua aptidão na primeira consulta, o pagamento será realizado através da plataforma Nexor.',
  },
  {
    n: 5,
    icon: SlidersHorizontal,
    label: 'Laboratório',
    title: 'Produção personalizada',
    body: 'A fabricação ocorre após confirmação do pagamento.',
  },
  {
    n: 6,
    icon: BadgeCheck,
    label: 'Uso real',
    title: 'Adaptação e acompanhamento',
    body: 'A instalação inicial do dispositivo será feita pelo dentista, o qual realizará os devidos ajustes e adaptações, com retornos para os novos ajustes.',
  },
];

const INITIAL_COMPARISON_ROWS = 7;

const COMPARISON = [
  {
    criterion: 'Adequação para Treinos e Competições de Lutas, esportes de contato e alto risco de colisão facial',
    generic: 'Baixa',
    traditional: 'Alta',
    biteplaner: 'Alta',
  },
  {
    criterion:
      'Adequação para Treinos de força, Musculação, Alta intensidade, Cross training, Competições e Todos os esportes, atividades e cenários que ocorra Apertamento Mandibular',
    generic: 'Não',
    traditional: 'Não',
    biteplaner: 'Total',
  },
  {
    criterion: 'Proteção dental contra impactos',
    generic: 'Parcial',
    traditional: 'Sim',
    biteplaner: 'Sim',
  },
  {
    criterion: 'Proteção Articular (ATM)',
    generic: 'Não',
    traditional: 'Indireta',
    biteplaner: 'Direta com redução de carga articular e controle do apertamento',
  },
  {
    criterion: 'Prevenção de microtrauma repetitivo',
    generic: 'Não',
    traditional: 'Limitada',
    biteplaner: 'Alta',
  },
  {
    criterion: 'Efeito sobre dor cervicofacial crônica',
    generic: 'Não',
    traditional: 'Secundário',
    biteplaner: 'Primário; projetado para reduzir dores relacionadas a DTM induzida por apertamento',
  },
  {
    criterion: 'Conforto em uso prolongado',
    generic: 'Não',
    traditional: 'Parcial',
    biteplaner: 'Projetado para maior conforto e adaptação individualizada',
  },
  {
    criterion: 'Interferência na fala',
    generic: 'Alta',
    traditional: 'Moderada',
    biteplaner: 'Geralmente menor',
  },
  {
    criterion: 'Momento típico de uso no Esporte',
    generic: 'Durante treinos com risco de impacto',
    traditional: 'Durante competições/jogos e treinos com risco de impacto',
    biteplaner:
      'Durante competições/jogos e treinos com risco de impacto, treinos de alta intensidade com foco em performance e prevenção',
  },
  {
    criterion: 'Personalização',
    generic: 'Baixa (“Boil and bite”)',
    traditional: 'Sob medida',
    biteplaner:
      'Totalmente Individualizado com ajustes tecnológicos precisos de acordo com os esportes, atividades e contexto do usuário',
  },
  {
    criterion: 'Qualidade da Matéria-prima',
    generic: 'Muito Baixa',
    traditional: 'Moderada',
    biteplaner: 'Alta',
  },
  {
    criterion: 'Eficácia',
    generic: 'Muito baixa',
    traditional: 'Parcial (apenas proteção dental)',
    biteplaner: 'Muito alta (proteção dental e articular)',
  },
  {
    criterion: 'Relação custo-benefício em contato pleno',
    generic: 'Ruim',
    traditional: 'Muito favorável (redução de traumas graves)',
    biteplaner: 'Altamente relevante pois protege a ATM além dos dentes',
  },
  {
    criterion: 'Relação custo-benefício em atividades de força/intensidade',
    generic: 'Ruim',
    traditional: 'Limitada, pois não ataca o problema dos traumas na ATM',
    biteplaner: 'Elevada, por atuar diretamente sobre a causa biomecânica da sobrecarga',
  },
  {
    criterion: 'Foco em performance a longo prazo',
    generic: 'Baixo',
    traditional: 'Indireto (preserva integridade dentária)',
    biteplaner: 'Direto (reduz dor, melhora constância e longevidade de treino)',
  },
  {
    criterion: 'Tecnologia e Aperfeiçoamento Científico Contínuo',
    generic: 'Não',
    traditional: 'Não',
    biteplaner: 'O BITEPLANER encontra-se em processo contínuo de aperfeiçoamento, validação técnica e científica',
  },
  {
    criterion: 'Integração com plataforma de Dados',
    generic: 'Não',
    traditional: 'Não',
    biteplaner: 'Concebido como parte de uma plataforma de prevenção, dados e performance',
  },
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
    body: 'Biteplaner não promete resultados imediatos. A proposta é clareza, diagnóstico, personalização, adaptação e acompanhamento.',
  },
];

const TRUST_POINTS = [
  { icon: ShieldCheck, title: 'Avaliação profissional antes da compra' },
  { icon: SlidersHorizontal, title: 'Plano com dentistas licenciados' },
  { icon: Activity, title: 'Produção sob padrões de excelência' },
  { icon: Heart, title: 'Acompanhamento após recebimento' },
];

const CUSTOMER_COMMENTS = [
  {
    name: 'Marina Costa',
    context: 'Jiu-jitsu',
    quote:
      'O Biteplaner ficou firme sem incomodar durante o rola. Senti mais confiança para treinar sem ficar ajustando o dispositivo o tempo todo.',
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
    a: 'Não. A compra é feita através da plataforma Nexor, na primeira consulta com o dentista, após a confirmação de sua aptidão clínica.',
  },
  {
    q: 'E se eu não for considerado apto?',
    a: 'A jornada é encerrada sem cobrança do produto. O dentista também pode indicar algum tratamento necessário antes de aprovar a aptidão.',
  },
  {
    q: 'Para quais esportes o Biteplaner é indicado?',
    a: 'O Biteplaner é indicado para TODOS esportes, principalmente para praticantes expostos a contato, impacto repetido ou treinos intensos.',
  },
];

export function BiteplanerPage() {
  const [comparisonExpanded, setComparisonExpanded] = useState(false);
  const visibleComparisonRows = comparisonExpanded ? COMPARISON : COMPARISON.slice(0, INITIAL_COMPARISON_ROWS);

  return (
    <S.Page id="main-content" tabIndex={-1}>
      <S.HeroSection>
        <S.HeroCopy>
          <S.ProductLabel>Biteplaner</S.ProductLabel>
          <S.HeroTitle>
            Segurança
            <br />
            Conforto
            <br />
            Performance
          </S.HeroTitle>
          <S.HeroSubtitle>
            Dispositivo intraoral personalizado para atletas e praticantes de esportes construído através de uma
            jornada com avaliação odontológica, produção sob protocolo e acompanhamento profissional.
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
          <S.SectionTitle>Feito para a rotina real<br />de treinos e competições</S.SectionTitle>
          <S.SectionLead>
            Nos esportes individuais ou coletivos de combate, força e alta intensidade, durante treinos e
            competições, muitos atletas absorvem contato, apertam a mandíbula ou acumulam tensão sem perceber. O
            Biteplaner modula as sobrecargas através de um processo tecnológico e avaliações periódicas.
          </S.SectionLead>
        </S.SectionIntro>
        <S.CardGrid>
          {USE_CASES.map(({ icon: Icon, iconTestId, secondaryIcon: SecondaryIcon, secondaryIconTestId, title, body }, index) => (
            <S.FeatureCard
              key={title}
              custom={index}
              variants={cardVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.34 }}
            >
              <S.CardIcon>
                <Icon aria-hidden="true" data-testid={iconTestId} size={48} strokeWidth={1.6} />
                {SecondaryIcon ? (
                  <SecondaryIcon
                    aria-hidden="true"
                    data-testid={secondaryIconTestId}
                    size={48}
                    strokeWidth={1.6}
                  />
                ) : null}
              </S.CardIcon>
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
              A jornada foi desenhada para que o atleta entenda o passo a passo e possa adquirir o dispositivo
              após avaliação do dentista.
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
        <S.ComparisonTableViewport
          role="region"
          aria-label="Tabela comparativa com rolagem horizontal"
          tabIndex={0}
        >
          <S.ComparisonTable>
            <thead>
              <tr>
                <th>Critério</th>
                <th>Protetor Genérico</th>
                <th>Protetor Tradicional</th>
                <th>BITEPLANER</th>
              </tr>
            </thead>
            <tbody>
              {visibleComparisonRows.map((row) => (
                <tr key={row.criterion}>
                  <td>{row.criterion}</td>
                  <td>{row.generic}</td>
                  <td>{row.traditional}</td>
                  <td>{row.biteplaner}</td>
                </tr>
              ))}
            </tbody>
          </S.ComparisonTable>
        </S.ComparisonTableViewport>
        {!comparisonExpanded ? (
          <S.ComparisonToggleButton type="button" onClick={() => setComparisonExpanded(true)}>
            Mostrar comparação completa
          </S.ComparisonToggleButton>
        ) : null}
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
