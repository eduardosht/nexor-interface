import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { Star, X } from 'lucide-react';
import * as S from './WorkflowFormsPanel.styles';
import {
  Button,
  CheckboxField,
  Field,
  RadioQuestionGroup,
  StatusIndicator,
  formatPhoneValue,
  getPhoneMaxLength,
  sanitizePhoneValue,
} from '@nexor/design-system';
import {
  fetchWorkflowForms,
  formatDate,
  submitWorkflowForm,
  type DemoWorkflowForm,
} from '../../../features/demo/biteplanerFlow';
import {
  BITEPLANER_REVIEW_TEMPLATES,
  type BiteplanerReviewFieldDefinition,
} from '../biteplanerReviewForms/index';
import {
  SHARED_INITIAL_EVALUATION_INTAKE,
  getSharedIntakePayloadKey,
  type SharedIntakeFieldDefinition,
  type WorkflowFormActorRole,
} from './sharedIntakeDefinition';

type IntakeFieldDefinition = {
  key: string;
  label: string;
  required: boolean;
  type: 'text' | 'textarea';
  helpText?: string;
};

type FormDefinition = {
  label: string;
  description: string;
  fields?: Array<IntakeFieldDefinition | BiteplanerReviewFieldDefinition>;
  sharedIntake?: typeof SHARED_INITIAL_EVALUATION_INTAKE;
};

type WorkflowFormsPanelProps = {
  orderId: string | null;
  token?: string;
  title?: string;
  description?: string;
  templateFilter?: string[];
  defaultValues?: Record<string, string>;
  forms?: DemoWorkflowForm[];
  onFormsChange?: (forms: DemoWorkflowForm[]) => void;
  variant?: 'panel' | 'embedded';
  actorRole?: WorkflowFormActorRole;
};

const INTAKE_DEFINITION: FormDefinition = {
  label: SHARED_INITIAL_EVALUATION_INTAKE.label,
  description: SHARED_INITIAL_EVALUATION_INTAKE.description,
  sharedIntake: SHARED_INITIAL_EVALUATION_INTAKE,
};

const TEMPLATE_DEFINITIONS: Record<string, FormDefinition> = {
  customer_pre_consultation_intake: INTAKE_DEFINITION,
  ...Object.fromEntries(
    Object.entries(BITEPLANER_REVIEW_TEMPLATES).map(([key, template]) => [
      key,
      {
        label: template.label,
        description: 'Formulário de avaliação operacional mapeado para governança da rede Biteplaner.',
        fields: template.fields,
      },
    ])
  ),
};

const STATUS_PRESENTATION: Record<DemoWorkflowForm['status'], { label: string; color: string }> = {
  pending: { label: 'Pendente', color: '#D18A00' },
  draft: { label: 'Rascunho', color: '#2563EB' },
  submitted: { label: 'Enviado', color: '#15803D' },
};

















function getDefinition(templateKey: string) {
  return TEMPLATE_DEFINITIONS[templateKey] ?? {
    label: templateKey,
    description: 'Formulário operacional mapeado para esta etapa.',
    fields: [],
  };
}

function getDefinitionFields(definition: FormDefinition) {
  if (definition.sharedIntake) {
    return definition.sharedIntake.sections.flatMap((section) => section.fields);
  }

  return definition.fields ?? [];
}

function getInitialPayload(
  form: DemoWorkflowForm,
  definition: FormDefinition,
  defaultValues: Record<string, string>,
  actorRole: WorkflowFormActorRole
) {
  const fields = getDefinitionFields(definition);
  const payloadSource = definition.sharedIntake
    ? ((form.payload?.[getSharedIntakePayloadKey(actorRole)] as Record<string, unknown> | undefined) ?? {})
    : form.payload ?? {};

  return Object.fromEntries(
    fields.map((field) => {
      const rawValue = payloadSource[field.key] ?? defaultValues[field.key] ?? '';
      const value = Array.isArray(rawValue) ? rawValue.join('|') : String(rawValue);
      return [field.key, field.key === 'phone' ? formatPhoneValue(value) : value];
    })
  );
}

function isScoreField(
  field: IntakeFieldDefinition | BiteplanerReviewFieldDefinition | SharedIntakeFieldDefinition
): field is BiteplanerReviewFieldDefinition {
  return !isSharedField(field) && field.type === 'score';
}

function isReviewTemplate(templateKey: string) {
  return templateKey in BITEPLANER_REVIEW_TEMPLATES;
}

function isTextareaField(
  field: IntakeFieldDefinition | BiteplanerReviewFieldDefinition | SharedIntakeFieldDefinition
) {
  return field.type === 'textarea';
}

