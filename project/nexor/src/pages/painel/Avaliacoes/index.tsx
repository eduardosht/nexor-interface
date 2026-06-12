import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, ClipboardList, Clock3, Star, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { SkeletonCard, SkeletonGrid } from '../../../components/Skeleton';
import { useAuth } from '../../../hooks/useAuth';
import {
  fetchOrders,
  fetchWorkflowForms,
  formatDate,
  getAuthToken,
  getOrderDisplayId,
  submitWorkflowForm,
  type AccessMode,
  type DemoOrderSummary,
  type DemoWorkflowForm,
} from '../../../features/demo/biteplanerFlow';
import { biteplanerQueryKeys } from '../../../features/demo/biteplanerQueryKeys';
import {
  BITEPLANER_REVIEW_TEMPLATES,
  type BiteplanerReviewFieldDefinition,
  type BiteplanerReviewTemplateDefinition,
} from '../biteplanerReviewForms';
import * as S from './styles';

type ReviewMode = Extract<AccessMode, 'user' | 'partner' | 'dentist' | 'lab'>;

type ReviewRow = {
  id: string;
  order: DemoOrderSummary;
  form: DemoWorkflowForm;
  templateLabel: string;
  reviewer: string;
  direction: string;
  score: number;
  comment: string;
  criteria: Array<{ label: string; value: number }>;
};

const MODE_COPY: Record<ReviewMode, { title: string; description: string; templates: string[] }> = {
  user: {
    title: 'Avaliações enviadas pelo cliente',
    description: 'Surveys liberados para o cliente após interações com parceiro, dentista e jornada Biteplaner.',
    templates: ['dentist_review_by_customer', 'partner_review_by_customer'],
  },
  partner: {
    title: 'Avaliações do parceiro',
    description: 'Feedbacks de clientes sobre academia, coach ou parceiro indicador após cadastro por link de recomendação.',
    templates: ['partner_review_by_customer'],
  },
  dentist: {
    title: 'Avaliações do dentista',
    description: 'Visão das avaliações recebidas de clientes e dos feedbacks trocados com laboratórios.',
    templates: ['dentist_review_by_customer', 'lab_review_by_dentist', 'dentist_review_by_lab'],
  },
  lab: {
    title: 'Avaliações do laboratório',
    description: 'Feedbacks técnicos do ciclo laboratório, incluindo avaliações feitas por dentistas e pelo laboratório.',
    templates: ['lab_review_by_dentist', 'dentist_review_by_lab'],
  },
};

const SURVEY_MOMENTS = [
  {
    templateKey: 'partner_review_by_customer',
    title: 'Cliente avalia parceiro indicador',
    actor: 'Cliente',
    moment:
      'Após o primeiro cadastro na Nexor feito por link de recomendação/link de parceiro, antes de depender da ordem avançar.',
  },
  {
    templateKey: 'dentist_review_by_customer',
    title: 'Cliente avalia dentista',
    actor: 'Cliente',
    moment:
      'Após consulta de adaptação/entrega do dispositivo, quando o cliente já consegue avaliar atendimento, prazo, consultório e ajuste.',
  },
  {
    templateKey: 'lab_review_by_dentist',
    title: 'Dentista avalia laboratório',
    actor: 'Dentista',
    moment:
      'Após o laboratório concluir a produção e o dentista receber ou validar o dispositivo bruto entregue.',
  },
  {
    templateKey: 'dentist_review_by_lab',
    title: 'Laboratório avalia dentista',
    actor: 'Laboratório',
    moment:
      'Quando o laboratório recebe/inicia a produção e consegue avaliar o arquivo 3D intraoral e a facilidade de contato.',
  },
];

function getDefaultMomentKey(copy: (typeof MODE_COPY)[ReviewMode]) {
  return SURVEY_MOMENTS.find((moment) => copy.templates.includes(moment.templateKey))?.templateKey ?? copy.templates[0];
}

function getMode(value: string | null): ReviewMode {
  if (value === 'user' || value === 'partner' || value === 'lab' || value === 'dentist') {
    return value;
  }

  return 'dentist';
}

