import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Star } from 'lucide-react';
import {
   Button,
  CheckboxField,
  Field,
  Snackbar,
  SnackbarStack,
  StatusIndicator,
  UploadField,
  type UploadFieldFile,
} from '@nexor/design-system';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { divIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { SkeletonCard, SkeletonGrid } from '../../../components/Skeleton';
import { useAuth } from '../../../hooks/useAuth';
import {
  completeProductionRequest,
  fetchOrders,
  fetchWorkflowForms,
  getAuthToken,
  type DemoWorkflowForm,
  type DemoLicensedLabSelection,
  type DemoOrderSummary,
  type ProductionRequestDraft,
} from '../../../features/demo/biteplanerFlow';
import { getLicensedLab, listLicensedLabsByCep } from '../../../features/demo/labLocations';
import {
   FieldsGrid,
  FormSection,
  PageStack,
} from '../admin/styles';
import { OrderStepHeader } from '../components/OrderStepHeader';
import { WorkflowFormsPanel } from '../components/WorkflowFormsPanel';
import { DentalAnamnesisRecord } from './DentalAnamnesisRecord';
import * as S from './styles';

type FieldChangeEvent = ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;
type FinalAnamnesisPdfWorkerResponse =
  | {
      status: 'success';
      arrayBuffer: ArrayBuffer;
    }
  | {
      status: 'error';
      message?: string;
    };

































const markerIcon = divIcon({
  className: 'licensed-lab-map-pin',
  html: `
    <div style="
      width: 18px;
      height: 18px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      background: #171717;
      border: 2px solid #fafafa;
      box-shadow: 0 6px 16px rgba(23, 23, 23, 0.18);
    "></div>
  `,
  iconSize: [18, 18],
  iconAnchor: [9, 18],
  popupAnchor: [0, -16],
});

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
    description: 'Preencha a solicitação clínica, observações e anexos obrigatórios para o laboratório.',
    shortLabel: 'Formulário produtivo',
  },
  {
    key: 'lab-selection',
    label: 'Escolha do laboratório',
    description: 'Selecione um laboratório licenciado para encaminhar a ordem com todos os dados.',
    shortLabel: 'Destino licenciado',
  },
] as const;

const EMPTY_DRAFT: ProductionRequestDraft = {
  anamnesisSummary: '',
  anamnesisDownloaded: false,
  productionRequestSummary: '',
  labNotes: '',
  scan3dFileName: '',
  prescriptionFileName: '',
  lgpdConfirmed: false,
  selectedLabId: null,
};

function fileListFromName(fileName: string): UploadFieldFile[] {
  if (!fileName.trim()) {
    return [];
  }

  return [
    {
      id: fileName,
      name: fileName,
      status: 'uploaded',
    },
  ];
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

function RatingStars({ score, label }: { score: number; label: string }) {
  const roundedScore = Math.round(score);

  return (
    <S.RatingBadge aria-label={`${score.toFixed(1)} de 5 ${label}`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          size={14}
          fill={index < roundedScore ? 'currentColor' : 'none'}
          aria-hidden
        />
      ))}
    </S.RatingBadge>
  );
}