function isSharedField(
  field: IntakeFieldDefinition | BiteplanerReviewFieldDefinition | SharedIntakeFieldDefinition
): field is SharedIntakeFieldDefinition {
  return 'ownerRole' in field;
}

function isSharedNumberField(
  field: IntakeFieldDefinition | BiteplanerReviewFieldDefinition | SharedIntakeFieldDefinition
): field is SharedIntakeFieldDefinition & { type: 'number' } {
  return isSharedField(field) && field.type === 'number';
}

function isYesNoField(
  field: IntakeFieldDefinition | BiteplanerReviewFieldDefinition | SharedIntakeFieldDefinition
): boolean {
  if (!isSharedField(field) || field.type !== 'select') {
    return false;
  }

  const values = new Set((field.options ?? []).map((option) => String(option.value)));
  return values.size === 2 && values.has('yes') && values.has('no');
}

function isConsentCheckboxField(
  field: IntakeFieldDefinition | BiteplanerReviewFieldDefinition | SharedIntakeFieldDefinition
): boolean {
  return isSharedField(field) && field.type === 'checkbox-group' && field.key.endsWith('Consent');
}

function getConsentLabel(field: SharedIntakeFieldDefinition, fallbackLabel: string) {
  if (field.key === 'serviceConsent') {
    return (
      <S.ConsentLabel>
        Tratamento necessário para <strong>inscrição, triagem, segurança da jornada</strong> e liberação da consulta
        inicial.
      </S.ConsentLabel>
    );
  }

  if (field.key === 'sensitiveHealthConsent') {
    return (
      <S.ConsentLabel>
        Tratamento de <strong>dados sensíveis de saúde/odontologia</strong> para avaliação do Biteplaner, com acesso
        restrito.
      </S.ConsentLabel>
    );
  }

  if (field.key === 'researchConsent') {
    return (
      <S.ConsentLabel>
        Autorizo uso em <strong>pesquisa e P&D</strong> em formato agregado, anonimizado ou pseudonimizado.
      </S.ConsentLabel>
    );
  }

  if (field.key === 'marketingConsent') {
    return (
      <S.ConsentLabel>
        Autorizo <strong>comunicações comerciais e educativas</strong> sobre Nexor e Biteplaner. Revogável a qualquer
        momento.
      </S.ConsentLabel>
    );
  }

  return <S.ConsentLabel>{fallbackLabel}</S.ConsentLabel>;
}

function getSharedRoleState(form: DemoWorkflowForm) {
  return form.roleState ?? {
    customer: form.status === 'submitted' ? 'submitted' : 'pending',
    dentist: 'locked' as const,
  };
}

function getReadOnlyValue(value: unknown, field: SharedIntakeFieldDefinition) {
  if (Array.isArray(value)) {
    const labels = value.map((item) => field.options?.find((option) => option.value === item)?.label ?? String(item));
    return labels.length > 0 ? labels.join(', ') : 'Não informado';
  }

  if (value === null || value === undefined || value === '') {
    return 'Não informado';
  }

  if (field.options) {
    return field.options.find((option) => option.value === value)?.label ?? String(value);
  }

  return String(value);
}

function getSharedIntakeCanSubmit(form: DemoWorkflowForm, actorRole: WorkflowFormActorRole) {
  const roleState = getSharedRoleState(form);

  if (actorRole === 'user') {
    return roleState.customer !== 'locked' && !form.dentistReviewStartedAt;
  }

  if (actorRole === 'dentist') {
    return roleState.customer !== 'pending' && roleState.dentist !== 'submitted';
  }

  return false;
}

function hasMissingRequiredValue(
  field: IntakeFieldDefinition | BiteplanerReviewFieldDefinition | SharedIntakeFieldDefinition,
  payload: Record<string, string>
) {
  if (!field.required) {
    return false;
  }

  return !payload[field.key]?.trim();
}

function normalizeFieldValue(
  field: IntakeFieldDefinition | BiteplanerReviewFieldDefinition | SharedIntakeFieldDefinition,
  value: string
) {
  const trimmed = value.trim();

  if (!trimmed) {
    return '';
  }

  if (field.key === 'phone') {
    return sanitizePhoneValue(trimmed);
  }

  if (isSharedField(field)) {
    if (field.type === 'number' || field.type === 'score') {
      return Number(trimmed);
    }

    if (field.type === 'checkbox-group') {
      return trimmed.split('|').filter(Boolean);
    }
  }

  if (isScoreField(field)) {
    return Number(trimmed);
  }

  return trimmed;
}

function normalizeNumericInputValue(field: SharedIntakeFieldDefinition, rawValue: string) {
  if (rawValue.trim() === '') {
    return '';
  }

  const numericValue = Number(rawValue);

  if (!Number.isFinite(numericValue)) {
    return '';
  }

  const min = typeof field.min === 'number' ? field.min : null;
  const max = typeof field.max === 'number' ? field.max : null;
  const clampedMin = min === null ? numericValue : Math.max(min, numericValue);
  const clampedValue = max === null ? clampedMin : Math.min(max, clampedMin);

  return String(clampedValue);
}

