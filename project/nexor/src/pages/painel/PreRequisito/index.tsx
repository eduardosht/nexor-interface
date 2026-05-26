import { useEffect, useMemo, useRef, useState } from 'react';
import { Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Snackbar, SnackbarStack } from '@nexor/design-system';
import { SkeletonCard, SkeletonGrid } from '../../../components/Skeleton';
import { useAuth } from '../../../hooks/useAuth';
import {
  completePrerequisite,
  fetchOrders,
  fetchWorkflowForms,
  getAuthToken,
  type DemoOrderSummary,
  type DemoWorkflowForm,
} from '../../../features/demo/biteplanerFlow';
import { OrderStepHeader } from '../components/OrderStepHeader';
import { WorkflowFormsPanel } from '../components/WorkflowFormsPanel';
import * as S from './styles';

const SUCCESS_REDIRECT_DELAY_MS = 700;
const INTAKE_TEMPLATE_KEY = 'customer_pre_consultation_intake';

function customerIntakeIsComplete(form: DemoWorkflowForm) {
  if (form.roleState) {
    return form.roleState.customer === 'submitted' || form.roleState.customer === 'locked';
  }

  return form.status === 'submitted';
}

function consentWasAccepted(value: unknown) {
  if (Array.isArray(value)) {
    return value.includes('accepted');
  }

  return value === 'accepted' || value === true;
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
  return isActiveOrthodonticTreatment(customerPayload.orthodonticTreatmentStatus)
    ? 'active_orthodontic_treatment'
    : null;
}

function isActiveOrthodonticTreatment(value: unknown) {
  return value === 'active' || value === true || value === 'yes';
}