function getNumericCriteria(form: DemoWorkflowForm) {
  const template = getTemplate(form.templateKey);
  const payload = form.payload ?? {};

  return (template?.fields ?? [])
    .filter((field) => field.type === 'score')
    .map((field) => ({ label: field.label.replace(/^Nota - /, ''), value: normalizeScore(Number(payload[field.key])) }))
    .filter((field) => Number.isFinite(field.value));
}

function average(values: number[]) {
  if (!values.length) {
    return 0;
  }

  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10;
}

function normalizeScore(score: number) {
  if (!Number.isFinite(score)) {
    return 0;
  }

  if (score > 5) {
    return Math.round((score / 2) * 10) / 10;
  }

  return score;
}

function getComment(form: DemoWorkflowForm) {
  const comment = form.payload?.comment;
  return typeof comment === 'string' && comment.trim()
    ? comment.trim()
    : 'Avaliação registrada sem comentário textual.';
}

function getReviewer(form: DemoWorkflowForm, order: DemoOrderSummary) {
  if (form.templateKey === 'dentist_review_by_customer' || form.templateKey === 'partner_review_by_customer') {
    return order.customer?.full_name ?? 'Cliente Biteplaner';
  }

  if (form.templateKey === 'lab_review_by_dentist') {
    return order.dentist?.full_name ?? 'Dentista Biteplaner';
  }

  return 'Laboratório Biteplaner';
}

function getDirection(templateKey: string) {
  if (templateKey === 'dentist_review_by_customer') {
    return 'Cliente avaliando dentista';
  }

  if (templateKey === 'partner_review_by_customer') {
    return 'Cliente avaliando parceiro';
  }

  if (templateKey === 'lab_review_by_dentist') {
    return 'Dentista avaliando laboratório';
  }

  if (templateKey === 'dentist_review_by_lab') {
    return 'Laboratório avaliando dentista';
  }

  return 'Avaliação operacional';
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function Stars({ score }: { score: number }) {
  const rounded = Math.round(score);

  return (
    <S.Stars aria-label={`${score.toFixed(1)} de 5`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star key={index} size={16} fill={index < rounded ? 'currentColor' : 'none'} />
      ))}
    </S.Stars>
  );
}

function getTemplate(templateKey: string) {
  return BITEPLANER_REVIEW_TEMPLATES[templateKey as keyof typeof BITEPLANER_REVIEW_TEMPLATES];
}

function isScoreField(field: BiteplanerReviewFieldDefinition) {
  return field.type === 'score';
}

function getEmptyPayload(template: BiteplanerReviewTemplateDefinition) {
  return Object.fromEntries(template.fields.map((field) => [field.key, ''])) as Record<string, string>;
}

function getPendingSurveyContext(form: DemoWorkflowForm, order: DemoOrderSummary) {
  const orderLabel = getOrderDisplayId(order);

  if (form.templateKey === 'partner_review_by_customer') {
    return 'Cadastro via link de recomendação do parceiro';
  }

  if (form.templateKey === 'dentist_review_by_customer') {
    return `Ordem ${orderLabel} | feedback pós-atendimento`;
  }

  if (form.templateKey === 'lab_review_by_dentist') {
    return `Ordem ${orderLabel} | laboratório ${order.practice_location?.name ?? 'selecionado'}`;
  }

  return `Ordem ${orderLabel} | dentista ${order.dentist?.full_name ?? 'responsável'}`;
}

