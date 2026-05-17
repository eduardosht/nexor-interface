import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { CheckCircle2, ClipboardList, Clock3, Inbox, Star, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { SkeletonCard, SkeletonGrid } from '../../../components/Skeleton';
import { useAuth } from '../../../hooks/useAuth';
import {
  fetchOrders,
  fetchWorkflowForms,
  formatDate,
  getAuthToken,
  submitWorkflowForm,
  type AccessMode,
  type DemoOrderSummary,
  type DemoWorkflowForm,
} from '../../../features/demo/biteplanerFlow';
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
  if (form.templateKey === 'partner_review_by_customer') {
    return 'Cadastro via link de recomendação do parceiro';
  }

  if (form.templateKey === 'dentist_review_by_customer') {
    return `Ordem ${order.id} | feedback pós-atendimento`;
  }

  if (form.templateKey === 'lab_review_by_dentist') {
    return `Ordem ${order.id} | laboratório ${order.practice_location?.name ?? 'selecionado'}`;
  }

  return `Ordem ${order.id} | dentista ${order.dentist?.full_name ?? 'responsável'}`;
}

export function Avaliacoes() {
  const { session } = useAuth();
  const token = getAuthToken(session);
  const [searchParams] = useSearchParams();
  const mode = getMode(searchParams.get('mode'));
  const [orders, setOrders] = useState<DemoOrderSummary[]>([]);
  const [forms, setForms] = useState<Array<{ order: DemoOrderSummary; form: DemoWorkflowForm }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSurvey, setSelectedSurvey] = useState<{ order: DemoOrderSummary; form: DemoWorkflowForm } | null>(null);
  const [surveyPayload, setSurveyPayload] = useState<Record<string, string>>({});
  const [surveyError, setSurveyError] = useState('');
  const [surveySubmitting, setSurveySubmitting] = useState(false);
  const copy = MODE_COPY[mode];

  useEffect(() => {
    if (!token) {
      return;
    }

    let active = true;

    async function loadReviews() {
      setLoading(true);
      setError('');

      try {
        const ordersResponse = await fetchOrders(mode, token);
        const formEntries = await Promise.all(
          ordersResponse.orders.map(async (order) => {
            const response = await fetchWorkflowForms(order.id, token);
            return response.forms.map((form) => ({ order, form }));
          })
        );

        if (!active) {
          return;
        }

        setOrders(ordersResponse.orders);
        setForms(formEntries.flat());
      } catch {
        if (active) {
          setError('Não foi possível carregar as avaliações agora.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadReviews();

    return () => {
      active = false;
    };
  }, [mode, token]);

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

  const selectedTemplate = selectedSurvey ? getTemplate(selectedSurvey.form.templateKey) : null;

  function openSurvey(entry: { order: DemoOrderSummary; form: DemoWorkflowForm }) {
    const template = getTemplate(entry.form.templateKey);

    if (!template) {
      return;
    }

    setSelectedSurvey(entry);
    setSurveyPayload(getEmptyPayload(template));
    setSurveyError('');
  }

  function closeSurvey() {
    if (surveySubmitting) {
      return;
    }

    setSelectedSurvey(null);
    setSurveyPayload({});
    setSurveyError('');
  }

  async function handleSurveySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedSurvey || !selectedTemplate) {
      return;
    }

    const missingField = selectedTemplate.fields.find((field) => {
      if (!field.required) {
        return false;
      }

      return !String(surveyPayload[field.key] ?? '').trim();
    });

    if (missingField) {
      setSurveyError(`Preencha o campo obrigatório: ${missingField.label.replace(/^Nota - /, '')}.`);
      return;
    }

    const invalidScoreField = selectedTemplate.fields.find((field) => {
      if (!isScoreField(field)) {
        return false;
      }

      const value = surveyPayload[field.key];

      if (!String(value ?? '').trim()) {
        return false;
      }

      const score = Number(value);

      return !Number.isFinite(score) || score < 1 || score > 5;
    });

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
      setForms((current) =>
        current.map((entry) =>
          entry.form.id === updatedForm.id && entry.order.id === selectedSurvey.order.id
            ? { ...entry, form: updatedForm }
            : entry
        )
      );
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
              <S.PendingGrid>
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
                {pendingSurveys.length === 0 ? (
                  <S.Banner>
                    <Inbox size={16} aria-hidden />
                    Nenhum survey pendente para este perfil.
                  </S.Banner>
                ) : null}
              </S.PendingGrid>
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
                {SURVEY_MOMENTS.map((moment) => (
                  <S.TriggerItem key={moment.templateKey}>
                    <S.TriggerIcon>
                      <CheckCircle2 size={15} />
                    </S.TriggerIcon>
                    <div>
                      <S.PendingTitle>{moment.title}</S.PendingTitle>
                      <S.ReviewMeta>{moment.actor}</S.ReviewMeta>
                      <S.Comment>{moment.moment}</S.Comment>
                    </div>
                  </S.TriggerItem>
                ))}
              </S.TriggerList>
            </S.Section>

            <S.ReviewList>
              {rows.map((row) => (
                <S.ReviewCard key={row.id}>
                  <S.ReviewHeader>
                    <S.Reviewer>
                      <S.Avatar>{getInitials(row.reviewer)}</S.Avatar>
                      <div>
                        <S.ReviewerName>{row.reviewer}</S.ReviewerName>
                        <S.ReviewMeta>
                          {row.direction} | Ordem {row.order.id} | {row.form.submittedAt ? formatDate(row.form.submittedAt) : 'Data pendente'}
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
              {rows.length === 0 ? <S.Banner>Nenhuma avaliação enviada para este perfil ainda.</S.Banner> : null}
            </S.ReviewList>
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
                    {field.required ? <span>*</span> : null}
                  </S.SurveyLabel>
                  {field.helpText ? <S.SmallText>{field.helpText}</S.SmallText> : null}
                  {isScoreField(field) ? (
                    <S.ScoreOptions role="radiogroup" aria-label={field.label}>
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
                            onChange={(event) =>
                              setSurveyPayload((current) => ({ ...current, [field.key]: event.target.value }))
                            }
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
                      value={surveyPayload[field.key] ?? ''}
                      maxLength={500}
                      onChange={(event) =>
                        setSurveyPayload((current) => ({ ...current, [field.key]: event.target.value }))
                      }
                    />
                  )}
                  {isScoreField(field) && (field.minLabel || field.maxLabel) ? (
                    <S.ScaleHint>
                      <span>{field.minLabel}</span>
                      <span>{field.maxLabel}</span>
                    </S.ScaleHint>
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
