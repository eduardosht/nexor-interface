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
  Zap,
} from 'lucide-react';
import { useState } from 'react';
import type { Variants } from 'motion/react';
import { Collapse } from '@nexor/design-system';
import heroSectionItem from '../../assets/backgrounds/hero-section-item-1.png';
import { publicOptimizedImages } from '../../assets/publicOptimizedImages';
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

const SPORT_CONTEXT_CARDS = [
  {
    imagePosition: 'left' as const,
    title: 'Esportes de combate',
    body: 'Para atletas de Jiu-Jitsu, MMA, boxe e kickboxing que vivem contato, pressão e repetição de impacto nos treinos.',
  },
  {
    imagePosition: 'center' as const,
    title: 'Força e alta intensidade',
    body: 'Para quem percebe apertamento, tensão mandibular ou dores em treinos de carga e esforço.',
  },
  {
    imagePosition: 'right' as const,
    title: 'Esportes coletivos',
    body: 'Para atletas com contato, disputas físicas, cabeçadas ou choques frequentes em quadra, campo ou pista.',
  },
];

const INITIAL_COMPARISON_ROWS = 7;

const COMPARISON = [
  {
    icon: ShieldCheck,
    criterion: 'Adequação para Treinos e Competições de Lutas, esportes de contato e alto risco de colisão facial',
    generic: 'Baixa',
    traditional: 'Alta',
    biteplaner: 'Alta',
  },
  {
    icon: Dumbbell,
    criterion:
      'Adequação para Treinos de força, Musculação, Alta intensidade, Cross training, Competições e Todos os esportes, atividades e cenários que ocorra Apertamento Mandibular',
    generic: 'Não',
    traditional: 'Não',
    biteplaner: 'Total',
  },
  {
    icon: BadgeCheck,
    criterion: 'Proteção dental contra impactos',
    generic: 'Parcial',
    traditional: 'Sim',
    biteplaner: 'Sim',
  },
  {
    icon: Target,
    criterion: 'Proteção Articular (ATM)',
    generic: 'Não',
    traditional: 'Indireta',
    biteplaner: 'Direta com redução de carga articular e controle do apertamento',
  },
  {
    icon: Activity,
    criterion: 'Prevenção de microtrauma repetitivo',
    generic: 'Não',
    traditional: 'Limitada',
    biteplaner: 'Alta',
  },
  {
    icon: SlidersHorizontal,
    criterion: 'Efeito sobre dor cervicofacial crônica',
    generic: 'Não',
    traditional: 'Secundário',
    biteplaner: 'Primário; projetado para reduzir dores relacionadas a DTM induzida por apertamento',
  },
  {
    icon: Heart,
    criterion: 'Conforto em uso prolongado',
    generic: 'Não',
    traditional: 'Parcial',
    biteplaner: 'Projetado para maior conforto e adaptação individualizada',
  },
  {
    icon: Zap,
    criterion: 'Interferência na fala',
    generic: 'Alta',
    traditional: 'Moderada',
    biteplaner: 'Geralmente menor',
  },
  {
    icon: Trophy,
    criterion: 'Momento típico de uso no Esporte',
    generic: 'Durante treinos com risco de impacto',
    traditional: 'Durante competições/jogos e treinos com risco de impacto',
    biteplaner:
      'Durante competições/jogos e treinos com risco de impacto, treinos de alta intensidade com foco em performance e prevenção',
  },
  {
    icon: SlidersHorizontal,
    criterion: 'Personalização',
    generic: 'Baixa (“Boil and bite”)',
    traditional: 'Sob medida',
    biteplaner:
      'Totalmente Individualizado com ajustes tecnológicos precisos de acordo com os esportes, atividades e contexto do usuário',
  },
  {
    icon: BadgeCheck,
    criterion: 'Qualidade da Matéria-prima',
    generic: 'Muito Baixa',
    traditional: 'Moderada',
    biteplaner: 'Alta',
  },
  {
    icon: Star,
    criterion: 'Eficácia',
    generic: 'Muito baixa',
    traditional: 'Parcial (apenas proteção dental)',
    biteplaner: 'Muito alta (proteção dental e articular)',
  },
  {
    icon: Target,
    criterion: 'Relação custo-benefício em contato pleno',
    generic: 'Ruim',
    traditional: 'Muito favorável (redução de traumas graves)',
    biteplaner: 'Altamente relevante pois protege a ATM além dos dentes',
  },
  {
    icon: Dumbbell,
    criterion: 'Relação custo-benefício em atividades de força/intensidade',
    generic: 'Ruim',
    traditional: 'Limitada, pois não ataca o problema dos traumas na ATM',
    biteplaner: 'Elevada, por atuar diretamente sobre a causa biomecânica da sobrecarga',
  },
  {
    icon: Trophy,
    criterion: 'Foco em performance a longo prazo',
    generic: 'Baixo',
    traditional: 'Indireto (preserva integridade dentária)',
    biteplaner: 'Direto (reduz dor, melhora constância e longevidade de treino)',
  },
  {
    icon: Zap,
    criterion: 'Tecnologia e Aperfeiçoamento Científico Contínuo',
    generic: 'Não',
    traditional: 'Não',
    biteplaner: 'O BITEPLANER encontra-se em processo contínuo de aperfeiçoamento, validação técnica e científica',
  },
  {
    icon: Activity,
    criterion: 'Integração com plataforma de Dados',
    generic: 'Não',
    traditional: 'Não',
    biteplaner: 'Concebido como parte de uma plataforma de prevenção, dados e performance',
  },
];