export function Avaliacoes() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const token = getAuthToken(session);
  const queryOwnerId = session?.user.id ?? 'anonymous';
  const [searchParams, setSearchParams] = useSearchParams();
  const mode = getMode(searchParams.get('mode'));
  const copy = MODE_COPY[mode];
  const [selectedMomentKey, setSelectedMomentKey] = useState(getDefaultMomentKey(copy));
  const [selectedSurvey, setSelectedSurvey] = useState<{ order: DemoOrderSummary; form: DemoWorkflowForm } | null>(null);
  const [surveyPayload, setSurveyPayload] = useState<Record<string, string>>({});
  const [surveyError, setSurveyError] = useState('');
  const [surveyFieldErrors, setSurveyFieldErrors] = useState<Record<string, string>>({});
  const [surveySubmitting, setSurveySubmitting] = useState(false);
  const pendingCarouselRef = useRef<HTMLDivElement | null>(null);

  const reviewsQuery = useQuery({
    queryKey: biteplanerQueryKeys.reviews(mode, queryOwnerId),
    queryFn: async () => {
      const ordersResponse = await queryClient.fetchQuery({
        queryKey: biteplanerQueryKeys.orders(mode, queryOwnerId),
        queryFn: () => fetchOrders(mode, token),
        staleTime: 60_000,
      });
      const formEntries = await Promise.all(
        ordersResponse.orders.map(async (order) => {
          const response = await queryClient.fetchQuery({
            queryKey: biteplanerQueryKeys.workflowForms(order.id),
            queryFn: () => fetchWorkflowForms(order.id, token),
            staleTime: 5 * 60_000,
          });
          return response.forms.map((form) => ({ order, form }));
        })
      );

      return {
        orders: ordersResponse.orders,
        forms: formEntries.flat(),
      };
    },
    enabled: Boolean(token),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
  const orders = reviewsQuery.data?.orders ?? [];
  const forms = reviewsQuery.data?.forms ?? [];
  const loading = reviewsQuery.isLoading;
  const error = reviewsQuery.isError ? 'Não foi possível carregar as avaliações agora.' : '';

  useEffect(() => {
    setSelectedMomentKey(getDefaultMomentKey(copy));
  }, [copy.templates, mode]);

  const rows = useMemo<ReviewRow[]>(
    () =>
      forms
        .filter(({ form }) => copy.templates.includes(form.templateKey))
        .filter(({ form }) => form.status === 'submitted')
        .map(({ order, form }) => {
          const criteria = getNumericCriteria(form);
          const score = average(criteria.map((field) => field.value));
          const template = getTemplate(form.templateKey);

          return {
            id: form.id,
            order,
            form,
            templateLabel: template?.label ?? form.templateKey,
            reviewer: getReviewer(form, order),
            direction: getDirection(form.templateKey),
            score,
            comment: getComment(form),
            criteria,
          };
        }),
    [copy.templates, forms]
  );

  const pendingSurveys = useMemo(
    () =>
      forms
        .filter(({ form }) => {
          const template = getTemplate(form.templateKey);
          return template?.actorMode === mode && form.status !== 'submitted';
        })
        .sort((left, right) => new Date(left.form.releasedAt).getTime() - new Date(right.form.releasedAt).getTime()),
    [forms, mode]
  );

  const scoreFive = average(rows.map((row) => row.score));
  const totalRatings = rows.length;
  const distribution = [5, 4, 3, 2, 1].map((score) => {
    const count = rows.filter((row) => Math.round(row.score) === score).length;
    const percent = totalRatings > 0 ? Math.round((count / totalRatings) * 100) : 0;
    return { score, count, percent };
  });
  const templateSummaries = copy.templates.map((templateKey) => {
    const templateRows = rows.filter((row) => row.form.templateKey === templateKey);
    const template = getTemplate(templateKey);
    return {
      key: templateKey,
      label: template?.label ?? templateKey,
      score: average(templateRows.map((row) => row.score)),
    };
  });
  const surveyMoments = SURVEY_MOMENTS.filter((moment) => copy.templates.includes(moment.templateKey));
  const selectedMoment = surveyMoments.find((moment) => moment.templateKey === selectedMomentKey) ?? surveyMoments[0];
  const selectedMomentRows = selectedMoment
    ? rows.filter((row) => row.form.templateKey === selectedMoment.templateKey)
    : [];

  const selectedTemplate = selectedSurvey ? getTemplate(selectedSurvey.form.templateKey) : null;

  useEffect(() => {
    const surveyId = searchParams.get('surveyId');

    if (!surveyId || selectedSurvey?.form.id === surveyId) {
      return;
    }

    const pendingSurvey = pendingSurveys.find((entry) => entry.form.id === surveyId);

    if (pendingSurvey) {
      openSurvey(pendingSurvey);
    }
  }, [pendingSurveys, searchParams, selectedSurvey?.form.id]);

  function openSurvey(entry: { order: DemoOrderSummary; form: DemoWorkflowForm }) {
    const template = getTemplate(entry.form.templateKey);

    if (!template) {
      return;
    }

    setSelectedSurvey(entry);
    setSurveyPayload(getEmptyPayload(template));
    setSurveyError('');
    setSurveyFieldErrors({});
  }

  function scrollPendingSurveys(direction: 'previous' | 'next') {
    const carousel = pendingCarouselRef.current;

    if (!carousel) {
      return;
    }

    carousel.scrollBy({
      left: direction === 'next' ? carousel.clientWidth : -carousel.clientWidth,
      behavior: 'smooth',
    });
  }

  function closeSurvey() {
    if (surveySubmitting) {
      return;
    }

    const surveyId = searchParams.get('surveyId');
    if (surveyId && selectedSurvey?.form.id === surveyId) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('surveyId');
      setSearchParams(nextParams, { replace: true });
    }

    setSelectedSurvey(null);
    setSurveyPayload({});
    setSurveyError('');
    setSurveyFieldErrors({});
  }

  function getSurveyFieldError(field: BiteplanerReviewFieldDefinition) {
    const value = surveyPayload[field.key] ?? '';

    if (field.required && !String(value).trim()) {
      return 'Campo obrigatório';
    }

    if (isScoreField(field) && String(value).trim()) {
      const score = Number(value);

      if (!Number.isFinite(score) || score < 1 || score > 5) {
        return 'Escolha uma nota de 1 a 5 estrelas.';
      }
    }

    return '';
  }

  function validateSurveyField(field: BiteplanerReviewFieldDefinition) {
    const message = getSurveyFieldError(field);
    setSurveyFieldErrors((current) => {
      if (!message) {
        const { [field.key]: _removed, ...next } = current;
        return next;
      }

      return { ...current, [field.key]: message };
    });
  }

  function clearSurveyFieldError(fieldKey: string) {
    setSurveyFieldErrors((current) => {
      if (!current[fieldKey]) {
        return current;
      }

      const { [fieldKey]: _removed, ...next } = current;
      return next;
    });
  }

  function validateSurveyFields(): Record<string, string> {
    if (!selectedTemplate) {
      return {};
    }

    const nextErrors = selectedTemplate.fields.reduce<Record<string, string>>((result, field) => {
      const message = getSurveyFieldError(field);
      if (message) {
        result[field.key] = message;
      }
      return result;
    }, {});
    setSurveyFieldErrors(nextErrors);
    return nextErrors;
  }

  async function handleSurveySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedSurvey || !selectedTemplate) {
      return;
    }

    const fieldErrors = validateSurveyFields();
    const missingField = selectedTemplate.fields.find((field) => fieldErrors[field.key] === 'Campo obrigatório');

    if (missingField) {
      setSurveyError(`Preencha o campo obrigatório: ${missingField.label.replace(/^Nota - /, '')}.`);
      return;
    }

    const invalidScoreField = selectedTemplate.fields.find(
      (field) => fieldErrors[field.key] === 'Escolha uma nota de 1 a 5 estrelas.'
    );

    if (invalidScoreField) {
      setSurveyError(`Escolha uma nota de 1 a 5 estrelas em: ${invalidScoreField.label.replace(/^Nota - /, '')}.`);
      return;
    }

    const payload = selectedTemplate.fields.reduce<Record<string, unknown>>((result, field) => {
      const value = surveyPayload[field.key];

      if (isScoreField(field)) {
        if (value !== '') {
          result[field.key] = Number(value);
        }
        return result;
      }

      if (typeof value === 'string' && value.trim()) {
        result[field.key] = value.trim();
      }

      return result;
    }, {});

    try {
      setSurveySubmitting(true);
      setSurveyError('');
      const updatedForm = await submitWorkflowForm(selectedSurvey.order.id, selectedSurvey.form.id, payload, token);
      queryClient.setQueryData<{ forms: DemoWorkflowForm[] }>(
        biteplanerQueryKeys.workflowForms(selectedSurvey.order.id),
        (current) => ({
          forms: (current?.forms ?? []).map((form) => (form.id === updatedForm.id ? updatedForm : form)),
        })
      );
      queryClient.setQueryData<{ orders: DemoOrderSummary[]; forms: Array<{ order: DemoOrderSummary; form: DemoWorkflowForm }> }>(
        biteplanerQueryKeys.reviews(mode, queryOwnerId),
        (current) =>
          current
            ? {
                ...current,
                forms: current.forms.map((entry) =>
                  entry.form.id === updatedForm.id && entry.order.id === selectedSurvey.order.id
                    ? { ...entry, form: updatedForm }
                    : entry
                ),
              }
            : current
      );
      setSelectedMomentKey(updatedForm.templateKey);
      closeSurvey();
    } catch {
      setSurveyError('Não foi possível enviar o survey agora.');
    } finally {
      setSurveySubmitting(false);
    }
  }

  return (
    <S.Page>
      <S.Panel>
        <S.Header>
          <S.HeaderIcon>
            <Star size={28} aria-hidden />
          </S.HeaderIcon>
          <div>
            <S.Title>{copy.title}</S.Title>
            <S.Description>{copy.description}</S.Description>
          </div>
        </S.Header>

        {loading ? (
          <>
            <SkeletonGrid cards={3} minCardWidth="180px" />
            <SkeletonCard lines={5} blockHeight="120px" />
          </>
        ) : null}
        {error ? <S.Banner role="alert">{error}</S.Banner> : null}

        {!loading && !error ? (
          <>
            <S.SummaryGrid>
              <S.ScoreBlock>
                <S.Score>{scoreFive.toFixed(1)}</S.Score>
                <Stars score={scoreFive} />
                <S.SmallText>{totalRatings} avaliações enviadas</S.SmallText>
              </S.ScoreBlock>

              <S.Distribution aria-label="Distribuicao das notas">
                {distribution.map((item) => (
                  <S.DistributionRow key={item.score}>
                    <span>{item.score}.0</span>
                    <S.Track>
                      <S.Fill $percent={item.percent} />
                    </S.Track>
                    <span>{item.count} avaliações</span>
                  </S.DistributionRow>
                ))}
              </S.Distribution>

              <S.StatStack>
                <S.StatCard>
                  <S.StatIcon>
                    <ClipboardList size={22} aria-hidden />
                  </S.StatIcon>
                  <span>
                    <S.SmallText>Ordens analisadas</S.SmallText>
                    <S.StatValue>{orders.length}</S.StatValue>
                  </span>
                </S.StatCard>
                <S.StatCard>
                  <S.StatIcon $tone="blue">
                    <ClipboardList size={22} aria-hidden />
                  </S.StatIcon>
                  <span>
                    <S.SmallText>Templates ativos</S.SmallText>
                    <S.StatValue>{copy.templates.length}</S.StatValue>
                  </span>
                </S.StatCard>
              </S.StatStack>
            </S.SummaryGrid>

            <S.TemplateGrid>
              {templateSummaries.map((template) => (
                <S.TemplateCard key={template.key}>
                  <S.TemplateScore>{template.score.toFixed(1)}</S.TemplateScore>
                  <S.TemplateLabel>{template.label}</S.TemplateLabel>
                </S.TemplateCard>
              ))}
            </S.TemplateGrid>

            <S.Section>
              <S.SectionHeader>
                <S.SectionTitleGroup>
                  <S.SectionIcon>
                    <ClipboardList size={20} aria-hidden />
                  </S.SectionIcon>
                <div>
                  <S.SectionTitle>Surveys pendentes</S.SectionTitle>
                  <S.SectionDescription>
                    Formulários liberados para este perfil responder após os pontos de interação previstos no fluxo.
                  </S.SectionDescription>
                </div>
                </S.SectionTitleGroup>
                <S.PendingCount>{pendingSurveys.length}</S.PendingCount>
              </S.SectionHeader>
              {pendingSurveys.length > 0 ? (
                <S.PendingCarouselShell>
                  {pendingSurveys.length > 1 ? (
                    <S.PendingCarouselActions aria-label="Navegacao dos surveys pendentes">
                      <S.PendingCarouselButton
                        type="button"
                        aria-label="Survey anterior"
                        onClick={() => scrollPendingSurveys('previous')}
                      >
                        <ChevronLeft size={16} aria-hidden />
                      </S.PendingCarouselButton>
                      <S.PendingCarouselButton
                        type="button"
                        aria-label="Proximo survey"
                        onClick={() => scrollPendingSurveys('next')}
                      >
                        <ChevronRight size={16} aria-hidden />
                      </S.PendingCarouselButton>
                    </S.PendingCarouselActions>
                  ) : null}
                  <S.PendingCarousel ref={pendingCarouselRef} aria-label="Surveys pendentes para responder">
                    {pendingSurveys.map((entry) => {
                      const template = getTemplate(entry.form.templateKey);

                      return (
                        <S.PendingCard key={entry.form.id}>
                          <div>
                            <S.PendingTitle>{template?.label ?? entry.form.templateKey}</S.PendingTitle>
                            <S.ReviewMeta>{getPendingSurveyContext(entry.form, entry.order)}</S.ReviewMeta>
                            <S.SmallText>Liberado em {formatDate(entry.form.releasedAt)}</S.SmallText>
                          </div>
                          <S.SecondaryButton type="button" onClick={() => openSurvey(entry)}>
                            Responder
                          </S.SecondaryButton>
                        </S.PendingCard>
                      );
                    })}
                  </S.PendingCarousel>
                </S.PendingCarouselShell>
              ) : (
                <S.Banner>Nenhum survey pendente para este perfil.</S.Banner>
              )}
            </S.Section>

            <S.Section>
              <S.SectionHeader>
                <S.SectionTitleGroup>
                  <S.SectionIcon>
                    <Clock3 size={20} aria-hidden />
                  </S.SectionIcon>
                <div>
                  <S.SectionTitle>Momentos dos surveys</S.SectionTitle>
                  <S.SectionDescription>
                    Pontos em que os modais devem aparecer para validar todos os feedbacks do MVP.
                  </S.SectionDescription>
                </div>
                </S.SectionTitleGroup>
              </S.SectionHeader>
              <S.TriggerList>
                <S.SurveyTabs role="tablist" aria-label="Momentos dos surveys">
                  {surveyMoments.map((moment) => {
                    const isSelected = selectedMoment?.templateKey === moment.templateKey;

                    return (
                      <S.SurveyTab
                        key={moment.templateKey}
                        type="button"
                        role="tab"
                        aria-selected={isSelected}
                        aria-controls={`survey-moment-${moment.templateKey}`}
                        id={`survey-tab-${moment.templateKey}`}
                        $active={isSelected}
                        onClick={() => setSelectedMomentKey(moment.templateKey)}
                      >
                        {moment.title}
                      </S.SurveyTab>
                    );
                  })}
                </S.SurveyTabs>
                {selectedMoment ? (
                  <S.MomentPanel
                    role="tabpanel"
                    id={`survey-moment-${selectedMoment.templateKey}`}
                    aria-labelledby={`survey-tab-${selectedMoment.templateKey}`}
                  >
                    <S.ReviewList>
                      {selectedMomentRows.map((row) => (
                        <S.ReviewCard key={row.id}>
                          <S.ReviewHeader>
                            <S.Reviewer>
                              <S.Avatar>{getInitials(row.reviewer)}</S.Avatar>
                              <div>
                                <S.ReviewerName>{row.reviewer}</S.ReviewerName>
                                <S.ReviewMeta>
                                  {row.direction} | Ordem {getOrderDisplayId(row.order)} |{' '}
                                  {row.form.submittedAt ? formatDate(row.form.submittedAt) : 'Data pendente'}
                                </S.ReviewMeta>
                              </div>
                            </S.Reviewer>
                            <S.ReviewScore>
                              {row.score.toFixed(1)}
                              <Stars score={row.score} />
                            </S.ReviewScore>
                          </S.ReviewHeader>
                          <S.Comment>{row.comment}</S.Comment>
                          <S.CriteriaGrid>
                            {row.criteria.slice(0, 6).map((critérion) => (
                              <S.CriteriaPill key={`${row.id}-${critérion.label}`}>
                                <strong>{critérion.value.toFixed(1)}</strong>
                                {critérion.label}
                              </S.CriteriaPill>
                            ))}
                          </S.CriteriaGrid>
                        </S.ReviewCard>
                      ))}
                      {selectedMomentRows.length === 0 ? (
                        <S.Banner>Nenhum comentário enviado para este momento ainda.</S.Banner>
                      ) : null}
                    </S.ReviewList>
                  </S.MomentPanel>
                ) : null}
              </S.TriggerList>
            </S.Section>
          </>
        ) : null}
      </S.Panel>
      {selectedSurvey && selectedTemplate ? (
        <S.ModalOverlay role="presentation">
          <S.Modal role="dialog" aria-modal="true" aria-labelledby="survey-title">
            <S.ModalHeader>
              <div>
                <S.SectionTitle id="survey-title">{selectedTemplate.label}</S.SectionTitle>
                <S.SectionDescription>{getPendingSurveyContext(selectedSurvey.form, selectedSurvey.order)}</S.SectionDescription>
              </div>
              <S.IconButton type="button" onClick={closeSurvey} aria-label="Fechar survey">
                <X size={18} />
              </S.IconButton>
            </S.ModalHeader>
            <S.ModalForm onSubmit={handleSurveySubmit}>
              <S.SurveyIntro>
                <S.SurveyIntroIcon>
                  <Star size={18} fill="currentColor" />
                </S.SurveyIntroIcon>
                <div>
                  <S.SurveyIntroTitle>Survey de feedback</S.SurveyIntroTitle>
                  <S.SectionDescription>
                    Escolha uma nota de 1 a 5 estrelas para cada critério obrigatório.
                  </S.SectionDescription>
                </div>
              </S.SurveyIntro>
              {selectedTemplate.fields.map((field) => (
                <S.SurveyField key={field.key}>
                  <S.SurveyLabel>
                    {field.label}
                    {field.required ? <span>(*)</span> : null}
                  </S.SurveyLabel>
                  {field.helpText ? <S.SmallText>{field.helpText}</S.SmallText> : null}
                  {isScoreField(field) ? (
                    <S.ScoreOptions
                      role="radiogroup"
                      aria-label={field.label}
                      onBlur={() => validateSurveyField(field)}
                    >
                      {field.options?.map((option) => {
                        const selectedValue = Number(surveyPayload[field.key]);
                        const isSelected = surveyPayload[field.key] === String(option.value);
                        const isFilled = option.value > 0 && Number.isFinite(selectedValue) && option.value <= selectedValue;

                        return (
                        <S.ScoreOption key={option.value} $active={isFilled} $selected={isSelected}>
                          <input
                            type="radio"
                            name={field.key}
                            value={option.value}
                            checked={surveyPayload[field.key] === String(option.value)}
                            onChange={(event) => {
                              clearSurveyFieldError(field.key);
                              setSurveyPayload((current) => ({ ...current, [field.key]: event.target.value }));
                            }}
                          />
                          <span>
                            <Star size={24} fill="currentColor" aria-hidden="true" />
                            <S.ScreenReaderText>
                              {`${option.value} estrelas`}
                            </S.ScreenReaderText>
                          </span>
                        </S.ScoreOption>
                        );
                      })}
                    </S.ScoreOptions>
                  ) : (
                    <S.TextArea
                      aria-label={field.label}
                      value={surveyPayload[field.key] ?? ''}
                      maxLength={500}
                      onBlur={() => validateSurveyField(field)}
                      onChange={(event) => {
                        clearSurveyFieldError(field.key);
                        setSurveyPayload((current) => ({ ...current, [field.key]: event.target.value }));
                      }}
                    />
                  )}
                  {isScoreField(field) && (field.minLabel || field.maxLabel) ? (
                    <S.ScaleHint>
                      <span>{field.minLabel}</span>
                      <span>{field.maxLabel}</span>
                      </S.ScaleHint>
                    ) : null}
                  {surveyFieldErrors[field.key] ? (
                    <S.FieldError role="alert">{surveyFieldErrors[field.key]}</S.FieldError>
                  ) : null}
                </S.SurveyField>
              ))}
              {surveyError ? <S.ErrorText role="alert">{surveyError}</S.ErrorText> : null}
              <S.ModalActions>
                <S.GhostButton type="button" onClick={closeSurvey}>
                  Responder depois
                </S.GhostButton>
                <S.PrimaryButton type="submit" disabled={surveySubmitting}>
                  {surveySubmitting ? 'Enviando...' : 'Enviar survey'}
                </S.PrimaryButton>
              </S.ModalActions>
            </S.ModalForm>
          </S.Modal>
        </S.ModalOverlay>
      ) : null}
    </S.Page>
  );
}
