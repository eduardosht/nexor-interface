import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, ClipboardCheck } from 'lucide-react';
import {
  AdminFormButton,
  Snackbar,
  SnackbarStack,
} from '@nexor/design-system';
import { SkeletonCard, SkeletonGrid } from '../../../components/Skeleton';
import { useAuth } from '../../../hooks/useAuth';
import {
  completeProductionRequest,
  confirmProductionScanUpload,
  createProductionScanUploadIntent,
  fetchOrder,
  fetchOrderForm,
  fetchOrderForms,
  fetchOrders,
  fetchWorkflowForm,
  fetchWorkflowForms,
} from '../../../features/biteplaner/orders/orders.api';
import {
  getOrderDisplayId,
  getAuthToken,
  registerClinicalDecision,
  type DemoOrderSummary,
  type DemoWorkflowForm,
  type ProductionRequestDraft,
} from '../../../features/demo/biteplanerFlow';
import { uploadProductionRequestFile } from '../../../features/demo/externalUploadGateway';
import { mapProductionRequestPayload } from '../../../features/biteplaner/production/productionRequestPayload';
import { biteplanerQueryKeys } from '../../../features/demo/biteplanerQueryKeys';
import {
  PageStack,
} from '../admin/styles';
import { SHARED_INITIAL_EVALUATION_INTAKE } from '../components/sharedIntakeDefinition';
import { WorkflowFormsPanel } from '../components/WorkflowFormsPanel';
import { PendingFeedbackPrompt } from '../components/PendingFeedbackPrompt';
import { OrderInfoCard } from '../components/OrderStepHeader';
import { JourneyNoticeCard } from '../components/JourneyNoticeCard';
import { DentalAnamnesisRecord } from './DentalAnamnesisRecord';
import { ProductionRequestFields } from './ProductionRequestFields';
import * as S from './styles';


const STEP_DEFINITIONS = [
  {
    key: 'anamnesis',
    label: 'Avaliação inicial / anamnese',
    description: 'Revise e complemente a avaliação compartilhada antes da geração da anamnese final.',
    shortLabel: 'Revisão clínica',
  },
  {
    key: 'anamnesis-summary',
    label: 'Resumo anamnese',
    description: 'Revise todos os dados clínicos e registre o resumo antes de baixar a anamnese em PDF.',
    shortLabel: 'Resumo clínico',
  },
  {
    key: 'production-request',
    label: 'Solicitação de produção',
    description: 'Preencha a solicitação clínica, observações e anexos obrigatórios para a operação Nexor.',
    shortLabel: 'Formulário produtivo',
  },
] as const;

