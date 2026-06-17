import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Snackbar, SnackbarStack } from '@nexor/design-system';
import { SkeletonCard } from '../../../components/Skeleton';
import { useAuth } from '../../../hooks/useAuth';
import {
  fetchOrders,
  fetchWorkflowForms,
  getAuthToken,
  getOrderDisplayId,
  isCustomerOnboardingComplete,
  type DemoOrderSummary,
  type DemoWorkflowForm,
} from '../../../features/demo/biteplanerFlow';
import { biteplanerQueryKeys } from '../../../features/demo/biteplanerQueryKeys';
import { WorkflowFormsPanel } from '../components/WorkflowFormsPanel';
import * as S from './styles';

const SUCCESS_REDIRECT_DELAY_MS = 2400;
const INTAKE_TEMPLATE_KEY = 'customer_pre_consultation_intake';
const EMPTY_WORKFLOW_DEFAULT_VALUES: Record<string, string> = {};
const BITEPLANER_CONSENT_PAYLOAD = {
  customer: {
    serviceConsent: ['accepted'],
    sensitiveHealthConsent: ['accepted'],
  },
};
const ACTIVE_ORTHODONTIC_TREATMENT_MESSAGE =
  'Não é possível continuar com tratamento ortodôntico ativo. Procure orientação clínica antes de seguir com o Biteplaner.';
const ACTIVE_DENTAL_TREATMENT_MESSAGE =
  'Para os casos em tratamento odontológico, é necessário a finalização do mesmo para continuar com a ordem.';

function customerIntakeIsComplete(form: DemoWorkflowForm) {
  if (form.roleState) {
    return form.roleState.customer === 'submitted' || form.roleState.customer === 'locked';
  }

  return form.status === 'submitted';
}

function getCustomerPayload(form: DemoWorkflowForm) {
  const customerPayload = form.payload?.customer;

  if (customerPayload && typeof customerPayload === 'object' && !Array.isArray(customerPayload)) {
    return customerPayload as Record<string, unknown>;
  }

  return {};
}

function getFormBlocker(form: DemoWorkflowForm) {
  const summaryBlocker = form.summary && 'blocker' in form.summary ? form.summary.blocker : null;

  if (summaryBlocker) {
    return summaryBlocker;
  }

  const customerPayload = getCustomerPayload(form);
  if (isActiveOrthodonticTreatment(customerPayload.orthodonticTreatmentStatus)) {
    return 'active_orthodontic_treatment';
  }

  if (isActiveDentalTreatment(customerPayload.activeDentalTreatmentStatus)) {
    return 'active_dental_treatment';
  }

  return null;
}

function isActiveOrthodonticTreatment(value: unknown) {
  return value === 'active' || value === true || value === 'yes';
}

function isActiveDentalTreatment(value: unknown) {
  return value === true || value === 'yes';
}

function getBlockerMessage(blocker: unknown) {
  if (blocker === 'active_orthodontic_treatment') {
    return ACTIVE_ORTHODONTIC_TREATMENT_MESSAGE;
  }

  if (blocker === 'active_dental_treatment') {
    return ACTIVE_DENTAL_TREATMENT_MESSAGE;
  }

  return '';
}

