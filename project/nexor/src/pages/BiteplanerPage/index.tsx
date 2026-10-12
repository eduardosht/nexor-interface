import {
  Activity,
  Box,
  ClipboardList,
  Heart,
  Quote,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  TrendingUp,
  UserRound,
} from 'lucide-react';
import type { Variants } from 'motion/react';
import { Collapse } from '@nexor/design-system';
import { Contato } from '../../sections/Contato/Contato';
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
  { n: 1, icon: UserRound, label: 'Avaliação / Elegibilidade', title: 'Especialista licenciado', body: 'Especialista licenciado Nexor Advance avalia contexto, esporte, rotina e histórico para verificar a elegibilidade e solicitar a elaboração.' },
  { n: 2, icon: ClipboardList, label: 'Escaneamento', title: 'Documentação', body: 'Escaneamento intraoral digital seguindo metodologia específica e envio da documentação à Nexor Advance.' },
  { n: 3, icon: SlidersHorizontal, label: 'Planejamento', title: 'Nexor Advance', body: 'Análise, definição de parâmetros e elaboração de projeto individualizado.' },
  { n: 4, icon: Box, label: 'Produção', title: 'Parceiro credenciado', body: 'Produção direcionada conforme o projeto individualizado e envio ao especialista responsável.' },
  { n: 5, icon: TrendingUp, label: 'Ajuste final / uso real', title: 'Especialista licenciado', body: 'Entrega ao usuário, ajustes, validação final e acompanhamento.' },
];
const SPORT_CONTEXT_CARDS = [
  {
    imagePosition: 'left' as const,
    title: 'Esportes de combate',
    body: 'Para praticantes de Jiu-Jitsu, MMA, Boxe, Kickboxing e esportes com contato, apertamento mandibular e repetição de impactos.',
  },
  {
    imagePosition: 'center' as const,
    title: 'Força e alta intensidade',
    body: 'Para praticantes de musculação, força, Cross Training, alta intensidade, atletismo e ciclismo que buscam uma interface personalizada com as demandas do movimento.',
  },
  {
    imagePosition: 'right' as const,
    title: 'Esportes de contato',
    body: 'Para praticantes de Handebol, Futebol, Rugby e esportes com contato, disputas físicas, cabeçadas ou choques frequentes em quadra, campo ou pista.',
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
    body: 'A personalização busca uma experiência mais coerente com o corpo e o contexto de treino de cada usuário.',
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
    a: 'O BITEPLANER é uma tecnologia esportiva individualizada para acompanhar demandas funcionais da região mandibular. A jornada inclui avaliação especializada, configuração individual e acompanhamento profissional.',
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
    a: 'Foi desenvolvido para diferentes demandas esportivas, incluindo atividades com esforço intenso, apertamento mandibular, contato ou impacto oral. A aplicação depende da avaliação individual por especialista licenciado.',
  },
];