export function PreRequisito() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const token = getAuthToken(session);
  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [order, setOrder] = useState<DemoOrderSummary | null>(null);
  const [workflowForms, setWorkflowForms] = useState<DemoWorkflowForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [formsLoading, setFormsLoading] = useState(false);
  const [formsError, setFormsError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      return;
    }

    let active = true;

    async function loadOrder() {
      try {
        const response = await fetchOrders('user', token);
        const nextOrder = response.orders.find((item) => item.status === 'registration_started') ?? response.orders[0] ?? null;

        if (active) {
          setOrder(nextOrder);
        }
      } catch {
        if (active) {
          setError('Não foi possível carregar o pedido do pre-requisito.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadOrder();

    return () => {
      active = false;
    };
  }, [token]);

  useEffect(() => {
    if (!token || !order?.id) {
      setWorkflowForms([]);
      return;
    }

    let active = true;
    const orderId = order.id;
    setFormsLoading(true);
    setFormsError('');

    async function loadForms() {
      try {
        const response = await fetchWorkflowForms(orderId, token);

        if (active) {
          setWorkflowForms(response.forms);
        }
      } catch {
        if (active) {
          setFormsError('Não foi possível carregar a avaliação inicial compartilhada.');
        }
      } finally {
        if (active) {
          setFormsLoading(false);
        }
      }
    }

    void loadForms();

    return () => {
      active = false;
    };
  }, [order?.id, token]);

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
  const intakeIsComplete = intakeForms.length > 0 && intakeForms.every(customerIntakeIsComplete);

  async function completePrerequisiteFromIntake(form: DemoWorkflowForm) {
    if (!order || !token || order.status !== 'registration_started' || submitting) {
      return;
    }

    const customerPayload = getCustomerPayload(form);
    if (getFormBlocker(form) === 'active_orthodontic_treatment') {
      setError('Não é possível continuar com tratamento ortodôntico ativo. Procure orientação clínica antes de seguir com o Biteplaner.');
      return;
    }

    const consents = {
      service: consentWasAccepted(customerPayload.serviceConsent) || consentWasAccepted(customerPayload.clinicalPrivacyConsent),
      sensitiveHealth:
        consentWasAccepted(customerPayload.sensitiveHealthConsent) || consentWasAccepted(customerPayload.clinicalPrivacyConsent),
      research: consentWasAccepted(customerPayload.researchConsent),
      marketing: consentWasAccepted(customerPayload.marketingConsent),
    };

    if (!consents.service || !consents.sensitiveHealth) {
      return;
    }

    setSubmitting(true);
    setNotice('');
    setError('');

    try {
      const response = await completePrerequisite(
        order.id,
        {
          documentType: 'workflow_intake',
          documentNumber: '',
          sport: '',
          isMinor: false,
          eligibility: {
            orthodontic: isActiveOrthodonticTreatment(customerPayload.orthodonticTreatmentStatus),
            activeDentalTreatment: false,
            relevantCondition: false,
          },
          consents,
        },
        token
      );
      setOrder(response.order);
      setNotice('Pre-requisito concluído. Agora escolha o consultório para a consulta inicial.');
      redirectTimeoutRef.current = setTimeout(() => {
        navigate('/painel/consulta-inicial');
      }, SUCCESS_REDIRECT_DELAY_MS);
    } catch {
      setError('Não foi possível concluir o pre-requisito agora.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleWorkflowFormsChange(nextForms: DemoWorkflowForm[]) {
    setWorkflowForms(nextForms);

    const submittedIntake = nextForms.find(
      (form) => form.templateKey === INTAKE_TEMPLATE_KEY && customerIntakeIsComplete(form)
    );

    if (submittedIntake) {
      if (getFormBlocker(submittedIntake) === 'active_orthodontic_treatment') {
        setError('Não é possível continuar com tratamento ortodôntico ativo. Procure orientação clínica antes de seguir com o Biteplaner.');
        return;
      }

      void completePrerequisiteFromIntake(submittedIntake);
    }
  }

  return (
    <S.Page>
      <OrderStepHeader
        title="Pre-requisito Biteplaner"
        description={
          <>
            Antes da consulta inicial, precisamos registrar a avaliação inicial compartilhada e os
            consentimentos necessários para a jornada <strong>Biteplaner</strong>.
            <br />
            Essas informações ajudam o dentista licenciado a preparar o atendimento e mantém as
            autorizações obrigatórias separadas das permissões opcionais.
          </>
        }
        currentStep="prerequisite"
        order={order}
        orderHelpText="Este pedido ainda precisa da avaliação inicial e dos consentimentos para avancar."
      >
        <S.GuidanceBanner>
          <S.InfoIcon aria-hidden="true">
            <Info size={18} strokeWidth={2.3} />
          </S.InfoIcon>
          <div>
            <p>
              Campos marcados com <S.RequiredStar>(*)</S.RequiredStar> são obrigatórios.
            </p>
            <p>Campos opcionais aparecem identificados como "Opcional".</p>
          </div>
        </S.GuidanceBanner>
      </OrderStepHeader>

      {loading ? (
        <S.Content aria-label="Carregando pedido do pre-requisito">
          <SkeletonCard lines={3} />
          <SkeletonCard lines={5} blockHeight="96px" />
        </S.Content>
      ) : null}
      {error ? <S.Banner role="alert">{error}</S.Banner> : null}
      {!loading && formsLoading ? (
        <S.Content aria-label="Carregando avaliação inicial compartilhada">
          <SkeletonGrid cards={2} minCardWidth="260px" />
          <SkeletonCard lines={4} blockHeight="120px" />
        </S.Content>
      ) : null}
      {formsError ? <S.Banner role="alert">{formsError}</S.Banner> : null}
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

      {!loading && !formsLoading ? (
        <S.Content>
        <WorkflowFormsPanel
          orderId={order?.id ?? null}
          token={token}
          title="Avaliação inicial compartilhada Biteplaner"
          description="Preencha está avaliação em etapas para liberar a próxima fase da jornada Biteplaner."
          templateFilter={[INTAKE_TEMPLATE_KEY]}
          defaultValues={{
            fullName: order?.customer?.full_name ?? '',
          }}
          forms={workflowForms}
          onFormsChange={handleWorkflowFormsChange}
          actorRole="user"
        />

        {intakeForms.length === 0 && !formsLoading && !formsError ? (
          <S.Banner role="status">A avaliação inicial compartilhada ainda não foi liberada para este pedido.</S.Banner>
        ) : null}

        {submitting ? <S.Banner role="status">Concluindo pre-requisito...</S.Banner> : null}
        {!intakeIsComplete && intakeForms.length > 0 ? (
          <S.Banner role="status">
            Envie a avaliação inicial compartilhada com os consentimentos obrigatórios para concluir o pre-requisito.
          </S.Banner>
        ) : null}
        </S.Content>
      ) : null}
    </S.Page>
  );
}