function getFieldSpan(field: IntakeFieldDefinition | BiteplanerReviewFieldDefinition | SharedIntakeFieldDefinition) {
  if (isSharedField(field)) {
    if (field.type === 'textarea') {
      return 12;
    }

    if (isConsentCheckboxField(field)) {
      return 12;
    }

    if (field.type === 'checkbox-group') {
      return 6;
    }

    if (isYesNoField(field)) {
      return 12;
    }

    if (field.type === 'select' || field.type === 'score' || field.type === 'number') {
      return 3;
    }
  }

  if (field.key === 'fullName') {
    return 6;
  }

  if (field.key === 'phone') {
    return 3;
  }

  if (field.key === 'sportRoutine') {
    return 3;
  }

  if (isTextareaField(field)) {
    return 12;
  }

  if (isScoreField(field)) {
    return 3;
  }

  return 4;
}

function getBalancedFieldLayouts(
  fields: Array<IntakeFieldDefinition | BiteplanerReviewFieldDefinition | SharedIntakeFieldDefinition>
) {
  const rows: Array<Array<{ field: IntakeFieldDefinition | BiteplanerReviewFieldDefinition | SharedIntakeFieldDefinition; span: number }>> = [];
  let currentRow: Array<{ field: IntakeFieldDefinition | BiteplanerReviewFieldDefinition | SharedIntakeFieldDefinition; span: number }> = [];
  let currentSpan = 0;

  function flushRow() {
    if (currentRow.length > 0) {
      rows.push(currentRow);
      currentRow = [];
      currentSpan = 0;
    }
  }

  fields.forEach((field) => {
    const span = getFieldSpan(field);

    if (span === 12) {
      flushRow();
      rows.push([{ field, span }]);
      return;
    }

    if (currentSpan + span > 12) {
      flushRow();
    }

    currentRow.push({ field, span });
    currentSpan += span;

    if (currentSpan === 12) {
      flushRow();
    }
  });

  flushRow();

  return rows.flatMap((row) => {
    const total = row.reduce((sum, item) => sum + item.span, 0);
    let remaining = 12 - total;
    let index = 0;
    const balancedRow = row.map((item) => ({ ...item }));

    while (remaining > 0 && balancedRow.length > 0) {
      balancedRow[index % balancedRow.length].span += 1;
      remaining -= 1;
      index += 1;
    }

    return balancedRow;
  });
}