const EMPTY_DRAFT: ProductionRequestDraft = {
  anamnesisSummary: '',
  anamnesisDownloaded: false,
  productionRequestSummary: '',
  opsNotes: '',
  scan3dFileName: '',
  scan3dFileRef: null,
  lgpdConfirmed: false,
  externalProductionProviderId: null,
  purchaseConfiguration: null,
  purchaseDivergenceConfirmed: false,
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuidOrderId(value: string | undefined): value is string {
  return typeof value === 'string' && UUID_PATTERN.test(value);
}

function getActorScopedWorkflowFormsQueryKey(orderId: string, ownerId: string) {
  return [...biteplanerQueryKeys.workflowForms(orderId), 'actor', ownerId] as const;
}

function getActorScopedWorkflowFormQueryKey(orderId: string, workflowFormId: string, ownerId: string) {
  return [...biteplanerQueryKeys.workflowForm(orderId, workflowFormId), 'actor', ownerId] as const;
}

function hasPurchaseConfigurationDivergence(
  purchased: ProductionRequestDraft['purchaseConfiguration'],
  recommended: DemoOrderSummary['dentistRecommendedPurchaseConfiguration']
) {
  if (!purchased || !recommended) {
    return false;
  }

  return (
    purchased.quantity !== recommended.quantity ||
    purchased.model.trim().toLowerCase() !== recommended.model.trim().toLowerCase() ||
    purchased.color.trim().toLowerCase() !== recommended.color.trim().toLowerCase()
  );
}
function hasDentistComplement(form: DemoWorkflowForm | undefined) {
  if (!form) {
    return false;
  }

  if (form.dentistSubmittedAt || form.roleState?.dentist === 'submitted') {
    return true;
  }

  const payload =
    form.payload && typeof form.payload === 'object' && !Array.isArray(form.payload)
      ? form.payload
      : null;
  const dentistPayload = payload?.dentist;

  return Boolean(
    dentistPayload &&
    typeof dentistPayload === 'object' &&
    !Array.isArray(dentistPayload) &&
    Object.keys(dentistPayload).length > 0
  );
}

function getCurrentDentistId(backendUser: unknown, order: DemoOrderSummary | null | undefined) {
  const user: Record<string, unknown> = isRecord(backendUser) ? backendUser : {};
  const orderDentist: Record<string, unknown> = isRecord(order?.dentist) ? order.dentist : {};

  return getStringValue(user.dentistId) || getStringValue(orderDentist.id);
}

function isDentistComplementFromAnotherDentist(
  form: DemoWorkflowForm | undefined,
  currentDentistId: string,
  currentDentistEmail: string
) {
  if (!form || form.templateKey !== 'customer_pre_consultation_intake' || !hasDentistComplement(form)) {
    return false;
  }

  if (form.dentistId && form.dentistId !== currentDentistId) {
    return true;
  }

  const payload = isRecord(form.payload) ? form.payload : {};
  const dentistPayload = isRecord(payload.dentist) ? payload.dentist : {};
  const dentistContact = getStringValue(dentistPayload.dentistProfessionalContact).toLowerCase();

  return Boolean(!form.dentistId && currentDentistEmail && dentistContact && !dentistContact.includes(currentDentistEmail.toLowerCase()));
}

function getCurrentDentistIntakeForm(
  form: DemoWorkflowForm | undefined,
  currentDentistId: string,
  currentDentistEmail: string
): DemoWorkflowForm | undefined {
  if (!isDentistComplementFromAnotherDentist(form, currentDentistId, currentDentistEmail)) {
    return form;
  }

  if (!form) {
    return undefined;
  }

  const payload = isRecord(form.payload) ? form.payload : {};
  const customerPayload = isRecord(payload.customer) ? payload.customer : {};

  return {
    ...form,
    roleState: { customer: 'submitted' as const, dentist: 'pending' as const },
    dentistSubmittedAt: null,
    dentistId: currentDentistId || form.dentistId,
    payload: { customer: customerPayload },
  };
}

function hasWorkflowValue(value: unknown) {
  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return value !== null && value !== undefined && value !== '';
}

function hasFormPayload(form: DemoWorkflowForm | undefined) {
  return Boolean(
    form?.payload &&
    typeof form.payload === 'object' &&
    !Array.isArray(form.payload) &&
    Object.keys(form.payload).length > 0
  );
}

function getDentistProfessionalObservations(form: DemoWorkflowForm | undefined) {
  const payload = isRecord(form?.payload) ? form.payload : {};
  const dentistPayload = isRecord(payload.dentist) ? payload.dentist : {};
  const value = dentistPayload.professionalObservations;

  return typeof value === 'string' ? value.trim() : '';
}

function getDentistPendingRequiredFields(form: DemoWorkflowForm | undefined) {
  const payload = isRecord(form?.payload) ? form.payload : {};
  const dentistPayload = isRecord(payload.dentist) ? payload.dentist : {};
  const dentistSections = SHARED_INITIAL_EVALUATION_INTAKE.sections.filter((section) =>
    section.fields.some((field) => field.ownerRole === 'dentist')
  );

  if (dentistSections.length === 0 || form?.dentistSubmittedAt || form?.roleState?.dentist === 'submitted') {
    return [];
  }

  return dentistSections
    .flatMap((section) => section.fields)
    .filter((field) => field.ownerRole === 'dentist' && field.required)
    .filter((field) => {
      if (['biteplanerModel', 'biteplanerColor', 'biteplanerQuantity'].includes(field.key)) {
        return dentistPayload.biteplannerEligible === 'yes';
      }

      return true;
    })
    .filter((field) => !hasWorkflowValue(dentistPayload[field.key]))
    .map((field) => field.label);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function getStringValue(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function getDentistSystemValues(backendUser: unknown, sessionEmail?: string | null) {
  const user = isRecord(backendUser) ? backendUser : {};
  const productRoles = Array.isArray(user.productRoles) ? user.productRoles : [];
  const dentistRole = productRoles.find((role) => {
    if (!isRecord(role)) {
      return false;
    }

    return role.productKey === 'biteplaner' && role.role === 'dentist';
  });
  const metadata = isRecord(dentistRole) && isRecord(dentistRole.metadata) ? dentistRole.metadata : {};
  const email = getStringValue(user.email) || getStringValue(sessionEmail);
  const phone = getStringValue(user.phone);
  const contact = [email, phone].filter(Boolean).join(' / ');

  return {
    evaluationDate: new Date().toLocaleDateString('pt-BR'),
    dentistName: getStringValue(metadata.fullName) || getStringValue(user.fullName) || email,
    dentistCro: getStringValue(metadata.croNumber),
    dentistProfessionalContact: contact,
  };
}

function formatAnamnesisDownloadDate(date: Date) {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}${month}${day}`;
}

export function ProducaoDentista() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { session, backendUser } = useAuth();
  const queryClient = useQueryClient();
  const token = getAuthToken(session);
  const [completing, setCompleting] = useState(false);
  const [actionError, setActionError] = useState('');
  const [notice, setNotice] = useState('');
  const [pdfNotice, setPdfNotice] = useState('');
  const [pdfError, setPdfError] = useState('');
  const [productionAttachmentUploading, setProductionAttachmentUploading] = useState(false);
  const [selectedProductionScanFile, setSelectedProductionScanFile] = useState<File | null>(null);
  const [draft, setDraft] = useState<ProductionRequestDraft>(EMPTY_DRAFT);
  const [currentStep, setCurrentStep] = useState(0);
  const draftRef = useRef<ProductionRequestDraft>(EMPTY_DRAFT);
  const hydratedOrderIdRef = useRef<string | null>(null);
  const queryOwnerId = backendUser?.id ?? session?.user.id ?? 'anonymous';
  const isAnamnesisRecordDeepLink = location.hash.startsWith('#anamnese-');
  const isProductionRequestDeepLink = location.hash === '#production-request';

  const ordersQuery = useQuery({
    queryKey: biteplanerQueryKeys.orders('dentist', queryOwnerId),
    queryFn: () => fetchOrders('dentist', token),
    enabled: Boolean(token && orderId),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
  const orderDetailQuery = useQuery({
    queryKey: biteplanerQueryKeys.orderDetail(orderId ?? 'pending'),
    queryFn: () => fetchOrder(orderId!, token),
    enabled: Boolean(token && isUuidOrderId(orderId)),
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
  const orders = useMemo(
    () => (Array.isArray(ordersQuery.data?.orders) ? ordersQuery.data.orders : []),
    [ordersQuery.data?.orders]
  );
  const order = useMemo(
    () => orderDetailQuery.data ?? orders.find((item) => item.id === orderId) ?? null,
    [orderDetailQuery.data, orderId, orders]
  );
  const workflowFormsQuery = useQuery({
    queryKey: getActorScopedWorkflowFormsQueryKey(order?.id ?? 'pending', queryOwnerId),
    queryFn: () => fetchWorkflowForms(order!.id, token),
    enabled: Boolean(token && order?.id),
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });
  const workflowForms = workflowFormsQuery.data?.forms ?? [];
  const canShowFeedbackPrompt = Boolean(
    order &&
    ['product_received_by_clinic', 'awaiting_adaptation', 'follow_up', 'completed'].includes(order.status)
  );
  const productionFormsQuery = useQuery({
    queryKey: biteplanerQueryKeys.orderForms(order?.id ?? 'pending'),
    queryFn: () => fetchOrderForms(order!.id, token),
    enabled: Boolean(token && order?.id),
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
  const latestProductionForm = useMemo(
    () =>
      (productionFormsQuery.data?.forms ?? [])
        .filter((form) => form.type === 'production_request')
        .sort((left, right) => right.version - left.version || Date.parse(right.created_at) - Date.parse(left.created_at))[0] ?? null,
    [productionFormsQuery.data?.forms]
  );
  const productionFormDetailQuery = useQuery({
    queryKey: biteplanerQueryKeys.orderForm(order?.id ?? 'pending', latestProductionForm?.id ?? 'pending'),
    queryFn: () => fetchOrderForm(order!.id, latestProductionForm!.id, token),
    enabled: Boolean(token && order?.id && latestProductionForm?.id),
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
  const savedProductionDraft = useMemo(() => {
    const payload = productionFormDetailQuery.data?.payload;
    if (payload) {
      return mapProductionRequestPayload(payload);
    }

    return order?.productionRequestDraft ?? null;
  }, [order?.productionRequestDraft, productionFormDetailQuery.data?.payload]);
  const intakeFormFromList = workflowForms.find((form) => form.templateKey === 'customer_pre_consultation_intake');
  const onboardingFormFromList = workflowForms.find((form) => form.templateKey === 'customer_new_user_onboarding');
  const intakeFormDetailQuery = useQuery({
    queryKey: getActorScopedWorkflowFormQueryKey(order?.id ?? 'pending', intakeFormFromList?.id ?? 'pending', queryOwnerId),
    queryFn: () => fetchWorkflowForm(order!.id, intakeFormFromList!.id, token),
    enabled: Boolean(token && order?.id && intakeFormFromList?.id && intakeFormFromList.canViewPayload && !intakeFormFromList.payload),
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });
  const onboardingFormDetailQuery = useQuery({
    queryKey: getActorScopedWorkflowFormQueryKey(order?.id ?? 'pending', onboardingFormFromList?.id ?? 'pending', queryOwnerId),
    queryFn: () => fetchWorkflowForm(order!.id, onboardingFormFromList!.id, token),
    enabled: Boolean(token && order?.id && onboardingFormFromList?.id && onboardingFormFromList.canViewPayload && !onboardingFormFromList.payload),
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });
  const currentDentistId = getCurrentDentistId(backendUser, order);
  const currentDentistEmail = session?.user.email ?? backendUser?.email ?? '';
  const rawIntakeForm = intakeFormDetailQuery.data ?? intakeFormFromList;
  const intakeForm = getCurrentDentistIntakeForm(rawIntakeForm, currentDentistId, currentDentistEmail);
  const onboardingForm = onboardingFormDetailQuery.data ?? onboardingFormFromList;
  const workflowFormsForPanel = useMemo(() => {
    if (!intakeForm && !onboardingForm) {
      return workflowForms;
    }

    return workflowForms.map((form) => {
      if (intakeForm && form.id === intakeForm.id) {
        return intakeForm;
      }

      if (onboardingForm && form.id === onboardingForm.id) {
        return onboardingForm;
      }

      return form;
    });
  }, [intakeForm, onboardingForm, workflowForms]);
  const loading =
    ordersQuery.isLoading ||
    (isUuidOrderId(orderId) && orderDetailQuery.isLoading) ||
    (Boolean(order) && workflowFormsQuery.isLoading) ||
    (Boolean(order) && productionFormsQuery.isLoading) ||
    (Boolean(order) && Boolean(latestProductionForm) && productionFormDetailQuery.isLoading) ||
    (Boolean(intakeFormFromList) && intakeFormDetailQuery.isLoading) ||
    (Boolean(onboardingFormFromList) && onboardingFormDetailQuery.isLoading);
  const error = actionError ||
    (orderDetailQuery.isError
      ? 'Nao foi possivel carregar a ordem de producao do banco local.'
      : ordersQuery.isError
      ? 'Nao foi possivel carregar a solicitacao de producao da demo.'
      : ordersQuery.isSuccess && !order
        ? 'Nao foi possivel localizar essa ordem na fila do dentista.'
        : '');
  const formsError = workflowFormsQuery.isError
    ? 'Nao foi possivel carregar o intake compartilhado desta ordem.'
    : '';


  useEffect(() => {
    if (!order) {
      hydratedOrderIdRef.current = null;
      draftRef.current = EMPTY_DRAFT;
      setDraft(EMPTY_DRAFT);
      return;
    }

    if (!savedProductionDraft && !productionFormsQuery.isFetched) {
      return;
    }

    const nextDraft = {
      ...EMPTY_DRAFT,
      ...(savedProductionDraft ?? {}),
      purchaseConfiguration: savedProductionDraft?.purchaseConfiguration ?? order.purchaseConfiguration ?? null,
      purchaseDivergenceConfirmed: savedProductionDraft?.purchaseDivergenceConfirmed ?? false,
    };
    const hydrationSource = productionFormDetailQuery.data?.payload ? latestProductionForm?.id ?? 'form' : 'order';
    const hydrationKey = `${order.id}:${hydrationSource}:${latestProductionForm?.version ?? 0}`;

    if (hydratedOrderIdRef.current === hydrationKey) {
      return;
    }

    hydratedOrderIdRef.current = hydrationKey;
    draftRef.current = nextDraft;
    setDraft(nextDraft);
  }, [
    latestProductionForm?.id,
    latestProductionForm?.version,
    order,
    productionFormDetailQuery.data?.payload,
    productionFormsQuery.isFetched,
    savedProductionDraft,
  ]);



  useEffect(() => {
    if (!isAnamnesisRecordDeepLink) {
      return;
    }

    setCurrentStep(1);
  }, [isAnamnesisRecordDeepLink]);

  useEffect(() => {
    if (!isProductionRequestDeepLink) {
      return;
    }

    setCurrentStep(2);
  }, [isProductionRequestDeepLink]);

  useEffect(() => {
    if (!isAnamnesisRecordDeepLink || currentStep !== 1 || !location.hash) {
      return;
    }

    window.requestAnimationFrame(() => {
      document.getElementById(location.hash.slice(1))?.scrollIntoView({ block: 'start' });
    });
  }, [currentStep, isAnamnesisRecordDeepLink, location.hash]);

  const dentistPendingRequiredFields = getDentistPendingRequiredFields(intakeForm);
  const dentistReviewCompleted = hasDentistComplement(intakeForm) && dentistPendingRequiredFields.length === 0;
  const anamnesisCompleted = dentistReviewCompleted;
  const productionRequestCompleted = draft.productionRequestSummary.trim().length > 0;
  const productionScanSelected = Boolean(draft.scan3dFileRef) || selectedProductionScanFile !== null;
  const attachmentsCompleted =
    draft.scan3dFileName.trim().length > 0 &&
    productionScanSelected &&
    !productionAttachmentUploading &&
    draft.lgpdConfirmed;
  const purchaseDivergenceRequiresConfirmation = hasPurchaseConfigurationDivergence(
    draft.purchaseConfiguration,
    order?.dentistRecommendedPurchaseConfiguration ?? null
  );
  const purchaseDivergenceCompleted = !purchaseDivergenceRequiresConfirmation || draft.purchaseDivergenceConfirmed === true;
  const canComplete =
    anamnesisCompleted &&
    productionRequestCompleted &&
    attachmentsCompleted &&
    purchaseDivergenceCompleted;

  const stepCompletion = [
    dentistReviewCompleted,
    anamnesisCompleted,
    productionRequestCompleted && attachmentsCompleted && purchaseDivergenceCompleted,
  ];
  const currentStepData = STEP_DEFINITIONS[currentStep];
  const currentStepCompleted = stepCompletion[currentStep] ?? false;
  const isIneligibleReassessment = order?.status === 'ineligible_reassessment';
  const canProceedToProductionAfterPayment =
    order?.status === 'payment_confirmed' ||
    order?.status === 'awaiting_dentist_forms' ||
    order?.status === 'dentist_adjustment_required';
  const shouldHoldAtAnamnesisSummary =
    currentStep === 1 && dentistReviewCompleted && !canProceedToProductionAfterPayment;
  const anamnesisHoldNotice = isIneligibleReassessment
    ? {
      title: 'Cliente inapto para o Biteplaner',
      label: 'Cliente inapto para o Biteplaner',
      description:
        'O dentista registrou que o cliente não está apto para seguir com o Biteplaner agora. O cliente deverá selecionar outra clínica ou reagendar uma consulta com a mesma clínica para uma nova avaliação.',
      actionLabel: 'Aguardando reagendamento do cliente',
    }
    : {
      title: 'Pagamento do Biteplaner pendente',
      label: 'Pagamento do Biteplaner pendente',
      description:
        'O dentista precisa concluir o pagamento do Biteplaner com a Nexor antes de prosseguir para a solicitação de produção.',
      actionLabel: 'Aguardando pagamento do dentista',
    };
  const anamnesisSourceDataReady = hasFormPayload(intakeForm);
  const dentistProfessionalObservations = getDentistProfessionalObservations(intakeForm);
  const dentistSystemValues = useMemo(
    () => getDentistSystemValues(backendUser, session?.user.email),
    [backendUser, session?.user.email]
  );

  useEffect(() => {
    if (isAnamnesisRecordDeepLink || isProductionRequestDeepLink) {
      return;
    }

    if (!dentistReviewCompleted || currentStep !== 0) {
      return;
    }

    setCurrentStep(1);
  }, [
    currentStep,
    dentistReviewCompleted,
    isAnamnesisRecordDeepLink,
    isProductionRequestDeepLink,
  ]);

  useEffect(() => {
    if (!dentistProfessionalObservations || draftRef.current.anamnesisSummary === dentistProfessionalObservations) {
      return;
    }

    updateDraft({ anamnesisSummary: dentistProfessionalObservations });
  }, [dentistProfessionalObservations]);


  function updateDraft(patch: Partial<ProductionRequestDraft>) {
    setDraft((current) => {
      const nextDraft = { ...current, ...patch };
      draftRef.current = nextDraft;

      if (orderId) {
        queryClient.setQueryData<{ orders: DemoOrderSummary[] }>(
          biteplanerQueryKeys.orders('dentist', queryOwnerId),
          (currentOrders) => {
            if (!currentOrders) {
              return currentOrders;
            }

            return {
              orders: currentOrders.orders.map((item) =>
                item.id === orderId ? { ...item, productionRequestDraft: nextDraft } : item
              ),
            };
          }
        );
      }

      return nextDraft;
    });
  }

  function handleWorkflowFormsChange(nextForms: DemoWorkflowForm[]) {
    const nextIntakeForm = nextForms.find((form) => form.templateKey === 'customer_pre_consultation_intake');

    if (order) {
      queryClient.setQueryData<{ forms: DemoWorkflowForm[] }>(
        getActorScopedWorkflowFormsQueryKey(order.id, queryOwnerId),
        { forms: nextForms }
      );

      if (nextIntakeForm) {
        queryClient.setQueryData(
          getActorScopedWorkflowFormQueryKey(order.id, nextIntakeForm.id, queryOwnerId),
          nextIntakeForm
        );
      }
    }

    const nextDentistReviewCompleted =
      hasDentistComplement(nextIntakeForm) && getDentistPendingRequiredFields(nextIntakeForm).length === 0;

    if (!nextDentistReviewCompleted) {
      return;
    }

    setCurrentStep((current) => (current === 0 ? 1 : current));
  }

  async function ensureProductionScanFileRef(): Promise<NonNullable<ProductionRequestDraft['scan3dFileRef']>> {
    if (draftRef.current.scan3dFileRef) {
      return draftRef.current.scan3dFileRef;
    }

    if (!selectedProductionScanFile) {
      throw new Error('Anexe o escaneamento 3D intraoral antes de finalizar.');
    }

    if (!orderId || !token) {
      throw new Error('Não foi possível anexar o arquivo. Atualize a sessão e tente novamente.');
    }

    setProductionAttachmentUploading(true);

    try {
      const fileRef = await uploadProductionRequestFile({
        file: selectedProductionScanFile,
        purpose: 'scan3d',
        orderId,
        token,
        createIntent: createProductionScanUploadIntent,
        confirmUpload: confirmProductionScanUpload,
      });
      updateDraft({ scan3dFileName: selectedProductionScanFile.name, scan3dFileRef: fileRef });
      setSelectedProductionScanFile(null);
      return fileRef;
    } finally {
      setProductionAttachmentUploading(false);
    }
  }

  async function handleComplete() {
    if (!token || !orderId || !canComplete) {
      return;
    }

    setCompleting(true);
    setNotice('');
    setActionError('');
    setPdfError('');

    try {
      const scan3dFileRef = await ensureProductionScanFileRef();
      const productionDraft = {
        ...draftRef.current,
        scan3dFileName: draftRef.current.scan3dFileName || scan3dFileRef.fileName,
        scan3dFileRef,
      };

      await registerClinicalDecision(orderId, 'eligible', token);
      await completeProductionRequest(orderId, productionDraft, token);
      await queryClient.invalidateQueries({ queryKey: biteplanerQueryKeys.orderForms(orderId) });
      await queryClient.invalidateQueries({ queryKey: biteplanerQueryKeys.orders('dentist', queryOwnerId) });
      navigate('/painel/biteplaner?mode=dentist', {
        replace: true,
        state: {
          notice: `Solicitação de produção da ordem ${getOrderDisplayId(order)} concluída para revisão da operação Nexor.`,
        },
      });
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Não foi possível concluir a solicitação de produção.');
    } finally {
      setCompleting(false);
    }
  }

  function downloadAnamnesisBlob(blob: Blob) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `ficha-anamnese-odontologica-${formatAnamnesisDownloadDate(new Date())}.pdf`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
    updateDraft({ anamnesisDownloaded: true });
    setPdfNotice('');
  }

  async function downloadAnamnesisPdfWithoutWorker(
    orderSnapshot: DemoOrderSummary,
    draftSnapshot: ProductionRequestDraft
  ) {
    try {
      const { createFinalAnamnesisPdfBlob } = await import('./finalAnamnesisPdf');
      const blob = await createFinalAnamnesisPdfBlob(orderSnapshot, intakeForm, onboardingForm, draftSnapshot);
      downloadAnamnesisBlob(blob);
    } catch {
      setPdfNotice('');
      setPdfError('Não foi possível gerar o PDF da anamnese.');
    }
  }

  function handleDownloadAnamnesisPdf() {
    if (!order) {
      return;
    }

    const orderSnapshot = order;
    const draftSnapshot = draftRef.current;
    setPdfNotice('Gerando ficha de anamnese para download.');
    setPdfError('');

    let worker: Worker;

    try {
      worker = new Worker(new URL('./finalAnamnesisPdf.worker.ts', import.meta.url), { type: 'module' });
    } catch {
      void downloadAnamnesisPdfWithoutWorker(orderSnapshot, draftSnapshot);
      return;
    }

    worker.onmessage = (event: MessageEvent<{ status: 'success'; arrayBuffer: ArrayBuffer } | { status: 'error'; message: string }>) => {
      worker.terminate();

      if (event.data.status === 'error') {
        void downloadAnamnesisPdfWithoutWorker(orderSnapshot, draftSnapshot);
        return;
      }

      const blob = new Blob([event.data.arrayBuffer], { type: 'application/pdf' });
      downloadAnamnesisBlob(blob);
    };

    worker.onerror = () => {
      worker.terminate();
      void downloadAnamnesisPdfWithoutWorker(orderSnapshot, draftSnapshot);
    };

    worker.postMessage({
      order: orderSnapshot,
      intakeForm,
      onboardingForm,
      draft: draftSnapshot,
    });
  }

  function handleNextStep() {
    if (currentStep === 1 && !canProceedToProductionAfterPayment) {
      return;
    }

    setCurrentStep((current) => Math.min(STEP_DEFINITIONS.length - 1, current + 1));
  }

  function handleAnamnesisDeepLinkNext() {
    navigate(
      {
        pathname: location.pathname,
        search: location.search,
      },
      { replace: true }
    );
    handleNextStep();
  }

  function handleOpenDentistReview() {
    navigate(
      {
        pathname: location.pathname,
        search: location.search,
      },
      { replace: true }
    );
    setCurrentStep(0);
  }

  if (!orderId) {
    return (
      <PageStack>
        <S.Banner role="alert">Ordem não informada para a solicitação de produção.</S.Banner>
      </PageStack>
    );
  }

  return (
    <PageStack>
      {loading && !order ? (
        <S.LoadingStack aria-label="Carregando solicitação de produção">
          <SkeletonGrid cards={2} minCardWidth="260px" />
          <SkeletonCard lines={5} blockHeight="140px" />
        </S.LoadingStack>
      ) : null}
      {formsError ? <S.Banner role="alert">{formsError}</S.Banner> : null}
      {error || notice || pdfNotice || pdfError ? (
        <SnackbarStack>
          {pdfNotice ? (
            <Snackbar
              tone="info"
              title="PDF em geração"
              message={pdfNotice}
              onClose={() => {
                setPdfNotice('');
              }}
            />
          ) : null}
          {notice ? (
            <Snackbar
              tone="success"
              title="Ação concluída"
              message={notice}
              onClose={() => {
                setNotice('');
              }}
            />
          ) : null}
          {pdfError ? (
            <Snackbar
              tone="error"
              title="Falha ao gerar PDF"
              message={pdfError}
              onClose={() => {
                setPdfError('');
              }}
            />
          ) : null}
          {error ? (
            <Snackbar
              tone="error"
              title="Falha na requisicao"
              message={error}
              onClose={() => {
                setActionError('');
              }}
            />
          ) : null}
        </SnackbarStack>
      ) : null}

      {order ? (
        <S.ProductionCard>
          <S.ProductionHero>
            <S.ProductionHeroCopy>
              <S.HeroEyebrow>
                <ClipboardCheck size={18} aria-hidden="true" />
                Fluxo do dentista
              </S.HeroEyebrow>
              <S.ProductionTitle>Solicitação de produção</S.ProductionTitle>
              <S.ProductionLead>
                Complete a revisão clínica, gere a anamnese e envie somente os dados necessários para a operação Nexor.
              </S.ProductionLead>
            </S.ProductionHeroCopy>

            <OrderInfoCard
              order={order}
              orderHelpText="Complete a revisão clínica e envie os dados necessários para a operação Nexor."
              showMetadata={false}
            />
          </S.ProductionHero>
          {canShowFeedbackPrompt ? (
            <PendingFeedbackPrompt mode="dentist" orders={[order]} forms={workflowForms} />
          ) : null}
          <S.WizardShell>
            <S.WizardContent>
              <S.StepContentHeader>
                <S.StepKicker>Etapa {currentStep + 1} de {STEP_DEFINITIONS.length}</S.StepKicker>
                <S.StepStatusRow>
                  <S.StepContentTitle>{currentStepData.label}</S.StepContentTitle>
                </S.StepStatusRow>
                <S.StepContentDescription>{currentStepData.description}</S.StepContentDescription>
              </S.StepContentHeader>

              <S.FormPanel>
                {currentStep === 0 ? (
                  <>
                    <WorkflowFormsPanel
                      orderId={order.id}
                      token={token}
                      templateFilter={['customer_pre_consultation_intake']}
                      forms={workflowFormsForPanel}
                      onFormsChange={handleWorkflowFormsChange}
                      variant="embedded"
                      formPresentation="flat"
                      hideProceedActionIcons
                      actorRole="dentist"
                      defaultValues={dentistSystemValues}
                      showFormHeaderStatus={false}
                      queryScope={queryOwnerId}
                    />

                    {!dentistReviewCompleted ? (
                      <S.EmptyState>
                        Revise e complemente a avaliação inicial compartilhada antes de preencher a anamnese final.
                      </S.EmptyState>
                    ) : null}
                  </>
                ) : null}

                {currentStep === 1 ? (
                  <>
                    {anamnesisSourceDataReady ? (
                      <DentalAnamnesisRecord
                        order={order}
                        intakeForm={intakeForm}
                        onboardingForm={onboardingForm}
                        draft={draft}
                        onDownloadAnamnesisPdf={handleDownloadAnamnesisPdf}
                      />
                    ) : (
                      <S.Banner role="alert">
                        Dados da anamnese ainda não disponíveis. A ordem pode estar processando os dados no backend;
                        aguarde alguns instantes e atualize a página para carregar a ficha clínica completa.
                      </S.Banner>
                    )}

                    {isAnamnesisRecordDeepLink && !dentistReviewCompleted ? (
                      <S.Banner role="alert">
                        Antes de continuar para a solicitação de produção, complete a revisão clínica do dentista.
                        {dentistPendingRequiredFields.length > 0 ? (
                          <>
                            {' '}Campos pendentes: {dentistPendingRequiredFields.join('; ')}.
                          </>
                        ) : null}
                      </S.Banner>
                    ) : null}

                    {shouldHoldAtAnamnesisSummary ? (
                      <JourneyNoticeCard
                        tone="warning"
                        icon={<AlertTriangle size={18} />}
                        title={anamnesisHoldNotice.title}
                        ariaLabel={anamnesisHoldNotice.label}
                        description={anamnesisHoldNotice.description}
                        background="rgba(255, 251, 235, 0.72)"
                      />
                    ) : null}
                  </>
                ) : null}

                {currentStep === 2 ? (
                  <ProductionRequestFields
                    draft={draft}
                    dentistRecommendedPurchaseConfiguration={order?.dentistRecommendedPurchaseConfiguration ?? null}
                    onUploadStateChange={setProductionAttachmentUploading}
                    onScan3dFileChange={setSelectedProductionScanFile}
                    onChange={updateDraft}
                  />
                ) : null}
                {isAnamnesisRecordDeepLink ? (
                  <S.DeepLinkStepActions>
                    <span />
                    <S.SecondaryActions>
                      {!dentistReviewCompleted ? (
                        <AdminFormButton
                          type="button"
                          onClick={handleOpenDentistReview}
                        >
                          Completar revisão clínica
                        </AdminFormButton>
                      ) : (
                        <AdminFormButton
                          type="button"
                          onClick={handleAnamnesisDeepLinkNext}
                        >
                          Continuar para solicitação de produção
                        </AdminFormButton>
                      )}
                    </S.SecondaryActions>
                  </S.DeepLinkStepActions>
                ) : currentStep === 0 && !dentistReviewCompleted ? null : (
                  <S.StepActions>
                    <S.SecondaryActions>
                      <AdminFormButton
                        type="button"
                        variant="secondary"
                        disabled={currentStep === 0}
                        onClick={() => setCurrentStep((current) => Math.max(0, current - 1))}
                        leadingIcon={<ArrowLeft size={16} aria-hidden="true" />}
                      >
                        Voltar
                      </AdminFormButton>
                    </S.SecondaryActions>

                    <S.SecondaryActions>
                      {shouldHoldAtAnamnesisSummary ? (
                        <AdminFormButton type="button" disabled>
                          {anamnesisHoldNotice.actionLabel}
                        </AdminFormButton>
                      ) : currentStep < STEP_DEFINITIONS.length - 1 ? (
                        <AdminFormButton
                          type="button"
                          disabled={!currentStepCompleted}
                          onClick={handleNextStep}
                        >
                          Próximo
                        </AdminFormButton>
                      ) : (
                        <AdminFormButton
                          type="button"
                          disabled={!canComplete || completing}
                          onClick={() => void handleComplete()}
                        >
                          {completing ? 'Finalizando...' : 'Finalizar'}
                        </AdminFormButton>
                      )}
                    </S.SecondaryActions>
                  </S.StepActions>
                )}
              </S.FormPanel>
            </S.WizardContent>
          </S.WizardShell>
        </S.ProductionCard>
      ) : null}
    </PageStack>
  );
}