const EDUCATION = [
  {
    icon: Activity,
    title: 'Impacto e apertamento',
    body: 'Treinos intensos podem envolver contato, tensão e apertamento mandibular. Entender esse contexto ajuda a decidir com clareza.',
  },
  {
    icon: Heart,
    title: 'Conforto e consistência',
    body: 'Um produto que pode auxiliar no conforto e prevenção, trazendo mais segurança e longevidade.',
  },
  {
    icon: ShieldCheck,
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
        <S.HeroForegroundItem src={heroSectionItem} alt="" aria-hidden="true" />
        <S.HeroCopy>
          <S.HeroTitle aria-label="Segurança. Conforto. Performance.">
            Segurança.
            <br />
            <span style={{ color: '#1c5e3a' }}>Conforto.</span>
            <br />
            Performance.
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
      </S.HeroSection>

      <S.TrustOuter>
        <S.TrustHero>
          <S.TrustIntro>
            <S.MarketingEyebrow>Comparação</S.MarketingEyebrow>
            <S.MarketingSectionTitle>Educação para decidir <S.MarketingTitleAccent>melhor</S.MarketingTitleAccent></S.MarketingSectionTitle>
            <S.MarketingSectionLead>
              Informações e tecnologia para transformar performance em decisões mais inteligentes.
            </S.MarketingSectionLead>
          </S.TrustIntro>
        </S.TrustHero>

        <S.EducationRail>
          {EDUCATION.map(({ icon: Icon, title, body }, index) => (
            <S.EducationItem
              key={title}
              data-testid="education-layout-item"
              custom={index}
              variants={cardVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.34 }}
            >
              <S.EducationIcon data-testid="education-icon">
                <Icon aria-hidden="true" size={34} strokeWidth={1.7} />
              </S.EducationIcon>
              <S.EducationCopy>
                <S.EducationTitle>{title}</S.EducationTitle>
                <S.EducationBody>{body}</S.EducationBody>
              </S.EducationCopy>
            </S.EducationItem>
          ))}
        </S.EducationRail>
        <S.TrustRail>
          {TRUST_POINTS.map(({ icon: Icon, title }) => (
            <S.TrustPoint key={title} data-testid="trust-rail-item">
              <Icon aria-hidden="true" size={30} strokeWidth={1.6} />
              <span>{title}</span>
            </S.TrustPoint>
          ))}
        </S.TrustRail>
      </S.TrustOuter>

      <S.ProcessOuter id="como-funciona">
        <S.SplitSection>
          <S.SectionIntro>
            <S.MarketingEyebrow>Como funciona</S.MarketingEyebrow>
            <S.MarketingSectionTitle>Da elegibilidade ao acompanhamento</S.MarketingSectionTitle>
            <S.MarketingSectionLead>
              A jornada foi desenhada para que o atleta entenda o passo a passo e possa adquirir o dispositivo
              após avaliação do dentista.
            </S.MarketingSectionLead>
          </S.SectionIntro>
          <S.JourneyGrid data-testid="biteplaner-process-journey">
            {JOURNEY_STEPS.map(({ icon: Icon, ...step }, index) => (
              <S.StepCard
                key={step.n}
                data-step-number={step.n}
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

      <S.RealRoutineSection>
        <S.RealRoutineContent>
          <S.MarketingSectionTitle $size="feature">
            Feito para a rotina real de <span>treinos e competições</span>
          </S.MarketingSectionTitle>
          <S.MarketingSectionLead $size="feature">
            Nos esportes individuais ou coletivos de combate, força e alta intensidade, durante treinos e competições,
            muitos atletas absorvem contato, apertam a mandíbula ou acumulam tensão sem perceber. O Biteplaner® modula
            as sobrecargas através de um processo tecnológico e avaliações periódicas.
          </S.MarketingSectionLead>
        </S.RealRoutineContent>
        <S.RealRoutineVisual>
          {SPORT_CONTEXT_CARDS.map(({ ...card }) => (
            <S.RealRoutineCard key={card.title} $imagePosition={card.imagePosition}>
              <S.RealRoutineCardAccent aria-hidden="true" />
              <S.MarketingCardTitle $tone="light" $size="lg">{card.title}</S.MarketingCardTitle>
              <S.MarketingBodyText $tone="light">{card.body}</S.MarketingBodyText>
            </S.RealRoutineCard>
          ))}
        </S.RealRoutineVisual>
      </S.RealRoutineSection>

      <S.ComparisonSection>
        <S.ComparisonHeader>
          <S.SectionIntro>
            <S.MarketingEyebrow>Comparação</S.MarketingEyebrow>
            <S.MarketingSectionTitle>Protetores Bucais vs <S.MarketingTitleAccent>Biteplaner</S.MarketingTitleAccent></S.MarketingSectionTitle>
            <S.MarketingSectionLead>
              Compare e entenda por que o Biteplaner oferece mais proteção, conforto e performance para atletas de alta demanda.
            </S.MarketingSectionLead>
          </S.SectionIntro>
          <S.ComparisonProductVisual>
            <picture>
              <source srcSet={publicOptimizedImages.biteplaner.faqProduct.avif} type="image/avif" />
              <img
                src={publicOptimizedImages.biteplaner.faqProduct.webp}
                alt="Dispositivo Biteplaner na comparação"
                loading="lazy"
              />
            </picture>
          </S.ComparisonProductVisual>
        </S.ComparisonHeader>
        <S.ComparisonTableViewport
          role="region"
          aria-label="Tabela comparativa com rolagem horizontal"
          tabIndex={0}
        >
          <S.ComparisonTable>
            <thead>
              <tr>
                <th>Critério</th>
                <th><S.ColumnHeaderContent><ShieldCheck aria-hidden="true" size={25} strokeWidth={1.5} />Protetor Genérico</S.ColumnHeaderContent></th>
                <th><S.ColumnHeaderContent><ShieldCheck aria-hidden="true" size={25} strokeWidth={1.5} />Protetor Tradicional</S.ColumnHeaderContent></th>
                <th data-highlighted-column="true" style={{ fontSize: 18 }}><S.ColumnHeaderContent><ShieldCheck aria-hidden="true" size={25} strokeWidth={1.7} />BITEPLANER</S.ColumnHeaderContent></th>
              </tr>
            </thead>
            <tbody>
              {visibleComparisonRows.map(({ icon: Icon, ...row }) => (
                <tr key={row.criterion}>
                  <td>
                    <S.CriterionContent>
                      <S.CriterionIcon data-testid="comparison-criterion-icon">
                        <Icon aria-hidden="true" size={32} strokeWidth={1.7} />
                      </S.CriterionIcon>
                      <span>{row.criterion}</span>
                    </S.CriterionContent>
                  </td>
                  <td><S.ComparisonValue>{row.generic}</S.ComparisonValue></td>
                  <td><S.ComparisonValue>{row.traditional}</S.ComparisonValue></td>
                  <td data-highlighted-cell="true"><S.ComparisonValue>{row.biteplaner}</S.ComparisonValue></td>
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

      <S.CommentsSection aria-labelledby="biteplaner-comments-title">
        <S.SectionIntro>
          <S.MarketingEyebrow>Comentários</S.MarketingEyebrow>
          <S.MarketingSectionTitle id="biteplaner-comments-title">Clientes satisfeitos com o Biteplaner</S.MarketingSectionTitle>
          <S.MarketingSectionLead>
            Relatos sobre conforto, adaptação e confiança no uso real do produto.
          </S.MarketingSectionLead>
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
          <S.MarketingEyebrow>Dúvidas</S.MarketingEyebrow>
          <S.MarketingSectionTitle>Perguntas frequentes</S.MarketingSectionTitle>
        </S.FaqMedia>
        <S.FaqContent>
          <S.FaqList>
            {FAQ.map((item) => (
              <Collapse key={item.q} trigger={item.q} defaultOpen={item.q === FAQ[0].q}>
                {item.a}
              </Collapse>
            ))}
          </S.FaqList>
        </S.FaqContent>
      </S.FaqSection>

      <S.FinalCtaOuter>
        <S.FinalCtaInner>
          <S.FinalCtaMedia aria-hidden="true" />
          <S.FinalCtaContent>
            <S.MarketingSectionTitle $tone="light">Comece pela elegibilidade</S.MarketingSectionTitle>
            <S.MarketingSectionLead $tone="light">
              Crie sua conta Nexor, escolha o Biteplaner e avance para a avaliação inicial antes de
              qualquer pagamento do produto.
            </S.MarketingSectionLead>
          </S.FinalCtaContent>
          <S.FinalCtaAction>
            <S.FinalButton to="/cadastro" whileHover={{ y: -2, scale: 1.015 }} whileTap={{ scale: 0.98 }}>
              Iniciar elegibilidade <span aria-hidden="true">→</span>
            </S.FinalButton>
          </S.FinalCtaAction>
        </S.FinalCtaInner>
      </S.FinalCtaOuter>
    </S.Page>
  );
}