function FormItem({
  form,
  token,
  defaultValues,
  onSubmitted,
  actorRole,
}: {
  form: DemoWorkflowForm;
  token?: string;
  defaultValues: Record<string, string>;
  onSubmitted: (form: DemoWorkflowForm) => void;
  actorRole: WorkflowFormActorRole;
}) {
  const definition = useMemo(() => getDefinition(form.templateKey), [form.templateKey]);
  const [payload, setPayload] = useState<Record<string, string>>(() =>
    getInitialPayload(form, definition, defaultValues, actorRole)
  );
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [stepError, setStepError] = useState('');
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [isEditingSubmitted, setIsEditingSubmitted] = useState(false);
  const presentation = STATUS_PRESENTATION[form.status];
  const fields = getDefinitionFields(definition);
  const isSharedIntake = Boolean(definition.sharedIntake);
  const isReviewSurvey = !isSharedIntake && isReviewTemplate(form.templateKey);
  const hasRequiredReviewFields = isReviewSurvey && fields.some((field) => field.required);
  const roleState = getSharedRoleState(form);
  const [surveyOpen, setSurveyOpen] = useState(false);
  const visibleSharedSections =
    definition.sharedIntake?.sections
      .map((section) => ({
        ...section,
        fields: section.fields.filter((field) => field.visibleTo.includes(actorRole)),
      }))
      .filter((section) => section.fields.length > 0) ?? [];
  const canEditSubmittedSharedIntake =
    isSharedIntake &&
    actorRole === 'dentist' &&
    roleState.customer !== 'pending' &&
    roleState.dentist === 'submitted';
  const canSubmit = isSharedIntake
    ? getSharedIntakeCanSubmit(form, actorRole) || isEditingSubmitted
    : form.status !== 'submitted' && fields.length > 0;
  const submitSectionKey =
    [...visibleSharedSections]
      .reverse()
      .find((section) => section.fields.some((field) => canSubmit && field.ownerRole === actorRole))?.key ?? null;
  const firstActorSectionIndex = visibleSharedSections.findIndex((section) =>
    section.fields.some((field) => field.ownerRole === actorRole)
  );
  const activeSharedSection = visibleSharedSections[Math.min(activeSectionIndex, Math.max(visibleSharedSections.length - 1, 0))];
  const activeSharedSectionIndex = activeSharedSection
    ? visibleSharedSections.findIndex((section) => section.key === activeSharedSection.key)
    : 0;
  const sharedProgress =
    visibleSharedSections.length > 0
      ? Math.round(((activeSharedSectionIndex + 1) / visibleSharedSections.length) * 100)
      : 100;
  const isLastSharedSection = activeSharedSectionIndex === visibleSharedSections.length - 1;
  const submitIsMissingRequiredFields = isSharedIntake
    ? getFirstMissingSectionIndex() >= 0
    : fields.some((field) => hasMissingRequiredValue(field, payload));

  useEffect(() => {
    setActiveSectionIndex(0);
    setIsEditingSubmitted(false);
    setStepError('');
  }, [form.id, actorRole]);

  useEffect(() => {
    if (activeSectionIndex >= visibleSharedSections.length) {
      setActiveSectionIndex(Math.max(visibleSharedSections.length - 1, 0));
    }
  }, [activeSectionIndex, visibleSharedSections.length]);

  function getEditableFieldsForSection(section: (typeof visibleSharedSections)[number]) {
    return section.fields.filter((field) => canSubmit && field.ownerRole === actorRole);
  }

  function getFirstMissingSectionIndex() {
    return visibleSharedSections.findIndex((section) =>
      getEditableFieldsForSection(section).some((field) => hasMissingRequiredValue(field, payload))
    );
  }

  function goToSection(index: number) {
    setStepError('');
    setError('');
    setFeedback('');
    setActiveSectionIndex(index);
  }

  function handleEditSubmittedSharedIntake() {
    setIsEditingSubmitted(true);
    goToSection(Math.max(firstActorSectionIndex, 0));
  }

  function handleNextSection() {
    if (!activeSharedSection) {
      return;
    }

    const hasMissingRequiredField = getEditableFieldsForSection(activeSharedSection).some((field) =>
      hasMissingRequiredValue(field, payload)
    );

    if (hasMissingRequiredField) {
      setStepError('Preencha os campos obrigatórios desta etapa para continuar.');
      return;
    }

    goToSection(Math.min(activeSharedSectionIndex + 1, visibleSharedSections.length - 1));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token || !canSubmit) {
      return;
    }

    setFeedback('');
    setError('');
    setStepError('');

    const editableFields = fields.filter((field) => !isSharedField(field) || field.ownerRole === actorRole);
    const firstMissingSectionIndex = isSharedIntake ? getFirstMissingSectionIndex() : -1;

    if (firstMissingSectionIndex >= 0) {
      setActiveSectionIndex(firstMissingSectionIndex);
      setError('Preencha os campos obrigatórios antes de enviar o formulário.');
      return;
    }

    const invalidScoreField = fields.find((field) => {
      if (!isScoreField(field)) {
        return false;
      }

      const value = payload[field.key];

      if (!String(value ?? '').trim()) {
        return false;
      }

      const score = Number(value);
      return !Number.isFinite(score) || score < 1 || score > 5;
    });

    if (invalidScoreField) {
      setError(`Escolha uma nota de 1 a 5 estrelas em: ${invalidScoreField.label.replace(/^Nota - /, '')}.`);
      return;
    }

    setSubmitting(true);
    const normalizedValues = Object.fromEntries(
      editableFields
        .map((field) => [field.key, normalizeFieldValue(field, payload[field.key] ?? '')])
        .filter(([, value]) => value !== '')
    );
    const normalizedPayload = isSharedIntake
      ? { [getSharedIntakePayloadKey(actorRole)]: normalizedValues }
      : normalizedValues;

    try {
      const nextForm = await submitWorkflowForm(form.orderId, form.id, normalizedPayload, token);
      onSubmitted(nextForm);
      setIsEditingSubmitted(false);
      setSurveyOpen(false);
      setFeedback('Formulário enviado.');
    } catch {
      setError('Não foi possível enviar este formulário agora.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <S.FormCard>
      <S.FormHeader>
        <div>
          <S.FormTitle>{definition.label}</S.FormTitle>
          <S.Description>{definition.description}</S.Description>
          {isSharedIntake && actorRole === 'user' && form.dentistReviewStartedAt ? (
            <S.LockNotice>Formulário em revisão pelo dentista.</S.LockNotice>
          ) : null}
          {isSharedIntake && actorRole === 'user' && roleState.customer === 'locked' ? (
            <S.Meta>Respostas do cliente bloqueadas para edição.</S.Meta>
          ) : null}
          <S.Meta>Liberado em {formatDate(form.releasedAt)}</S.Meta>
          {form.submittedAt ? <S.Meta>Enviado em {formatDate(form.submittedAt)}</S.Meta> : null}
          {form.summary?.scoreAverage !== null && form.summary?.scoreAverage !== undefined ? (
            <S.Meta>Nota media: {form.summary.scoreAverage.toFixed(1)}</S.Meta>
          ) : null}
        </div>
        <StatusIndicator color={presentation.color} label={presentation.label} />
      </S.FormHeader>

      {isSharedIntake ? (
        <>
          <S.IntakeProgressShell aria-label="Progresso do formulário compartilhado">
            <S.IntakeProgressHeader>
              <div>
                <S.StepKicker>
                  Etapa {activeSharedSectionIndex + 1} de {visibleSharedSections.length}
                </S.StepKicker>
                <S.SectionHeading>{activeSharedSection?.title}</S.SectionHeading>
              </div>
              <S.StepProgressValue>{sharedProgress}% completo</S.StepProgressValue>
            </S.IntakeProgressHeader>
            <S.ProgressTrack aria-hidden="true">
              <S.ProgressFill
                initial={false}
                animate={{ width: `${sharedProgress}%` }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
              />
            </S.ProgressTrack>
            <S.StepRail>
              {visibleSharedSections.map((section, index) => (
                <S.StepTab
                  key={section.key}
                  type="button"
                  $active={index === activeSharedSectionIndex}
                  $complete={index < activeSharedSectionIndex}
                  onClick={() => goToSection(index)}
                  aria-current={index === activeSharedSectionIndex ? 'step' : undefined}
                >
                  <S.StepNumber $active={index === activeSharedSectionIndex} $complete={index < activeSharedSectionIndex}>
                    {index + 1}
                  </S.StepNumber>
                  <S.StepTabLabel>{section.title}</S.StepTabLabel>
                </S.StepTab>
              ))}
            </S.StepRail>
          </S.IntakeProgressShell>

          {activeSharedSection
            ? (() => {
              const section = activeSharedSection;
              const editableSectionFields = section.fields.filter(
                (field) => canSubmit && field.ownerRole === actorRole
              );
              const readonlySectionFields = section.fields.filter((field) => !editableSectionFields.includes(field));

              return (
                <S.AnimatedStep
                  key={section.key}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                >
                  <S.FormSectionGroup>
                    <S.SectionHeading>{section.title}</S.SectionHeading>
                    {section.description ? <S.Meta>{section.description}</S.Meta> : null}
                    {readonlySectionFields.length > 0 ? (
                      <S.ReadOnlyGrid>
                        {readonlySectionFields.map((field) => {
                          const source =
                            form.payload?.[getSharedIntakePayloadKey(field.ownerRole)] as
                              | Record<string, unknown>
                              | undefined;

                          return (
                            <S.ReadOnlyItem key={field.key}>
                              <S.ReadOnlyLabel>{field.label}</S.ReadOnlyLabel>
                              <S.ReadOnlyValue>{getReadOnlyValue(source?.[field.key], field)}</S.ReadOnlyValue>
                            </S.ReadOnlyItem>
                          );
                        })}
                      </S.ReadOnlyGrid>
                    ) : null}
                    {editableSectionFields.length > 0 ? (
                      <form onSubmit={handleSubmit}>
                        <S.Fields>
                          {getBalancedFieldLayouts(editableSectionFields).map(({ field, span }) => {
                            const fieldControl = renderFieldControl(field, payload, setPayload);

                            return (
                              <S.FieldSlot key={field.key} $span={span}>
                                {fieldControl}
                              </S.FieldSlot>
                            );
                          })}
                        </S.Fields>
                        <S.Actions>
                          {activeSharedSectionIndex > 0 ? (
                            <Button type="button" variant="secondary" onClick={() => goToSection(activeSharedSectionIndex - 1)}>
                              Voltar etapa
                            </Button>
                          ) : null}
                          {isLastSharedSection || section.key === submitSectionKey ? (
                            <Button type="submit" disabled={submitting || submitIsMissingRequiredFields}>
                              {submitting
                                ? 'Enviando...'
                                : actorRole === 'dentist'
                                  ? 'Salvar complemento do dentista'
                                  : 'Enviar formulário'}
                            </Button>
                          ) : (
                            <Button type="button" onClick={handleNextSection}>
                              Próxima etapa
                            </Button>
                          )}
                          {stepError ? <S.Feedback $tone="error" role="alert">{stepError}</S.Feedback> : null}
                        </S.Actions>
                      </form>
                    ) : (
                      <S.Actions>
                        {canEditSubmittedSharedIntake && !isEditingSubmitted ? (
                          <Button type="button" variant="secondary" onClick={handleEditSubmittedSharedIntake}>
                            Editar
                          </Button>
                        ) : activeSharedSectionIndex > 0 ? (
                          <Button type="button" variant="secondary" onClick={() => goToSection(activeSharedSectionIndex - 1)}>
                            Voltar etapa
                          </Button>
                        ) : null}
                        {!isLastSharedSection ? (
                          <Button type="button" onClick={handleNextSection}>
                            Próxima etapa
                          </Button>
                        ) : null}
                      </S.Actions>
                    )}
                  </S.FormSectionGroup>
                </S.AnimatedStep>
              );
            })()
            : null}
          {feedback ? <S.Feedback $tone="success">{feedback}</S.Feedback> : null}
          {error ? <S.Feedback $tone="error" role="alert">{error}</S.Feedback> : null}
          {!canSubmit ? (
            <S.Meta>
              {actorRole === 'dentist'
                ? 'Complemento do dentista indisponível ou já registrado.'
                : 'Registro salvo no histórico da ordem.'}
            </S.Meta>
          ) : null}
        </>
      ) : isReviewSurvey && canSubmit ? (
        <>
          <S.SurveyPrompt>
            <S.SurveyPromptIcon aria-hidden="true">
              <Star size={18} fill="currentColor" />
            </S.SurveyPromptIcon>
            <div>
              <S.SurveyPromptTitle>Survey de feedback</S.SurveyPromptTitle>
              <S.Meta>
                {hasRequiredReviewFields
                  ? 'Obrigatório para registrar esta interação da jornada.'
                  : 'Disponível para registrar esta interação da jornada.'}
              </S.Meta>
            </div>
            <Button
              type="button"
              onClick={() => {
                setError('');
                setFeedback('');
                setSurveyOpen(true);
              }}
              aria-label={hasRequiredReviewFields ? 'Responder survey obrigatório' : 'Responder survey'}
            >
              {hasRequiredReviewFields ? 'Responder survey obrigatório' : 'Responder survey'}
            </Button>
          </S.SurveyPrompt>
          {feedback ? <S.Feedback $tone="success">{feedback}</S.Feedback> : null}
          {error ? <S.Feedback $tone="error" role="alert">{error}</S.Feedback> : null}
          {surveyOpen ? (
            <S.ModalOverlay role="presentation">
              <S.Modal role="dialog" aria-modal="true" aria-labelledby={`survey-title-${form.id}`}>
                <S.ModalHeader>
                  <div>
                    <S.FormTitle id={`survey-title-${form.id}`}>{definition.label}</S.FormTitle>
                    <S.Description>Escolha uma nota de 1 a 5 estrelas para cada critério obrigatório.</S.Description>
                  </div>
                  <S.IconButton
                    type="button"
                    onClick={() => {
                      if (!submitting) {
                        setSurveyOpen(false);
                      }
                    }}
                    aria-label="Fechar survey"
                  >
                    <X size={18} />
                  </S.IconButton>
                </S.ModalHeader>
                <S.ModalForm onSubmit={handleSubmit}>
                  <S.SurveyIntro>
                    <S.SurveyIntroIcon aria-hidden="true">
                      <Star size={18} fill="currentColor" />
                    </S.SurveyIntroIcon>
                    <div>
                      <S.SurveyIntroTitle>Survey de feedback</S.SurveyIntroTitle>
                      <S.Description>
                        O envio fica salvo no histórico da ordem e alimenta as avaliações do perfil.
                      </S.Description>
                    </div>
                  </S.SurveyIntro>
                  {fields.map((field) => (
                    <S.SurveyField key={field.key}>
                      <S.SurveyLabel>
                        {field.label}
                        {field.required ? <span>*</span> : null}
                      </S.SurveyLabel>
                      {field.helpText ? <S.Meta>{field.helpText}</S.Meta> : null}
                      {isScoreField(field) ? (
                        <S.ScoreOptions role="radiogroup" aria-label={field.label}>
                          {field.options?.map((option) => {
                            const selectedValue = Number(payload[field.key]);
                            const isSelected = payload[field.key] === String(option.value);
                            const isFilled = Number.isFinite(selectedValue) && option.value <= selectedValue;

                            return (
                              <S.ScoreOption key={option.value} $active={isFilled} $selected={isSelected}>
                                <input
                                  type="radio"
                                  name={`${form.id}-${field.key}`}
                                  value={option.value}
                                  checked={payload[field.key] === String(option.value)}
                                  onChange={(event) =>
                                    setPayload((current) => ({ ...current, [field.key]: event.target.value }))
                                  }
                                />
                                <span>
                                  <Star size={24} fill="currentColor" aria-hidden="true" />
                                  <S.ScreenReaderText>{`${option.value} estrelas`}</S.ScreenReaderText>
                                </span>
                              </S.ScoreOption>
                            );
                          })}
                        </S.ScoreOptions>
                      ) : (
                        <S.TextArea
                          aria-label={field.label}
                          value={payload[field.key] ?? ''}
                          maxLength={500}
                          onChange={(event) =>
                            setPayload((current) => ({ ...current, [field.key]: event.target.value }))
                          }
                        />
                      )}
                      {isScoreField(field) && (field.minLabel || field.maxLabel) ? (
                        <S.ScoreScale>
                          <span>{field.minLabel}</span>
                          <span>{field.maxLabel}</span>
                        </S.ScoreScale>
                      ) : null}
                    </S.SurveyField>
                  ))}
                  {error ? <S.Feedback $tone="error" role="alert">{error}</S.Feedback> : null}
                  <S.ModalActions>
                    <Button type="button" variant="secondary" onClick={() => setSurveyOpen(false)} disabled={submitting}>
                      Responder depois
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? 'Enviando...' : 'Enviar survey'}
                    </Button>
                  </S.ModalActions>
                </S.ModalForm>
              </S.Modal>
            </S.ModalOverlay>
          ) : null}
        </>
      ) : canSubmit ? (
        <form onSubmit={handleSubmit}>
          <S.Fields>
            {getBalancedFieldLayouts(fields).map(({ field, span }) => {
              const fieldControl = renderFieldControl(field, payload, setPayload);

              return (
                <S.FieldSlot key={field.key} $span={span}>
                  {fieldControl}
                </S.FieldSlot>
              );
            })}
          </S.Fields>
          <S.Actions>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Enviando...' : 'Enviar formulário'}
            </Button>
            {feedback ? <S.Feedback $tone="success">{feedback}</S.Feedback> : null}
            {error ? <S.Feedback $tone="error" role="alert">{error}</S.Feedback> : null}
          </S.Actions>
        </form>
      ) : (
        <S.Meta>{form.status === 'submitted' ? 'Registro salvo no histórico da ordem.' : 'Formulário sem campos configurados para esta demo.'}</S.Meta>
      )}
    </S.FormCard>
  );
}

function renderFieldControl(
  field: IntakeFieldDefinition | BiteplanerReviewFieldDefinition | SharedIntakeFieldDefinition,
  payload: Record<string, string>,
  setPayload: (updater: (current: Record<string, string>) => Record<string, string>) => void
) {
  if (isSharedField(field) && isYesNoField(field)) {
    return (
      <S.RadioQuestionSlot>
        <RadioQuestionGroup
          name={field.key}
          label={field.label}
          required={field.required}
          value={payload[field.key] ?? ''}
          inline
          onChange={(nextValue) => setPayload((current) => ({ ...current, [field.key]: nextValue }))}
          options={(field.options ?? []).map((option) => ({
            value: String(option.value),
            label: option.label,
          }))}
        />
      </S.RadioQuestionSlot>
    );
  }

  if (isSharedField(field) && field.type === 'select') {
    return (
      <S.FieldShell>
        {field.label}
        <S.Select
          value={payload[field.key] ?? ''}
          required={field.required}
          onChange={(event: ChangeEvent<HTMLSelectElement>) =>
            setPayload((current) => ({ ...current, [field.key]: event.target.value }))
          }
        >
          <option value="">Selecione</option>
          {(field.options ?? []).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </S.Select>
        {field.helpText ? <S.Meta>{field.helpText}</S.Meta> : null}
      </S.FieldShell>
    );
  }

  if (isSharedField(field) && field.type === 'score') {
    return (
      <Field
        as="input"
        label={field.label}
        value={payload[field.key] ?? ''}
        required={field.required}
        type="number"
        inputMode="numeric"
        min={field.min}
        max={field.max}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          const value = normalizeNumericInputValue(field, event.target.value);
          setPayload((current) => ({ ...current, [field.key]: value }));
        }}
      />
    );
  }

  if (isScoreField(field)) {
    return (
      <S.FieldShell>
        {field.label}
        <S.Select
          value={payload[field.key] ?? ''}
          required={field.required}
          onChange={(event: ChangeEvent<HTMLSelectElement>) =>
            setPayload((current) => ({ ...current, [field.key]: event.target.value }))
          }
        >
          <option value="">Selecione</option>
          {(field.options ?? []).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </S.Select>
        {field.minLabel || field.maxLabel ? (
          <S.ScoreScale>
            <span>{field.minLabel}</span>
            <span>{field.maxLabel}</span>
          </S.ScoreScale>
        ) : null}
        {field.helpText ? <S.Meta>{field.helpText}</S.Meta> : null}
      </S.FieldShell>
    );
  }

  if (isSharedField(field) && field.type === 'checkbox-group') {
    const selected = new Set((payload[field.key] ?? '').split('|').filter(Boolean));
    const singleOption = field.options?.[0];

    if (isConsentCheckboxField(field) && singleOption) {
      return (
        <CheckboxField
          checked={selected.has(String(singleOption.value))}
          onChange={(checked) => {
            setPayload((current) => ({
              ...current,
              [field.key]: checked ? String(singleOption.value) : '',
            }));
          }}
          label={getConsentLabel(field, singleOption.label)}
          badge={field.required ? 'Obrigatório' : 'Opcional'}
          badgeTone={field.required ? 'required' : 'optional'}
        />
      );
    }

    return (
      <S.FieldShell as="fieldset">
        <legend>{field.label}</legend>
        <S.CheckboxGroup>
          {(field.options ?? []).map((option) => (
            <label key={option.value}>
              <input
                type="checkbox"
                checked={selected.has(String(option.value))}
                onChange={(event) => {
                  const nextSelected = new Set(selected);
                  if (event.target.checked) {
                    nextSelected.add(String(option.value));
                  } else {
                    nextSelected.delete(String(option.value));
                  }
                  setPayload((current) => ({
                    ...current,
                    [field.key]: Array.from(nextSelected).join('|'),
                  }));
                }}
              />
              {option.label}
            </label>
          ))}
        </S.CheckboxGroup>
      </S.FieldShell>
    );
  }

  return (
    <Field
      as={isTextareaField(field) ? 'textarea' : 'input'}
      label={field.label}
      value={payload[field.key] ?? ''}
      required={field.required}
      type={field.key === 'phone' ? 'tel' : isSharedNumberField(field) ? 'number' : 'text'}
      inputMode={field.key === 'phone' ? 'numeric' : isSharedNumberField(field) ? 'decimal' : undefined}
      min={isSharedNumberField(field) ? field.min : undefined}
      max={isSharedNumberField(field) ? field.max : undefined}
      maxLength={field.key === 'phone' ? getPhoneMaxLength() : undefined}
      onChange={(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value = field.key === 'phone'
          ? formatPhoneValue(event.target.value)
          : isSharedNumberField(field)
            ? normalizeNumericInputValue(field, event.target.value)
            : event.target.value;
        setPayload((current) => ({ ...current, [field.key]: value }));
      }}
    />
  );
}

export function WorkflowFormsPanel({
  orderId,
  token,
  title = 'Formulários do fluxo',
  description = 'Formulários operacionais liberados para a etapa atual da jornada.',
  templateFilter,
  defaultValues = {},
  forms,
  onFormsChange,
  variant = 'panel',
  actorRole = 'user',
}: WorkflowFormsPanelProps) {
  const [loadedForms, setLoadedForms] = useState<DemoWorkflowForm[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const formsSource = forms ?? loadedForms;

  function updateForms(updater: (current: DemoWorkflowForm[]) => DemoWorkflowForm[]) {
    if (forms) {
      onFormsChange?.(updater(forms));
      return;
    }

    setLoadedForms(updater);
  }

  useEffect(() => {
    if (forms) {
      setLoading(false);
      setError('');
      return;
    }

    if (!orderId || !token) {
      setLoadedForms([]);
      return;
    }

    let active = true;
    const currentOrderId = orderId;
    setLoading(true);
    setError('');

    async function loadForms() {
      try {
        const response = await fetchWorkflowForms(currentOrderId, token);

        if (active) {
          setLoadedForms(response.forms);
        }
      } catch {
        if (active) {
          setError('Não foi possível carregar os formulários desta etapa.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadForms();

    return () => {
      active = false;
    };
  }, [forms, orderId, token]);

  const visibleForms = useMemo(
    () => formsSource.filter((form) => !templateFilter || templateFilter.includes(form.templateKey)),
    [formsSource, templateFilter]
  );

  if (!loading && !error && visibleForms.length === 0) {
    return null;
  }

  return (
    <S.Panel $variant={variant} data-testid="workflow-forms-panel">
      {variant === 'panel' ? (
        <S.Header>
          <S.Title>{title}</S.Title>
          <S.Description>{description}</S.Description>
        </S.Header>
      ) : null}
      {loading ? <S.Meta>Carregando formulários...</S.Meta> : null}
      {error ? <S.Feedback $tone="error" role="alert">{error}</S.Feedback> : null}
      <S.FormGrid>
        {visibleForms.map((form) => (
          <FormItem
            key={form.id}
            form={form}
            token={token}
            defaultValues={defaultValues}
            actorRole={actorRole}
            onSubmitted={(nextForm) =>
              updateForms((current) => current.map((item) => (item.id === nextForm.id ? nextForm : item)))
            }
          />
        ))}
      </S.FormGrid>
    </S.Panel>
  );
}