export function BiteplanerPage() {

  return (
    <S.Page id="main-content" tabIndex={-1}>
      <S.HeroSection>
        <S.HeroCopy>
          <S.HeroTitle aria-label="Interface. Personalização. Performance.">
            Interface.
            <br />
            <S.MarketingTitleAccent>Personalização.</S.MarketingTitleAccent>
            <br />Performance.
          </S.HeroTitle>
          <S.HeroSubtitle>
            Tecnologia individualizada para acompanhar as demandas funcionais da região mandibular durante a prática esportiva.
          </S.HeroSubtitle>
          <S.HeroActions>
            <S.PrimaryCta to="/biteplaner#biteplaner-contato" whileHover={{ y: -2, scale: 1.015 }} whileTap={{ scale: 0.98 }}>
              Quero saber mais <span aria-hidden="true">→</span>
            </S.PrimaryCta>
            <S.SecondaryCta href="#como-funciona">Conheça a tecnologia</S.SecondaryCta>
          </S.HeroActions>
        </S.HeroCopy>
      </S.HeroSection>

      <S.ApproachSection aria-labelledby="biteplaner-approach-title">
        <S.SectionIntro>
          <S.MarketingSectionTitle id="biteplaner-approach-title">Uma nova abordagem para a interface entre função mandibular e esporte.</S.MarketingSectionTitle>
          <S.MarketingSectionLead>
            O BITEPLANER parte da individualização da função mandibular e da relação do dispositivo com as demandas específicas do usuário e da atividade. Sua arquitetura combina configuração individualizada, adaptação, fundamentos biomecânicos e recursos de proteção da região oral.
          </S.MarketingSectionLead>
        </S.SectionIntro>
        <S.ApproachGrid>
          <S.ApproachCard><h3>Função mandibular individualizada</h3><p>Configuração orientada às características do usuário e às demandas da atividade.</p></S.ApproachCard>
          <S.ApproachCard><h3>Biomecânica mandibular</h3><p>O desenvolvimento considera a relação entre posição mandibular, contatos oclusais, musculatura e demandas articulares.</p></S.ApproachCard>
          <S.ApproachCard><h3>Potencial relação com desempenho</h3><p>A literatura investiga efeitos de dispositivos oclusais sobre força, potência e desempenho. Esse campo integra o racional tecnológico do BITEPLANER.</p></S.ApproachCard>
          <S.ApproachCard><h3>Controle postural e estabilidade</h3><p>A relação entre dispositivos oclusais, equilíbrio e controle postural faz parte do campo científico considerado no desenvolvimento.</p></S.ApproachCard>
          <S.ApproachCard><h3>Demandas articulares</h3><p>Estudos experimentais apontam que aparelhos e designs distintos podem modificar pressão intra-articular, espaço articular e atividade muscular. Esse princípio orienta a abordagem individualizada.</p></S.ApproachCard>
          <S.ApproachCard><h3>Proteção da região oral</h3><p>Recursos destinados à proteção dos dentes e da região oral em atividades sujeitas a contato ou impacto.</p></S.ApproachCard>
          <S.ApproachCard><h3>Adaptação e conforto</h3><p>O planejamento individualizado busca adequada adaptação e integração à prática esportiva.</p></S.ApproachCard>
          <S.ApproachCard><h3>Evolução técnica e científica</h3><p>Desenvolvimento, validação, documentação e aperfeiçoamento contínuos.</p></S.ApproachCard>
        </S.ApproachGrid>
      </S.ApproachSection>

      <S.TrustOuter>
        <S.TrustHero>
          <S.TrustIntro>
            <S.MarketingSectionTitle $size="feature">Biomecânica mandibular: por que a configuração importa</S.MarketingSectionTitle>
            <S.MarketingSectionLead>
              A relação entre mandíbula, contatos oclusais, musculatura e ATM é biomecanicamente complexa. Estudos com aparelhos interoclusais ajudam a fundamentar o desenvolvimento; não representam ensaios clínicos do BITEPLANER.
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
            <S.MarketingSectionTitle>Da elegibilidade ao acompanhamento</S.MarketingSectionTitle>
            <S.MarketingSectionLead>
              A jornada foi desenhada para que o usuário entenda o passo a passo e possa adquirir dispositivo mediante avaliação de especialista licenciado
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
                </S.StepHeader>
                <S.StepIcon aria-hidden="true">
                  <Icon size={34} strokeWidth={1.5} />
                </S.StepIcon>
                <S.StepCopy>
                  <S.StepLabel>{step.label}</S.StepLabel>
                  <S.StepTitle>{step.title}</S.StepTitle>
                </S.StepCopy>
                <S.StepBody>{step.body}</S.StepBody>
              </S.StepCard>
            ))}
          </S.JourneyGrid>
        </S.SplitSection>
      </S.ProcessOuter>

      <S.RealRoutineSection>
        <S.RealRoutineContent>
          <S.MarketingSectionTitle $size="feature">
            Desenvolvido para <span>diferentes demandas esportivas</span>
          </S.MarketingSectionTitle>
          <S.MarketingSectionLead $size="feature">
            Pode ser aplicado em contextos nos quais demandas mandibulares, apertamento, estabilidade funcional ou contato e impacto oral façam parte da atividade. O BITEPLANER considera uma interface tecnológica individualizada, avaliações periódicas e evolução contínua.
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

      <S.CommentsSection aria-labelledby="biteplaner-comments-title">
        <S.SectionIntro>
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
          <S.FinalCtaContent>
            <S.MarketingSectionTitle $tone="light">Comece pela elegibilidade</S.MarketingSectionTitle>
            <S.MarketingSectionLead $tone="light">
              Conheça o BITEPLANER e avance para a avaliação inicial com um profissional.
            </S.MarketingSectionLead>
          </S.FinalCtaContent>
          <S.FinalCtaAction>
            <S.FinalButton to="/biteplaner#biteplaner-contato" whileHover={{ y: -2, scale: 1.015 }} whileTap={{ scale: 0.98 }}>
              Entrar em contato <span aria-hidden="true">→</span>
            </S.FinalButton>
          </S.FinalCtaAction>
        </S.FinalCtaInner>
      </S.FinalCtaOuter>
      <div id="biteplaner-contato"><Contato /></div>
    </S.Page>
  );
}