export function ProducaoDentista() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { session, backendUser } = useAuth();
  const token = getAuthToken(session);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [pdfNotice, setPdfNotice] = useState('');
  const [pdfError, setPdfError] = useState('');
  const [order, setOrder] = useState<DemoOrderSummary | null>(null);
  const [workflowForms, setWorkflowForms] = useState<DemoWorkflowForm[]>([]);
  const [formsError, setFormsError] = useState('');
  const [draft, setDraft] = useState<ProductionRequestDraft>(EMPTY_DRAFT);
  const [currentStep, setCurrentStep] = useState(0);
  const [labCep, setLabCep] = useState('01310-100');
  const [visibleLabs, setVisibleLabs] = useState<DemoLicensedLabSelection[]>(() => listLicensedLabsByCep('01310-100'));
  const [selectedLab, setSelectedLab] = useState<DemoLicensedLabSelection | null>(null);

  useEffect(() => {
    if (!token || !orderId) {
      return;
    }

    let active = true;

    async function loadOrder() {
      setLoading(true);
      setError('');

      try {
        const response = await fetchOrders('dentist', token);
        const nextOrder = response.orders.find((item) => item.id === orderId) ?? null;

        if (!active) {
          return;
        }

        if (!nextOrder) {
          setError('Não foi possível localizar essa ordem na fila do dentista.');
          setOrder(null);
          return;
        }

        setOrder(nextOrder);
        const nextDraft = nextOrder.productionRequestDraft ?? EMPTY_DRAFT;
        setDraft(nextDraft);

        try {
          const formsResponse = await fetchWorkflowForms(nextOrder.id, token);
          if (active) {
            setWorkflowForms(formsResponse.forms);
            setFormsError('');
          }
        } catch {
          if (active) {
            setFormsError('Não foi possível carregar o intake compartilhado desta ordem.');
          }
        }

        if (nextDraft.selectedLabId) {
          const lab = getLicensedLab(nextDraft.selectedLabId);
          if (lab) {
            setSelectedLab(lab);
          }
        }
      } catch {
        if (active) {
          setError('Não foi possível carregar a solicitação de produção da demo.');
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
  }, [orderId, token]);

  const selectedLabId = draft.selectedLabId;
  const intakeForm = workflowForms.find((form) => form.templateKey === 'customer_pre_consultation_intake');
  const dentistReviewCompleted = hasDentistComplement(intakeForm);
  const anamnesisCompleted = dentistReviewCompleted && draft.anamnesisSummary.trim().length > 0;
  const productionRequestCompleted = draft.productionRequestSummary.trim().length > 0;
  const attachmentsCompleted =
    draft.scan3dFileName.trim().length > 0 &&
    draft.prescriptionFileName.trim().length > 0 &&
    draft.lgpdConfirmed;
  const labSelectionCompleted = Boolean(selectedLabId);
  const finalReviewCompleted = labSelectionCompleted && draft.anamnesisDownloaded;
  const canComplete =
    anamnesisCompleted &&
    productionRequestCompleted &&
    attachmentsCompleted &&
    labSelectionCompleted;

  const stepCompletion = [
    dentistReviewCompleted,
    anamnesisCompleted,
    productionRequestCompleted && attachmentsCompleted,
    finalReviewCompleted,
  ];
  const currentStepData = STEP_DEFINITIONS[currentStep];
  const currentStepCompleted = stepCompletion[currentStep] ?? false;
  const dentistSystemValues = useMemo(
    () => getDentistSystemValues(backendUser, session?.user.email),
    [backendUser, session?.user.email]
  );

  const mapCenter = useMemo<[number, number]>(() => {
    if (selectedLab) {
      return [selectedLab.coordinates.lat, selectedLab.coordinates.lng];
    }

    const fallback = visibleLabs[0];
    return fallback ? [fallback.coordinates.lat, fallback.coordinates.lng] : [-23.5618, -46.6565];
  }, [selectedLab, visibleLabs]);

  function updateDraft(patch: Partial<ProductionRequestDraft>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  function handleWorkflowFormsChange(nextForms: DemoWorkflowForm[]) {
    setWorkflowForms(nextForms);

    const nextIntakeForm = nextForms.find((form) => form.templateKey === 'customer_pre_consultation_intake');
    const nextDentistReviewCompleted = hasDentistComplement(nextIntakeForm);

    if (!nextDentistReviewCompleted) {
      return;
    }

    setCurrentStep((current) => (current === 0 ? 1 : current));
  }

  function handleSearchLabs() {
    const nextLabs = listLicensedLabsByCep(labCep);
    setVisibleLabs(nextLabs);
  }

  async function handleComplete() {
    if (!token || !orderId || !canComplete) {
      return;
    }

    setCompleting(true);
    setNotice('');
    setError('');
    setPdfError('');

    try {
      const finalizedDraft = { ...draft, anamnesisDownloaded: true };
      if (!draft.anamnesisDownloaded) {
        startFinalAnamnesisPdfGeneration(finalizedDraft);
      }
      updateDraft({ anamnesisDownloaded: true });
      await completeProductionRequest(orderId, finalizedDraft, token);
      navigate('/painel/biteplaner?mode=dentist', {
        replace: true,
        state: {
          notice:
            `Solicitação de produção da ordem ${orderId} concluída e enviada ao laboratório. ` +
            'É sua responsabilidade manter este registro, não mantemos estes dados em nosso banco de dados.',
        },
      });
    } catch {
      setError('Não foi possível concluir o envio ao laboratório.');
    } finally {
      setCompleting(false);
    }
  }

  function downloadFinalAnamnesisBlob(arrayBuffer: ArrayBuffer, fileOrderId: string) {
    const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = `${fileOrderId.toLowerCase()}-anamnese-final.pdf`;
    link.click();
    URL.revokeObjectURL(objectUrl);
  }

  function startFinalAnamnesisPdfGeneration(nextDraft: ProductionRequestDraft) {
    if (!order) {
      return;
    }

    setPdfNotice('PDF sendo gerado em segundo plano. Você pode continuar usando a página.');
    setPdfError('');

    const currentOrder = order;
    const currentIntakeForm = intakeForm;
    let worker: Worker;

    try {
      worker = new Worker(new URL('./finalAnamnesisPdf.worker.ts', import.meta.url), { type: 'module' });
    } catch {
      setPdfError('Não foi possível iniciar a geração do PDF final da anamnese.');
      return;
    }

    worker.onmessage = (event: MessageEvent<FinalAnamnesisPdfWorkerResponse>) => {
      worker.terminate();

      if (event.data.status === 'success') {
        downloadFinalAnamnesisBlob(event.data.arrayBuffer, currentOrder.id);
        setPdfNotice('PDF gerado e baixado.');
        return;
      }

      setPdfError(event.data.message ?? 'Não foi possível gerar o PDF final da anamnese.');
    };

    worker.onerror = () => {
      worker.terminate();
      setPdfError('Não foi possível gerar o PDF final da anamnese.');
    };

    try {
      worker.postMessage({
        order: currentOrder,
        intakeForm: currentIntakeForm,
        draft: nextDraft,
      });
    } catch {
      worker.terminate();
      setPdfError('Não foi possível iniciar a geração do PDF final da anamnese.');
    }
  }

  function handleNextStep() {
    if (currentStep === 1) {
      const nextDraft = { ...draft, anamnesisDownloaded: true };
      startFinalAnamnesisPdfGeneration(nextDraft);
      updateDraft({ anamnesisDownloaded: true });
    }

    setCurrentStep((current) => Math.min(STEP_DEFINITIONS.length - 1, current + 1));
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
      <OrderStepHeader
        title="Solicitação de produção"
        description="Fluxo dedicado para o dentista preencher a documentação obrigatória, anexar os arquivos clínicos e selecionar o laboratório licenciado."
        currentStep="laboratory"
        order={order}
        orderHelpText="Este pedido está com o dentista para completar a solicitação produtiva e liberar o envio ao laboratório."
      />

      {loading ? (
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
                setError('');
              }}
            />
          ) : null}
        </SnackbarStack>
      ) : null}

      {order ? (
        <>
          <S.WizardShell>
            <S.WizardSidebar data-testid="dentist-production-steps">
              <S.StepList>
                {STEP_DEFINITIONS.map((step, index) => {
                  const completed = stepCompletion[index];
                  const active = currentStep === index;
                  const disabled = index > currentStep && !stepCompletion[index - 1];

                  return (
                    <li key={step.key}>
                      <S.StepCard
                        type="button"
                        $active={active}
                        $completed={completed}
                        $disabled={disabled}
                        onClick={() => {
                          if (!disabled) {
                            setCurrentStep(index);
                          }
                        }}
                      >
                        <S.StepBadge $active={active} $completed={completed} $disabled={disabled}>
                          {index + 1}
                        </S.StepBadge>
                        <S.StepTop>
                          <S.StepMeta $active={active} $completed={completed} $disabled={disabled}>
                            {active ? 'Em preenchimento' : disabled ? 'Bloqueado' : step.shortLabel}
                          </S.StepMeta>
                          <S.StepStatusRow>
                            <S.StepTitle>{step.label}</S.StepTitle>
                          </S.StepStatusRow>
                        </S.StepTop>
                        <S.StepText>{step.description}</S.StepText>
                      </S.StepCard>
                    </li>
                  );
                })}
              </S.StepList>
            </S.WizardSidebar>

            <S.WizardContent>
              <S.StepContentHeader>
                <S.StepStatusRow>
                  <S.StepContentTitle>{currentStepData.label}</S.StepContentTitle>
                </S.StepStatusRow>
                <S.StepContentDescription>{currentStepData.description}</S.StepContentDescription>
              </S.StepContentHeader>

              <FormSection padding="lg">
                {currentStep === 0 ? (
                  <>
                    <WorkflowFormsPanel
                      orderId={order.id}
                      token={token}
                      templateFilter={['customer_pre_consultation_intake']}
                      forms={workflowForms}
                      onFormsChange={handleWorkflowFormsChange}
                      variant="embedded"
                      actorRole="dentist"
                      defaultValues={dentistSystemValues}
                      showFormHeaderStatus={false}
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
                    <DentalAnamnesisRecord
                      order={order}
                      intakeForm={intakeForm}
                      draft={draft}
                      onSummaryChange={(value) => updateDraft({ anamnesisSummary: value })}
                    />

                    {draft.anamnesisDownloaded ? (
                      <S.ActionsRow>
                        <StatusIndicator color="#15803D" label="Anamnese baixada" />
                      </S.ActionsRow>
                    ) : null}
                  </>
                ) : null}

                {currentStep === 2 ? (
                  <>
                  <FieldsGrid>
                    <Field
                      as="textarea"
                      label="Solicitação de produção"
                      maxLength={1200}
                      placeholder="Descreva a prescrição, parâmetros clínicos estritamente necessários e direcionamento da produção."
                      value={draft.productionRequestSummary}
                      onChange={(event: FieldChangeEvent) => updateDraft({ productionRequestSummary: event.target.value })}
                    />
                    <Field
                      as="textarea"
                      label="Observações para o laboratório"
                      maxLength={500}
                      placeholder="Inclua somente orientações técnicas necessárias ao laboratório. Evite dados clínicos não essenciais."
                      value={draft.labNotes}
                      onChange={(event: FieldChangeEvent) => updateDraft({ labNotes: event.target.value })}
                    />
                  </FieldsGrid>

                    <S.AttachmentGrid>
                      <UploadField
                        label="Escaneamento 3D intraoral"
                        accept=".stl,.obj,.ply,.zip"
                        hint="Obrigatório anexar 1 arquivo de escaneamento 3D intraoral."
                        files={fileListFromName(draft.scan3dFileName)}
                        onFilesChange={(files) => updateDraft({ scan3dFileName: files[0]?.name ?? '' })}
                        onRemoveFile={() => updateDraft({ scan3dFileName: '' })}
                      />

                      <UploadField
                        label="Prescrição médica assinada e carimbada"
                        accept=".pdf,.png,.jpg,.jpeg"
                        hint="Obrigatório anexar 1 arquivo de prescrição médica do dentista para o Biteplaner."
                        files={fileListFromName(draft.prescriptionFileName)}
                        onFilesChange={(files) => updateDraft({ prescriptionFileName: files[0]?.name ?? '' })}
                        onRemoveFile={() => updateDraft({ prescriptionFileName: '' })}
                      />
                    </S.AttachmentGrid>

                    <CheckboxField
                      checked={draft.lgpdConfirmed}
                      onChange={(checked) => updateDraft({ lgpdConfirmed: checked })}
                      label={
                        <S.RetentionConsentLabel data-testid="dentist-retention-consent-label">
                          Estou ciente de que a plataforma reterá estes dados apenas pelo{' '}
                          <strong>tempo necessário para entrega, rastreabilidade e auditoria</strong>, que a{' '}
                          <strong>guarda principal do registro clínico</strong> permanece sob minha responsabilidade e
                          que o laboratório deve receber apenas{' '}
                          <strong>dados operacionais indispensaveis</strong> para fabricacao.
                        </S.RetentionConsentLabel>
                      }
                    />
                  </>
                ) : null}

                {currentStep === 3 ? (
                  <>
                    <FieldsGrid>
                      <Field
                        as="input"
                        label="CEP do laboratório"
                        value={labCep}
                        onChange={(event: FieldChangeEvent) => setLabCep(event.target.value)}
                      />
                      <S.SearchActionSlot>
                        <Button type="button" onClick={handleSearchLabs}>
                          Buscar laboratórios
                        </Button>
                      </S.SearchActionSlot>
                    </FieldsGrid>

                    <S.LabLayout>
                      <S.MapViewport>
                        <MapContainer center={mapCenter} zoom={13} scrollWheelZoom={false}>
                          <TileLayer
                            attribution="&copy; OpenStreetMap contributors"
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          />
                          {visibleLabs.map((lab) => (
                            <Marker
                              key={lab.id}
                              position={[lab.coordinates.lat, lab.coordinates.lng]}
                              icon={markerIcon}
                              eventHandlers={{
                                click: () => {
                                  setSelectedLab(lab);
                                  updateDraft({ selectedLabId: lab.id });
                                },
                              }}
                            >
                              <Popup>{lab.name}</Popup>
                            </Marker>
                          ))}
                        </MapContainer>
                      </S.MapViewport>

                      <S.LabList>
                        {visibleLabs.map((lab) => (
                          <S.LabButton
                            key={lab.id}
                            type="button"
                            $active={draft.selectedLabId === lab.id}
                            onClick={() => {
                              setSelectedLab(lab);
                              updateDraft({ selectedLabId: lab.id });
                            }}
                          >
                            <S.LabName>{lab.name}</S.LabName>
                            <S.LabMeta>{lab.address}</S.LabMeta>
                            <S.LabFooter>
                              <S.LabMeta>{lab.phone} - {lab.distanceKm.toFixed(1)} km</S.LabMeta>
                              <RatingStars score={lab.reviewScore} label="avaliações do laboratório" />
                            </S.LabFooter>
                          </S.LabButton>
                        ))}
                      </S.LabList>
                    </S.LabLayout>

                    {draft.anamnesisDownloaded ? (
                      <S.ActionsRow>
                        <StatusIndicator color="#15803D" label="Anamnese baixada" />
                      </S.ActionsRow>
                    ) : null}

                    {selectedLab ? (
                      <S.Banner>Laboratório selecionado: {selectedLab.name}</S.Banner>
                    ) : (
                      <S.EmptyState>Selecione um laboratório licenciado para concluir o envio da ordem.</S.EmptyState>
                    )}
                  </>
                ) : null}

                {currentStep === 0 && !dentistReviewCompleted ? null : (
                <S.StepActions>
                  <S.SecondaryActions>
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={currentStep === 0}
                      onClick={() => setCurrentStep((current) => Math.max(0, current - 1))}
                    >
                      Voltar
                    </Button>
                  </S.SecondaryActions>

                  <S.SecondaryActions>
                    {currentStep < STEP_DEFINITIONS.length - 1 ? (
                      <Button
                        type="button"
                        disabled={!currentStepCompleted}
                        onClick={handleNextStep}
                      >
                        Próximo
                      </Button>
                    ) : null}
                    <Button type="button" disabled={!canComplete || completing} onClick={() => void handleComplete()}>
                      {completing ? 'Finalizando...' : 'Finalizar'}
                    </Button>
                  </S.SecondaryActions>
                </S.StepActions>
                )}
              </FormSection>
            </S.WizardContent>
          </S.WizardShell>
        </>
      ) : null}
    </PageStack>
  );
}