export function PreRequisito() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const token = getAuthToken(session);
  const queryOwnerId = session?.user.id ?? 'anonymous';
  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [isProcessingSubmittedIntake, setIsProcessingSubmittedIntake] = useState(false);

  const ordersQuery = useQuery({
    queryKey: biteplanerQueryKeys.orders('user', queryOwnerId),
    queryFn: () => fetchOrders('user', token),
    enabled: Boolean(token),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
  const order = useMemo(
    () =>
      ordersQuery.data?.orders.find((item) => item.status === 'registration_started') ??
      ordersQuery.data?.orders[0] ??
      null,
    [ordersQuery.data?.orders]
  );
  const workflowFormsQuery = useQuery({
    queryKey: biteplanerQueryKeys.workflowForms(order?.id ?? 'pending'),
    queryFn: () => fetchWorkflowForms(order!.id, token),
    enabled: Boolean(token && order?.id),
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });
  const workflowForms = workflowFormsQuery.data?.forms ?? [];
  const loading = ordersQuery.isLoading;
  const formsLoading = Boolean(order?.id) && workflowFormsQuery.isLoading;
  const formsError = workflowFormsQuery.isError ? 'Não foi possível carregar a avaliação inicial compartilhada.' : '';
  const loadError = ordersQuery.isError ? 'Não foi possível carregar o pedido do pre-requisito.' : '';
  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  const intakeForms = useMemo(
    () => workflowForms.filter((form) => form.templateKey === INTAKE_TEMPLATE_KEY),
    [workflowForms]
  );
  const onboardingForms = useMemo(
    () => workflowForms.filter((form) => form.templateKey === 'customer_new_user_onboarding'),
    [workflowForms]
  );
  const shouldRedirectToOnboarding = Boolean(
    order?.id &&
    !formsLoading &&
    !formsError &&
    intakeForms.length === 0 &&
    onboardingForms.some((form) => !isCustomerOnboardingComplete(form))
  );
  const completedIntake = useMemo(
    () => intakeForms.find(customerIntakeIsComplete) ?? null,
    [intakeForms]
  );

  useEffect(() => {
    if (!shouldRedirectToOnboarding) {
      return;
    }

    navigate('/painel/biteplaner/onboarding', { replace: true });
  }, [navigate, shouldRedirectToOnboarding]);

  function handleSubmittedIntake(form: DemoWorkflowForm) {
    if (!order || order.status !== 'registration_started' || redirectTimeoutRef.current) {
      return;
    }

    const blockerMessage = getBlockerMessage(getFormBlocker(form));
    if (blockerMessage) {
      setError(blockerMessage);
      return;
    }

    setNotice('');
    setError('');
    setIsProcessingSubmittedIntake(true);

    queryClient.setQueryData<{ orders: DemoOrderSummary[] }>(
      biteplanerQueryKeys.orders('user', queryOwnerId),
      (current) =>
        current
          ? {
              orders: current.orders.map((currentOrder) =>
                currentOrder.id === order.id
                  ? {
                      ...currentOrder,
                      status: 'awaiting_scheduling',
                      statusLabel: 'Aguardando consulta inicial',
                      stage: 'awaiting_initial_consultation',
                    }
                  : currentOrder
              ),
            }
          : current
    );
    setNotice('Pre-requisito concluído. Agora escolha o consultório para a consulta inicial.');
    redirectTimeoutRef.current = setTimeout(() => {
      navigate('/painel/consulta-inicial');
    }, SUCCESS_REDIRECT_DELAY_MS);
  }

  function handleWorkflowFormsChange(nextForms: DemoWorkflowForm[]) {
    if (order) {
      queryClient.setQueryData<{ forms: DemoWorkflowForm[] }>(
        biteplanerQueryKeys.workflowForms(order.id),
        { forms: nextForms }
      );
    }

    const submittedIntake = nextForms.find(
      (form) => form.templateKey === INTAKE_TEMPLATE_KEY && customerIntakeIsComplete(form)
    );

    if (submittedIntake) {
      const blockerMessage = getBlockerMessage(getFormBlocker(submittedIntake));
      if (blockerMessage) {
        setError(blockerMessage);
        return;
      }

      handleSubmittedIntake(submittedIntake);
    }
  }

  return (
    <S.Page>
      {notice ? (
        <SnackbarStack>
          <Snackbar
            tone="success"
            title="Pre-requisito concluído"
            message={notice}
            onClose={() => {
              setNotice('');
            }}
          />
        </SnackbarStack>
      ) : null}

      <S.Content>
        <S.OnboardingCard data-testid="pre-requisito-onboarding-card">
          {loading ? (
            <div aria-label="Carregando pedido do pre-requisito">
              <SkeletonCard lines={5} blockHeight="112px" />
            </div>
          ) : (
            <>
              <S.PrerequisiteHero>
                <S.OnboardingMainTitle>
                  <S.OnboardingHeroIcon aria-hidden="true">
                    <Info size={48} strokeWidth={1.9} />
                  </S.OnboardingHeroIcon>
                  <span>Pre-requisito Biteplaner</span>
                </S.OnboardingMainTitle>
                <S.OnboardingHeroLead>
                  Antes da consulta inicial, registre a avaliação compartilhada para preparar a jornada{' '}
                  <strong>Biteplaner</strong>.
                </S.OnboardingHeroLead>
                <S.PrerequisiteMetaGrid>
                  <S.PrerequisiteMetaItem>
                    <S.PrerequisiteMetaLabel>Pedido</S.PrerequisiteMetaLabel>
                    <S.PrerequisiteMetaValue>
                      {order ? getOrderDisplayId(order) : 'Pedido Biteplaner'}
                    </S.PrerequisiteMetaValue>
                  </S.PrerequisiteMetaItem>
                  <S.PrerequisiteMetaItem>
                    <S.PrerequisiteMetaLabel>Status atual</S.PrerequisiteMetaLabel>
                    <S.PrerequisiteStatus data-testid="athlete-order-status">
                      {order?.statusLabel ?? 'Pre-requisito pendente'}
                    </S.PrerequisiteStatus>
                  </S.PrerequisiteMetaItem>
                  <S.PrerequisiteMetaItem>
                    <S.PrerequisiteMetaLabel>Preenchimento</S.PrerequisiteMetaLabel>
                    <S.PrerequisiteMetaValue>Campos com (*) são obrigatórios.</S.PrerequisiteMetaValue>
                  </S.PrerequisiteMetaItem>
                </S.PrerequisiteMetaGrid>
              </S.PrerequisiteHero>

              {loadError ? <S.Banner role="alert">{loadError}</S.Banner> : null}
              {error ? <S.Banner role="alert">{error}</S.Banner> : null}
              {formsError ? <S.Banner role="alert">{formsError}</S.Banner> : null}
              {formsLoading ? (
                <div aria-label="Carregando avaliação inicial compartilhada">
                  <SkeletonCard lines={4} blockHeight="120px" />
                </div>
              ) : (
                <>
                  <S.OnboardingDivider />
                  {completedIntake ? (
                    <S.ProcessingBanner role="status" aria-live="polite">
                      <S.ProcessingSpinner aria-hidden="true" />
                      <S.ProcessingContent>
                        <strong>
                          {isProcessingSubmittedIntake
                            ? 'Estamos processando sua ordem'
                            : 'Você já preencheu este formulário'}
                        </strong>
                        <span>
                          {isProcessingSubmittedIntake
                            ? 'O pré-requisito foi concluído. Aguarde alguns instantes: você será redirecionado para escolher a clínica da consulta inicial.'
                            : 'O pré-requisito foi concluído e a próxima etapa da jornada Biteplaner já está disponível.'}
                        </span>
                        <span>
                          Se preferir, acompanhe pelo{' '}
                          <S.ProcessingLink to="/painel/biteplaner/jornada">
                            fluxo da jornada
                          </S.ProcessingLink>
                          .
                        </span>
                      </S.ProcessingContent>
                    </S.ProcessingBanner>
                  ) : (
                    <WorkflowFormsPanel
                    orderId={order?.id ?? null}
                    token={token}
                    title="Avaliação inicial compartilhada Biteplaner"
                    description="Preencha esta avaliação em etapas para liberar a próxima fase da jornada Biteplaner."
                    templateFilter={[INTAKE_TEMPLATE_KEY]}
                    defaultValues={EMPTY_WORKFLOW_DEFAULT_VALUES}
                    forms={workflowForms}
                    onFormsChange={handleWorkflowFormsChange}
                    payloadExtras={BITEPLANER_CONSENT_PAYLOAD}
                    actorRole="user"
                    formPresentation="flat"
                    showFormHeader={false}
                    variant="embedded"
                    />
                  )}

                  {intakeForms.length === 0 && !completedIntake && !formsLoading && !formsError && !shouldRedirectToOnboarding ? (
                    <S.Banner role="status">A avaliação inicial compartilhada ainda não foi liberada para este pedido.</S.Banner>
                  ) : null}

                </>
              )}
            </>
          )}
        </S.OnboardingCard>
      </S.Content>
    </S.Page>
  );
}
