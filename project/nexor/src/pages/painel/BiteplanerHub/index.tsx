import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  Check,
  ChevronRight,
  Clock3,
  Copy,
  Download,
  ExternalLink,
  Eye,
  FileText,
  Flag,
  Mail,
  MessageCircle,
  PartyPopper,
  Stethoscope,
  X,
  XCircle
} from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { SkeletonPage } from '../../../components/Skeleton';
import {
  DataTable,
  Field,
  Snackbar,
  SnackbarStack,
  StatusIndicator,
  Tab,
  TabList,
  Tabs,
  Chip,
  type DataTableColumn,
} from '@nexor/design-system';
import { useAuth } from '../../../hooks/useAuth';
import * as S from './styles';
import {
  acceptInitialConsultation,
  completeLabProduction,
  confirmProductReceived,
  confirmDentistLicensingPayment,
  confirmLabLicensingPayment,
  confirmAppointmentByDentist,
  confirmAppointmentByUser,
  createPartnerInviteLink,
  fetchAccessOptions,
  fetchAppointments,
  fetchDentistLicensing,
  fetchLabLicensing,
  fetchOrders,
  fetchPartnerOverview,
  fetchTimeline,
  formatDate,
  getAthleteNextPath,
  getAthletePrimaryOrder,
  getAuthToken,
  getOrderStatusPresentation,
  getStageLabel,
  PERSONA_MODE,
  registerClinicalDecision,
  returnToDentist,
  startLabProduction,
  signDentistLicensingContract,
  signLabLicensingContract,
  submitDentistLicensingTest,
  submitLabLicensingTest,
  updateDentistLicensingCourseProgress,
  updateLabLicensingCourseProgress,
  type AccessMode,
  type AccessOption,
  type DentistLicensingResponse,
  type DentistLicensingWorkflow,
  type DemoAppointment,
  type DemoOrderSummary,
  type DemoTimelineEvent,
  type PartnerOverviewResponse,
} from '../../../features/demo/biteplanerFlow';





















































const MODE_COPY: Record<AccessMode, { title: string; description: string }> = {
  user: {
    title: 'Workspace do atleta',
    description: 'Acompanhe sua jornada Biteplaner, o status atual e o próximo passo visível da demo.'
  },
  partner: {
    title: 'Workspace do parceiro',
    description: 'Vejá links, leads e como cada indicado avançou no mesmo funil operacional.'
  },
  dentist: {
    title: 'Painel do dentista',
    description: 'Gerencie consulta, decisão clínica e liberação produtiva sobre os pedidos mockados.'
  },
  lab: {
    title: 'Workspace do laboratório',
    description: 'Receba pedidos, devolva ajustes e conclua a etapa produtiva da demo compartilhada.'
  },
  admin: {
    title: 'Workspace admin',
    description: 'Use o painel administrativo para ver o pipeline transversal completo.'
  }
};

type PartnerDashboardPeriod = 'week' | 'month' | 'year' | 'all';

const PARTNER_DASHBOARD_PERIODS: Array<{ key: PartnerDashboardPeriod; label: string }> = [
  { key: 'week', label: 'Semana' },
  { key: 'month', label: 'Mês' },
  { key: 'year', label: 'Ano' },
  { key: 'all', label: 'Tudo' },
];

function getValidDate(value?: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isWithinPartnerDashboardPeriod(
  value: string | null | undefined,
  period: PartnerDashboardPeriod,
  referenceDate: Date
) {
  if (period === 'all') {
    return true;
  }

  const date = getValidDate(value);
  if (!date) {
    return false;
  }

  if (period === 'week') {
    const start = new Date(referenceDate);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - 6);
    const end = new Date(referenceDate);
    end.setHours(23, 59, 59, 999);
    return date >= start && date <= end;
  }

  if (period === 'month') {
    return date.getFullYear() === referenceDate.getFullYear() && date.getMonth() === referenceDate.getMonth();
  }

  return date.getFullYear() === referenceDate.getFullYear();
}

function getStatusTone(status: string): 'success' | 'warning' | 'neutral' {
  if (status === 'follow_up') {
    return 'success';
  }

  if (
    status === 'registration_started' ||
    status === 'awaiting_payment' ||
    status === 'awaiting_dentist_forms' ||
    status === 'awaiting_scheduling' ||
    status === 'awaiting_adaptation'
  ) {
    return 'warning';
  }

  if (status === 'lab_processing' || status === 'in_progress') {
    return 'warning';
  }

  return 'neutral';
}

function getLeadAccountPresentation(funnelStage: PartnerOverviewResponse['leads'][number]['funnelStage']) {
  return funnelStage === 'lead_captured'
    ? { color: '#737373', label: 'Ainda não' }
    : { color: '#15803D', label: 'Virou conta' };
}

function getLeadOrderPresentation(funnelStage: PartnerOverviewResponse['leads'][number]['funnelStage']) {
  return funnelStage === 'order_advanced' || funnelStage === 'pre_requisite_completed'
    ? { color: '#2563EB', label: 'Virou pedido' }
    : { color: '#737373', label: 'Ainda não' };
}

function getDentistLicensingStatusLabel(status?: string | null) {
  if (status === 'licensed') {
    return 'Licenciado';
  }

  if (status === 'approved_pending_payment') {
    return 'Aguardando pagamento';
  }

  if (status === 'admin_rejected' || status === 'distrato_signed') {
    return 'Encerrado';
  }

  if (status) {
    return 'Processó de licenciamento';
  }

  return 'Sem processo de licenciamento';
}

function getLicenseeNoun(mode: AccessMode | null) {
  return mode === 'lab' ? 'laboratório' : 'dentista';
}

function getLicenseePlural(mode: AccessMode | null) {
  return mode === 'lab' ? 'laboratórios' : 'dentistas';
}

function getDentistLicensingStatusTone(status?: string | null): 'success' | 'warning' | 'neutral' {
  if (status === 'licensed') {
    return 'success';
  }

  if (status) {
    return 'warning';
  }

  return 'neutral';
}

function buildCertificateHref(workflow: DentistLicensingWorkflow | null) {
  const issuedAt = workflow?.certificateIssuedAt ? formatDate(workflow.certificateIssuedAt) : 'data não informada';
  return `data:text/plain;charset=utf-8,${encodeURIComponent(`Certificado Biteplaner\nStatus: Licenciado\nEmitido em: ${issuedAt}`)}`;
}

function getCourseStudyText(contentId: string, mode: AccessMode | null = 'dentist') {
  if (mode === 'lab') {
    const labStudyTexts: Record<string, string> = {
      fundamentos:
        'Neste modulo, o laboratório revisa os fundamentos operacionais do Biteplaner: leitura da solicitação recebida, limites de produção, critérios de rastreabilidade e responsabilidades antes de iniciar qualquer etapa produtiva. O objetivo e padronizar o recebimento das ordens e reduzir retrabalho entre dentista, laboratório e Nexor.',
      operacao:
        'Este modulo organiza o fluxo de produção e documentação mínima. O laboratório deve confirmar recebimento, registrar início da produção, sinalizar ajustes quando necessário, manter identificação da ordem e respeitar o escopo de dados compartilhados pela plataforma. O checklist garante que cada produção tenha materiais, prazos e comunicações registrados.',
      qualidade:
        'Este modulo apresenta controle de qualidade, rastreabilidade e boas práticas laboratoriais. Antes de concluir a produção, o laboratório deve revisar integridade, acabamento, compatibilidade com a solicitação e registro do ciclo. Quando houver divergencia, a devolucao para ajuste deve ser objetiva, auditavel e limitada ao que for necessário para a resolucao.'
    };

    return labStudyTexts[contentId] ??
      'Material de estudo do licenciamento laboratorial Biteplaner com orientações de produção, rastreabilidade e qualidade para padronizar a atuação no MVP.';
  }

  const studyTexts: Record<string, string> = {
    fundamentos:
      'Neste modulo, o dentista revisa os fundamentos clínicos do Biteplaner: indicacoes para atletas, critérios de elegibilidade odontológica, limites do dispositivo, sinais de alerta e responsabilidade profissional durante a avaliação. O objetivo e padronizar a leitura inicial do caso antes de qualquer decisão de produção. O protocolo recomenda registrar histórico relevante, hábitos orais, queixas de dor, modalidade esportiva e expectativa de uso. Tambem reforca que o Biteplaner não substitui tratamento odontológico necessário, nem deve ser indicado quando houver impedimento clínico ativo sem acompanhamento.',
    operacao:
      'Este modulo organiza o fluxo operacional e a documentação mínima para que a ordem avance com rastreabilidade. O dentista deve confirmar atendimento, revisar a avaliação inicial, registrar decisão clínica, preparar a solicitação de produção e anexar arquivos obrigatórios quando aplicável. O checklist orienta o uso de dados essenciais, evita textos livres desnecessários e reforca a separação entre histórico clínico sob guarda profissional e dados operacionais usados pela plataforma. A qualidade do registro reduz retrabalho com laboratório e melhora a experiência do atleta.',
    qualidade:
      'Este modulo apresenta boas práticas de acompanhamento, controle de qualidade e comunicação com o atleta. O dentista deve orientar adaptação, higiene, sinais de desconforto e necessidade de retorno. A cada acompanhamento, recomenda-se registrar aderência, ajustes realizados, integridade do dispositivo e percepção do usuário. O foco é manter um padrão replicavel entre profissionais licenciados, com conduta clara quando houver dor, quebra, perda de encaixe ou suspeita de que o produto deixou de ser adequado ao caso.'
  };

  return studyTexts[contentId] ??
    'Material de estudo do licenciamento Biteplaner com orientações operacionais, critérios de qualidade e pontos de atenção para padronizar a atuação do dentista no MVP.';
}

function buildCoursePdfHref(title: string, contentId: string, mode: AccessMode | null = 'dentist') {
  const body = `Biteplaner - Material PDF\n\n${title}\n\n${getCourseStudyText(contentId, mode)}`;
  return `data:application/pdf;charset=utf-8,${encodeURIComponent(body)}`;
}

type AppointmentMap = Record<string, DemoAppointment[]>;
type TimelineMap = Record<string, DemoTimelineEvent[]>;

type QueueActionConfig = {
  id: string;
  title: string;
  ariaLabel: string;
  testId: string;
  icon: ReactNode;
  confirmTitle: string;
  confirmDescription: string;
  actionKey: string;
  successMessage: string;
  execute: () => Promise<unknown>;
};

function buildPartnerInviteLink(token: string) {
  if (typeof window === 'undefined') {
    return `https://nexor.local/cadastro?invite=${encodeURIComponent(token)}`;
  }

  return new URL(`/cadastro?invite=${encodeURIComponent(token)}`, window.location.origin).toString();
}

function buildProductionAttachmentHref(fileName: string) {
  return `data:application/octet-stream;charset=utf-8,${encodeURIComponent(`Arquivo demo do Biteplaner: ${fileName}`)}#${encodeURIComponent(fileName)}`;
}

function createQrMatrix(value: string) {
  const size = 21;
  const seed = Array.from(value).reduce((acc, char, index) => acc + char.charCodeAt(0) * (index + 1), 0);
  const matrix = Array.from({ length: size }, () => Array.from({ length: size }, () => false));

  function drawFinder(startRow: number, startColumn: number) {
    for (let row = 0; row < 7; row += 1) {
      for (let column = 0; column < 7; column += 1) {
        const absoluteRow = startRow + row;
        const absoluteColumn = startColumn + column;
        const isBorder = row === 0 || row === 6 || column === 0 || column === 6;
        const isCore = row >= 2 && row <= 4 && column >= 2 && column <= 4;
        matrix[absoluteRow][absoluteColumn] = isBorder || isCore;
      }
    }
  }

  drawFinder(0, 0);
  drawFinder(0, size - 7);
  drawFinder(size - 7, 0);

  for (let row = 0; row < size; row += 1) {
    for (let column = 0; column < size; column += 1) {
      const insideFinder =
        (row < 7 && column < 7) ||
        (row < 7 && column >= size - 7) ||
        (row >= size - 7 && column < 7);

      if (insideFinder) {
        continue;
      }

      const valueSeed = seed + row * 17 + column * 31 + row * column * 7;
      matrix[row][column] = valueSeed % 5 < 2;
    }
  }

  return matrix;
}

function DemoQrCode({ value }: { value: string }) {
  const matrix = useMemo(() => createQrMatrix(value), [value]);
  const moduleSize = 8;
  const quietZone = 12;
  const size = matrix.length * moduleSize + quietZone * 2;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label="QR code do link" role="img">
      <rect width={size} height={size} rx="16" fill="#FFFFFF" />
      {matrix.flatMap((row, rowIndex) =>
        row.map((filled, columnIndex) =>
          filled ? (
            <rect
              key={`${rowIndex}-${columnIndex}`}
              x={quietZone + columnIndex * moduleSize}
              y={quietZone + rowIndex * moduleSize}
              width={moduleSize}
              height={moduleSize}
              fill="#171717"
            />
          ) : null
        )
      )}
    </svg>
  );
}

export function BiteplanerHub() {
  const { session, demoPersona, backendUser } = useAuth();
  const token = getAuthToken(session);
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [access, setAccess] = useState<{ defaultMode: AccessMode; modes: AccessOption[] } | null>(null);
  const [orders, setOrders] = useState<DemoOrderSummary[]>([]);
  const [partnerOverview, setPartnerOverview] = useState<PartnerOverviewResponse | null>(null);
  const [appointments, setAppointments] = useState<AppointmentMap>({});
  const [timeline, setTimeline] = useState<TimelineMap>({});
  const [activeAction, setActiveAction] = useState('');
  const [qualifiedCustomerName, setQualifiedCustomerName] = useState('');
  const [qualifiedCustomerEmail, setQualifiedCustomerEmail] = useState('');
  const [selectedInviteLink, setSelectedInviteLink] = useState<PartnerOverviewResponse['inviteLinks'][number] | null>(null);
  const [selectedTimelineOrderId, setSelectedTimelineOrderId] = useState<string | null>(null);
  const [dentistStatusFilters, setDentistStatusFilters] = useState<string[]>([]);
  const [labStatusFilters, setLabStatusFilters] = useState<string[]>([]);
  const [pendingOrderAction, setPendingOrderAction] = useState<QueueActionConfig | null>(null);
  const [pendingOrderReason, setPendingOrderReason] = useState('');
  const [selectedDocumentationOrderId, setSelectedDocumentationOrderId] = useState<string | null>(null);
  const [dentistLicensing, setDentistLicensing] = useState<DentistLicensingResponse | null>(null);
  const [dentistLicensingLoading, setDentistLicensingLoading] = useState(false);
  const [showLicensingApprovalModal, setShowLicensingApprovalModal] = useState(false);
  const [selectedCourseContentId, setSelectedCourseContentId] = useState<string | null>(null);
  const [licensingContractRead, setLicensingContractRead] = useState(false);
  const [partnerDashboardPeriod, setPartnerDashboardPeriod] = useState<PartnerDashboardPeriod>('month');
  const isLicensingRoute = location.pathname.endsWith('/licenciamento');

  const requestedMode = searchParams.get('mode');
  const fallbackMode = demoPersona ? PERSONA_MODE[demoPersona] : null;
  const selectedMode = useMemo<AccessMode | null>(() => {
    if (requestedMode === 'user' || requestedMode === 'partner' || requestedMode === 'dentist' || requestedMode === 'lab' || requestedMode === 'admin') {
      return requestedMode;
    }

    if (access) {
      return access.defaultMode;
    }

    return fallbackMode;
  }, [access, fallbackMode, requestedMode]);

  useEffect(() => {
    const locationState = location.state as { notice?: string } | null;

    if (!locationState?.notice) {
      return;
    }

    setNotice(locationState.notice);
    navigate(`${location.pathname}${location.search}`, { replace: true, state: null });
  }, [location.pathname, location.search, location.state, navigate]);

  useEffect(() => {
    if (!token) {
      return;
    }

    let active = true;

    async function loadAccess() {
      try {
        const response = await fetchAccessOptions(token);

        if (!active) {
          return;
        }

        setAccess(response);

        if (!requestedMode) {
          setSearchParams({ mode: response.defaultMode });
        }
      } catch {
        if (active) {
          setError('Não foi possível carregar os modos do Biteplaner agora.');
        }
      }
    }

    void loadAccess();

    return () => {
      active = false;
    };
  }, [requestedMode, setSearchParams, token]);

  useEffect(() => {
    if (!token || !selectedMode || selectedMode === 'admin') {
      if (selectedMode === 'admin') {
        setOrders([]);
      }
      return;
    }

    let active = true;
    const activeMode = selectedMode;

    async function loadWorkspace() {
      setLoading(true);
      setError('');

      try {
        const ordersResponse = await fetchOrders(activeMode, token);

        if (!active) {
          return;
        }

        setOrders(ordersResponse.orders);

        if (activeMode === 'partner') {
          const partnerResponse = await fetchPartnerOverview(token);

          if (!active) {
            return;
          }

          setPartnerOverview(partnerResponse);
          setAppointments({});
          setTimeline({});
          setLoading(false);
          return;
        }

        const appointmentEntries = await Promise.all(
          ordersResponse.orders.map(async (order) => [
            order.id,
            (await fetchAppointments(order.id, token)).appointments
          ] as const)
        );

        const timelineEntries = await Promise.all(
          ordersResponse.orders.map(async (order) => [
            order.id,
            (await fetchTimeline(order.id, token)).events
          ] as const)
        );

        if (!active) {
          return;
        }

        setPartnerOverview(null);
        setAppointments(Object.fromEntries(appointmentEntries));
        setTimeline(Object.fromEntries(timelineEntries));
      } catch {
        if (active) {
          setError('Não foi possível atualizar o workspace compartilhado do Biteplaner.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadWorkspace();

    return () => {
      active = false;
    };
    }, [selectedMode, token]);

  useEffect(() => {
    if (!token || (selectedMode !== 'dentist' && selectedMode !== 'lab')) {
      setDentistLicensing(null);
      setDentistLicensingLoading(false);
      return;
    }

    if (selectedMode === 'lab' && demoPersona === 'lab') {
      setDentistLicensing(null);
      setDentistLicensingLoading(false);
      return;
    }

    if (loading) {
      setDentistLicensing(null);
      setDentistLicensingLoading(true);
      return;
    }

    let active = true;

    async function loadDentistLicensing() {
      setDentistLicensingLoading(true);
      try {
        const response = selectedMode === 'lab'
          ? await fetchLabLicensing(token)
          : await fetchDentistLicensing(token);

        if (!active) {
          return;
        }

        setDentistLicensing(response);

        const hasApprovalNotification = response.notifications.some((notification) =>
          /cadastro aprovado/i.test(notification.title)
        );
        if (hasApprovalNotification && response.workflow?.status !== 'licensed') {
          setShowLicensingApprovalModal(true);
        }
      } catch {
        if (active) {
          setDentistLicensing(null);
        }
      } finally {
        if (active) {
          setDentistLicensingLoading(false);
        }
      }
    }

    void loadDentistLicensing();

    return () => {
      active = false;
    };
  }, [loading, selectedMode, token]);

  async function refreshWorkspace() {
    if (!token || !selectedMode || selectedMode === 'admin') {
      return;
    }

    const ordersResponse = await fetchOrders(selectedMode, token);
    setOrders(ordersResponse.orders);

    if (selectedMode === 'partner') {
      setPartnerOverview(await fetchPartnerOverview(token));
      return;
    }

    setAppointments(
      Object.fromEntries(
        await Promise.all(
          ordersResponse.orders.map(async (order) => [
            order.id,
            (await fetchAppointments(order.id, token)).appointments
          ] as const)
        )
      )
    );
    setTimeline(
      Object.fromEntries(
        await Promise.all(
          ordersResponse.orders.map(async (order) => [
            order.id,
            (await fetchTimeline(order.id, token)).events
          ] as const)
        )
      )
    );
  }

  async function refreshDentistLicensing() {
    if (!token || (selectedMode !== 'dentist' && selectedMode !== 'lab')) {
      return;
    }

    const response = selectedMode === 'lab' ? await fetchLabLicensing(token) : await fetchDentistLicensing(token);
    setDentistLicensing(response);
  }

  async function runLicensingAction(actionKey: string, callback: () => Promise<unknown>, successMessage: string) {
    setActiveAction(actionKey);
    setError('');
    setNotice('');

    try {
      await callback();
      await refreshDentistLicensing();
      setNotice(successMessage);
    } catch {
      setError('Não foi possível atualizar o licenciamento agora.');
    } finally {
      setActiveAction('');
    }
  }

  async function runOrderAction(actionKey: string, callback: () => Promise<unknown>, successMessage: string) {
    setActiveAction(actionKey);
    setNotice('');
    setError('');

    try {
      await callback();
      await refreshWorkspace();
      setNotice(successMessage);
    } catch {
      setError('Não foi possível atualizar este pedido demo agora.');
    } finally {
      setActiveAction('');
    }
  }

  const currentCopy = selectedMode ? MODE_COPY[selectedMode] : null;
  const athleteOrder = getAthletePrimaryOrder(orders);
  const athleteNextPath = athleteOrder ? getAthleteNextPath(athleteOrder) : '#';
  const athleteNextStepLabel = athleteOrder
    ? athleteNextPath === '/painel/pre-requisito'
      ? 'concluir o pre-requisito'
      : athleteNextPath === '/painel/compra'
        ? 'confirmar a compra mock'
        : 'acompanhar a jornada completa'
    : 'aguardar o próximo caso';

  const athleteStats = [
    {
      label: 'Jornada Biteplaner',
      value: athleteOrder ? 'Ativa' : 'Não iniciada',
      hint: athleteOrder
        ? `Jornada do atleta ${athleteOrder.id}.`
        : 'O cliente inicia uma única jornada Biteplaner neste momento.',
      icon: <FileText size={22} aria-hidden />,
      tone: 'blue' as const
    },
    {
      label: 'Status principal',
      value: athleteOrder?.statusLabel ?? 'Sem jornada',
      hint: athleteOrder ? `Status atual da jornada ${athleteOrder.id}.` : 'Nenhuma jornada ativa identificada.',
      icon: <Clock3 size={22} aria-hidden />,
      tone: 'amber' as const
    },
    {
      label: 'Próximo passo',
      value: athleteOrder ? getStageLabel(athleteOrder) : 'Aguardando',
      hint: 'A jornada sempre deixa claro qual a próxima etapa operacional.',
      icon: <Flag size={22} aria-hidden />,
      tone: 'green' as const
    }
  ];

  const partnerStats = partnerOverview
    ? [
        {
          label: 'Leads captados',
          value: String(partnerOverview.summary.leadsCaptured),
          hint: 'Indicados que entraram no funil por um link do parceiro.'
        },
        {
          label: 'Contas criadas',
          value: String(partnerOverview.summary.convertedToAccount),
          hint: 'Leads que efetivamente viraram conta na Nexor.'
        },
        {
          label: 'Pedidos ativos',
          value: String(partnerOverview.summary.activeOrders),
          hint: 'Pedidos compartilhados que o parceiro pode acompanhar sem dados clínicos.'
        }
      ]
    : [];
  const partnerDashboardReferenceDate = useMemo(() => {
    const dates = [
      ...(partnerOverview?.inviteLinks ?? []).map((inviteLink) => getValidDate(inviteLink.created_at)),
      ...(partnerOverview?.leads ?? []).map((lead) => getValidDate(lead.created_at)),
    ].filter((date): date is Date => date !== null);

    if (dates.length === 0) {
      return new Date();
    }

    return new Date(Math.max(...dates.map((date) => date.getTime())));
  }, [partnerOverview]);
  const partnerDashboardRows = partnerOverview
    ? (() => {
        const filteredInviteLinks = partnerOverview.inviteLinks.filter((inviteLink) =>
          isWithinPartnerDashboardPeriod(inviteLink.created_at, partnerDashboardPeriod, partnerDashboardReferenceDate)
        );
        const filteredLeads = partnerOverview.leads.filter((lead) =>
          isWithinPartnerDashboardPeriod(lead.created_at, partnerDashboardPeriod, partnerDashboardReferenceDate)
        );

        return [
          {
            key: 'links',
            shortLabel: 'Links',
            label: 'Links gerados',
            value: filteredInviteLinks.length,
            hint: 'Links criados no período',
            color: '#171717',
          },
          {
            key: 'accounts',
            shortLabel: 'Cadastros',
            label: 'Clientes cadastrados',
            value: filteredLeads.filter((lead) => lead.funnelStage !== 'lead_captured').length,
            hint: 'Indicados que viraram conta',
            color: '#3C7C56',
          },
          {
            key: 'purchases',
            shortLabel: 'Compras',
            label: 'Links convertidos em compra',
            value: filteredLeads.filter(
              (lead) => lead.funnelStage === 'order_advanced' || lead.funnelStage === 'pre_requisite_completed'
            ).length,
            hint: 'Indicações com compra ou pedido avançado',
            color: '#6B7280',
          },
        ];
      })()
    : [];
  const partnerDashboardPeriodLabel =
    PARTNER_DASHBOARD_PERIODS.find((period) => period.key === partnerDashboardPeriod)?.label ?? 'MÃªs';

  const operationalStats = [
    {
      label: 'Pedidos visiveis',
      value: String(orders.length),
      hint: 'Fila compartilhada do modo atual.'
    },
    {
      label: 'Pendencias ativas',
      value: String(
        orders.filter((order) =>
          selectedMode === 'dentist'
            ? ['in_progress', 'appointment_confirmed', 'treatment_required', 'awaiting_payment', 'awaiting_dentist_forms', 'product_received_by_clinic'].includes(order.status)
            : ['awaiting_lab_start', 'lab_processing', 'awaiting_adaptation'].includes(order.status)
        ).length
      ),
      hint: 'Itens que ainda dependem de uma ação do perfil atual.'
    },
    {
      label: 'Atualizados hoje',
      value: String(
        Object.values(timeline).reduce((count, events) => count + events.slice(0, 1).length, 0)
      ),
      hint: 'Indicador simples para leitura rapida durante a apresentação.'
    }
  ];

  const dentistWorkflow = dentistLicensing?.workflow ?? null;
  const labOperationalFallback = selectedMode === 'lab' && demoPersona === 'lab' && dentistWorkflow === null;
  const dentistIsLicensed = dentistWorkflow?.status === 'licensed' || labOperationalFallback;
  const isLicensingActorMode = selectedMode === 'dentist' || selectedMode === 'lab';
  const licenseeNoun = getLicenseeNoun(selectedMode);
  const licenseePlural = getLicenseePlural(selectedMode);
  const dentistWorkspaceLoading = isLicensingActorMode && (loading || dentistLicensingLoading);
  const showDentistLicensingPanel =
    isLicensingActorMode && !dentistWorkspaceLoading && isLicensingRoute && dentistWorkflow !== null && !dentistIsLicensed;
  const showDentistLicensedPanel = isLicensingActorMode && !dentistWorkspaceLoading && isLicensingRoute && dentistIsLicensed;
  const showDentistLockedPanel = isLicensingActorMode && !dentistWorkspaceLoading && !isLicensingRoute && !dentistIsLicensed;
  const showOperationalPanel =
    isLicensingActorMode && !dentistWorkspaceLoading && !isLicensingRoute && dentistIsLicensed;
  const showDentistLicensingTabs = !(isLicensingActorMode && isLicensingRoute);
  const showOnlyDentistPayment = dentistWorkflow?.status === 'approved_pending_payment';
  const showDentistCourseFlow = Boolean(dentistWorkflow) && !showOnlyDentistPayment;
  const showFinalLicensingContract = dentistWorkflow?.status === 'licensing_contract_pending' && dentistWorkflow.testPassed;
  const showDistratoAction = dentistWorkflow?.status === 'distrato_pending';
  const dentistStatusLabel = getDentistLicensingStatusLabel(dentistWorkflow?.status);
  const dentistStatusTone = getDentistLicensingStatusTone(dentistWorkflow?.status);
  const dentistCertificateHref = buildCertificateHref(dentistWorkflow);
  const courseContents = dentistLicensing?.course ?? [];
  const courseProgress =
    dentistWorkflow?.metadata && typeof dentistWorkflow.metadata.courseProgress === 'object' && dentistWorkflow.metadata.courseProgress !== null
      ? (dentistWorkflow.metadata.courseProgress as Record<string, unknown>)
      : {};
  const completedCourseCount = courseContents.filter((content) => courseProgress[content.id] === true).length;
  const courseTotalCount = courseContents.length;
  const allCourseContentsCompleted = courseTotalCount > 0 && completedCourseCount === courseTotalCount;
  const canTakeDentistLicensingTest =
    showDentistCourseFlow &&
    allCourseContentsCompleted &&
    !dentistWorkflow?.testPassed &&
    (dentistWorkflow?.testAttempts ?? 0) < 3 &&
    !showDistratoAction;
  const selectedCourseContent =
    courseContents.find((content) => content.id === selectedCourseContentId) ?? courseContents[0] ?? null;

  useEffect(() => {
    if (!courseContents.length) {
      setSelectedCourseContentId(null);
      return;
    }

    setSelectedCourseContentId((current) =>
      current && courseContents.some((content) => content.id === current) ? current : courseContents[0].id
    );
  }, [courseContents]);

  const partnerColumns: DataTableColumn<PartnerOverviewResponse['leads'][number]>[] = [
    { key: 'customer', label: 'Indicado', render: (row) => row.customerName },
    { key: 'email', label: 'E-mail', render: (row) => row.customerEmail },
    {
      key: 'account',
      label: 'Virou conta?',
      render: (row) => {
        const presentation = getLeadAccountPresentation(row.funnelStage);
        return <StatusIndicator color={presentation.color} label={presentation.label} />;
      }
    },
    {
      key: 'order',
      label: 'Virou pedido?',
      render: (row) => {
        const presentation = getLeadOrderPresentation(row.funnelStage);
        return <StatusIndicator color={presentation.color} label={presentation.label} />;
      }
    },
    { key: 'created', label: 'Captado em', render: (row) => formatDate(row.created_at) }
  ];

  const partnerInviteColumns: DataTableColumn<PartnerOverviewResponse['inviteLinks'][number]>[] = [
    { key: 'token', label: 'Token', render: (row) => row.token },
    { key: 'customer', label: 'Cliente qualificado', render: (row) => row.intendedCustomerName ?? 'Não informado' },
    { key: 'email', label: 'Contato', render: (row) => row.intendedCustomerEmail ?? 'Não informado' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <StatusIndicator
          color={row.status === 'active' ? '#15803D' : row.status === 'expired' ? '#B91C1C' : '#2563EB'}
          label={row.status === 'active' ? 'Ativo' : row.status === 'expired' ? 'Expirado' : 'Consumido'}
        />
      )
    },
    { key: 'created', label: 'Gerado em', render: (row) => formatDate(row.created_at) },
    {
      key: 'actions',
      label: 'Visualizar',
      render: (row) => (
        <S.IconActionButton
          type="button"
          aria-label={`Visualizar link ${row.intendedCustomerName ?? row.token}`}
          onClick={() => {
            setSelectedInviteLink(row);
          }}
        >
          <Eye size={16} aria-hidden />
        </S.IconActionButton>
      )
    }
  ];

  const partnerOrderRows = useMemo(
    () =>
      (partnerOverview?.leads ?? [])
        .filter((lead) => lead.funnelStage === 'order_advanced' || lead.funnelStage === 'pre_requisite_completed')
        .map((lead) => {
          const order = orders.find((item) => item.id === lead.orderId);

          return {
            id: lead.id,
            orderId: lead.orderId,
            customerName: lead.customerName,
            createdAt: lead.created_at,
            order,
          };
        }),
    [orders, partnerOverview]
  );

  const partnerOrderColumns: DataTableColumn<(typeof partnerOrderRows)[number]>[] = [
    { key: 'order', label: 'Pedido', render: (row) => row.orderId },
    { key: 'customer', label: 'Cliente', render: (row) => row.customerName },
    {
      key: 'status',
      label: 'Status da ordem',
      render: (row) => {
        if (!row.order) {
          return <StatusIndicator color="#737373" label="Pedido ainda sincronizando" />;
        }

        const presentation = getOrderStatusPresentation(row.order);
        return <StatusIndicator color={presentation.color} label={presentation.label} />;
      }
    },
    {
      key: 'stage',
      label: 'Etapa operacional',
      render: (row) => (row.order ? getStageLabel(row.order) : 'Aguardando atualização')
    },
    { key: 'created', label: 'Originado em', render: (row) => formatDate(row.createdAt) }
  ];

  function renderOrderStatus(order: DemoOrderSummary) {
    const presentation = getOrderStatusPresentation(order);

    return <StatusIndicator color={presentation.color} label={presentation.label} />;
  }

  function getDentistActionConfigs(order: DemoOrderSummary): QueueActionConfig[] {
    if (order.status === 'awaiting_dentist_acceptance') {
      return [
        {
          id: `${order.id}:accept-initial-consultation`,
          title: 'Aceitar consulta agendada',
          ariaLabel: `Aceitar consulta agendada da ordem ${order.id}`,
          testId: 'dentist-order-action-accept-consultation',
          icon: <Check size={15} aria-hidden />,
          confirmTitle: 'Aceitar consulta agendada',
          confirmDescription: `Desejá aceitar a consulta agendada da ordem ${order.id}? A ordem só continua depois desse aceite do dentista.`,
          actionKey: `${order.id}:accept-initial-consultation`,
          successMessage: `${order.id} foi aceita pelo dentista e agora aguarda confirmação de realização.`,
          execute: () => acceptInitialConsultation(order.id, token)
        }
      ];
    }

    if (order.status === 'in_progress') {
      const appointment = appointments[order.id]?.[0] ?? null;

      if (!appointment || appointment.dentist_confirmed_at) {
        return [];
      }

      return [
        {
          id: `${order.id}:dentist-confirmation`,
          title: 'Confirmar consulta realizada',
          ariaLabel: `Confirmar consulta realizada da ordem ${order.id}`,
          testId: 'dentist-order-action-confirm-appointment',
          icon: <Check size={15} aria-hidden />,
          confirmTitle: 'Confirmar consulta realizada',
          confirmDescription: `Desejá confirmar que a consulta inicial da ordem ${order.id} foi realizada? A decisão clínica fica liberada quando paciente e dentista confirmarem o atendimento.`,
          actionKey: `${order.id}:dentist-confirmation`,
          successMessage: `${order.id} teve confirmação do dentista registrada.`,
          execute: () => confirmAppointmentByDentist(order.id, appointment.id, token)
        }
      ];
    }

    if (order.status === 'appointment_confirmed') {
      return [
        {
          id: `${order.id}:approve`,
          title: 'Registrar apto',
          ariaLabel: `Registrar apto da ordem ${order.id}`,
          testId: 'dentist-order-action-approve',
          icon: <Check size={15} aria-hidden />,
          confirmTitle: 'Confirmar aptidão',
          confirmDescription: `Desejá registrar a ordem ${order.id} como apta para seguir na jornada?`,
          actionKey: `${order.id}:approve`,
          successMessage: `${order.id} foi aprovado clinicamente na demo.`,
          execute: () => registerClinicalDecision(order.id, 'eligible', token)
        },
        {
          id: `${order.id}:ineligible`,
          title: 'Registrar inapto',
          ariaLabel: `Registrar inapto da ordem ${order.id}`,
          testId: 'dentist-order-action-ineligible',
          icon: <XCircle size={15} aria-hidden />,
          confirmTitle: 'Confirmar inaptidão',
          confirmDescription: `Desejá encerrar a ordem ${order.id} como inapta?`,
          actionKey: `${order.id}:ineligible`,
          successMessage: `${order.id} foi encerrado como inapto na demo.`,
          execute: () => registerClinicalDecision(order.id, 'ineligible', token)
        },
        {
          id: `${order.id}:treatment`,
          title: 'Tratamento prévio',
          ariaLabel: `Marcar tratamento prévio da ordem ${order.id}`,
          testId: 'dentist-order-action-prior-treatment',
          icon: <Stethoscope size={15} aria-hidden />,
          confirmTitle: 'Confirmar tratamento prévio',
          confirmDescription: `Desejá mover a ordem ${order.id} para tratamento prévio pendente?`,
          actionKey: `${order.id}:treatment`,
          successMessage: `${order.id} ficou pausado para tratamento prévio.`,
          execute: () => registerClinicalDecision(order.id, 'treatment_required', token)
        }
      ];
    }

    if (order.status === 'treatment_required') {
      return [
        {
          id: `${order.id}:approve`,
          title: 'Registrar apto',
          ariaLabel: `Registrar apto da ordem ${order.id}`,
          testId: 'dentist-order-action-approve',
          icon: <Check size={15} aria-hidden />,
          confirmTitle: 'Confirmar aptidão',
          confirmDescription: `Desejá registrar a ordem ${order.id} como apta após o tratamento prévio?`,
          actionKey: `${order.id}:approve`,
          successMessage: `${order.id} foi aprovado clinicamente na demo.`,
          execute: () => registerClinicalDecision(order.id, 'eligible', token)
        },
        {
          id: `${order.id}:ineligible`,
          title: 'Registrar inapto',
          ariaLabel: `Registrar inapto da ordem ${order.id}`,
          testId: 'dentist-order-action-ineligible',
          icon: <XCircle size={15} aria-hidden />,
          confirmTitle: 'Confirmar inaptidão',
          confirmDescription: `Desejá encerrar a ordem ${order.id} como inapta após o tratamento prévio?`,
          actionKey: `${order.id}:ineligible`,
          successMessage: `${order.id} foi encerrado como inapto na demo.`,
          execute: () => registerClinicalDecision(order.id, 'ineligible', token)
        }
      ];
    }

    if (order.status === 'awaiting_dentist_forms') {
      return [
        {
          id: `${order.id}:production-wizard`,
          title: 'Abrir solicitação de produção',
          ariaLabel: `Abrir solicitação de produção da ordem ${order.id}`,
          testId: 'dentist-order-action-open-production-wizard',
          icon: <FileText size={15} aria-hidden />,
          confirmTitle: 'Abrir solicitação de produção',
          confirmDescription: `Desejá abrir a solicitação de produção da ordem ${order.id} para preencher os documentos obrigatórios?`,
          actionKey: `${order.id}:production-wizard`,
          successMessage: '',
          execute: async () => undefined
        }
      ];
    }

    if (order.status === 'product_received_by_clinic') {
      return [
        {
          id: `${order.id}:received`,
          title: 'Confirmar recebimento',
          ariaLabel: `Confirmar recebimento do produto da ordem ${order.id}`,
          testId: 'dentist-order-action-confirm-product-received',
          icon: <Check size={15} aria-hidden />,
          confirmTitle: 'Confirmar recebimento',
          confirmDescription: `Deseja confirmar que o produto da ordem ${order.id} chegou ao dentista/local de atendimento?`,
          actionKey: `${order.id}:received`,
          successMessage: `${order.id} teve recebimento confirmado e foi liberada para adaptação.`,
          execute: () => confirmProductReceived(order.id, token)
        }
      ];
    }

    return [];
  }

  function getLabActionConfigs(order: DemoOrderSummary): QueueActionConfig[] {
    const documentationAction: QueueActionConfig = {
      id: `${order.id}:documentation`,
      title: 'Verificar documentação',
      ariaLabel: `Verificar documentação da ordem ${order.id}`,
      testId: 'lab-order-action-documentation',
      icon: <FileText size={15} aria-hidden />,
      confirmTitle: 'Verificar documentação',
      confirmDescription: `Visualizar documentação de produção da ordem ${order.id}.`,
      actionKey: `${order.id}:documentation`,
      successMessage: '',
      execute: async () => undefined
    };

    if (order.status === 'awaiting_lab_start') {
      return [
        documentationAction,
        {
          id: `${order.id}:start`,
          title: 'Iniciar produção',
          ariaLabel: `Iniciar produção da ordem ${order.id}`,
          testId: 'lab-order-action-start',
          icon: <Check size={15} aria-hidden />,
          confirmTitle: 'Iniciar produção',
          confirmDescription: `Desejá iniciar formalmente a produção da ordem ${order.id}?`,
          actionKey: `${order.id}:start`,
          successMessage: `${order.id} entrou em produção no laboratório.`,
          execute: () => startLabProduction(order.id, token)
        },
        {
          id: `${order.id}:return`,
          title: 'Devolver ao dentista',
          ariaLabel: `Devolver ao dentista a ordem ${order.id}`,
          testId: 'lab-order-action-return',
          icon: <XCircle size={15} aria-hidden />,
          confirmTitle: 'Devolver para o dentista',
          confirmDescription: `Desejá devolver a ordem ${order.id} para ajuste do dentista?`,
          actionKey: `${order.id}:return`,
          successMessage: `${order.id} voltou para ajuste do dentista.`,
          execute: () => returnToDentist(order.id, 'Laboratório solicitou ajuste adicional na demo compartilhada.', token)
        }
      ];
    }

    if (order.status !== 'lab_processing') {
      return [];
    }

    return [
      documentationAction,
      {
        id: `${order.id}:complete`,
        title: 'Concluir produção',
        ariaLabel: `Concluir produção da ordem ${order.id}`,
        testId: 'lab-order-action-complete',
        icon: <Check size={15} aria-hidden />,
        confirmTitle: 'Concluir produção',
        confirmDescription: `Desejá concluir a etapa produtiva da ordem ${order.id}?`,
        actionKey: `${order.id}:complete`,
        successMessage: `${order.id} concluiu a etapa produtiva da demo.`,
        execute: () => completeLabProduction(order.id, token)
      }
    ];
  }

  const dentistStatusOptions = useMemo(
    () =>
      Array.from(new Set(orders.map((order) => order.status))).map((status) => {
        const matchingOrder = orders.find((order) => order.status === status);
        const presentation = matchingOrder
          ? getOrderStatusPresentation(matchingOrder)
          : { label: status, color: '#737373' };

        return {
          value: status,
          label: presentation.label,
        };
      }),
    [orders]
  );

  const filteredDentistOrders = useMemo(
    () =>
      dentistStatusFilters.length === 0
        ? orders
        : orders.filter((order) => dentistStatusFilters.includes(order.status)),
    [dentistStatusFilters, orders]
  );

  const labStatusOptions = useMemo(
    () =>
      Array.from(new Set(orders.map((order) => order.status))).map((status) => {
        const matchingOrder = orders.find((order) => order.status === status);
        const presentation = matchingOrder
          ? getOrderStatusPresentation(matchingOrder)
          : { label: status, color: '#737373' };

        return {
          value: status,
          label: presentation.label,
        };
      }),
    [orders]
  );

  const filteredLabOrders = useMemo(
    () =>
      labStatusFilters.length === 0
        ? orders
        : orders.filter((order) => labStatusFilters.includes(order.status)),
    [labStatusFilters, orders]
  );

  const dentistColumns: DataTableColumn<DemoOrderSummary>[] = [
    { key: 'order', label: 'Pedido', width: '12%', render: (row) => row.id },
    {
      key: 'customer',
      label: 'Paciente',
      width: '16%',
      render: (row) => row.customer?.full_name ?? 'Paciente demo'
    },
    {
      key: 'stage',
      label: 'Etapa',
      width: '16%',
      render: (row) => getStageLabel(row)
    },
    {
      key: 'status',
      label: 'Status',
      width: '18%',
      render: (row) => renderOrderStatus(row)
    },
    {
      key: 'appointment',
      label: 'Consulta',
      width: '16%',
      render: (row) =>
        appointments[row.id]?.[0]
          ? formatDate(appointments[row.id][0].scheduled_at)
          : '-'
    },
    {
      key: 'latest-event',
      label: 'Última atualização',
      width: '10%',
      render: (row) =>
        timeline[row.id]?.length ? (
          <S.TableIconButton
            type="button"
            aria-label={`Visualizar atualizacoes da ordem ${row.id}`}
            title="Visualizar atualizacoes"
            onClick={() => {
              setSelectedTimelineOrderId(row.id);
            }}
          >
            <Eye size={15} aria-hidden />
          </S.TableIconButton>
        ) : (
          '-'
        )
    },
    {
      key: 'actions',
      label: 'Ações',
      width: '22%',
      render: (row) => {
        const actions = getDentistActionConfigs(row);

        if (actions.length === 0) {
          return '-';
        }

        return (
          <S.TableActionRow>
            {actions.map((action) => (
              <S.TableIconButton
                key={action.id}
                type="button"
                data-testid={action.testId}
                aria-label={action.ariaLabel}
                title={action.title}
                disabled={activeAction === action.actionKey}
                onClick={() => {
                  if (action.id.endsWith(':production-wizard')) {
                    navigate(`/painel/dentista/producao/${row.id}`);
                    return;
                  }

                  setPendingOrderAction(action);
                }}
              >
                {action.icon}
              </S.TableIconButton>
            ))}
          </S.TableActionRow>
        );
      }
    }
  ];

  const labColumns: DataTableColumn<DemoOrderSummary>[] = [
    { key: 'order', label: 'Pedido', width: '12%', render: (row) => row.id },
    {
      key: 'customer',
      label: 'Paciente',
      width: '16%',
      render: (row) => row.customer?.full_name ?? 'Paciente demo'
    },
    {
      key: 'dentist',
      label: 'Dentista',
      width: '16%',
      render: (row) => row.dentist?.full_name ?? '-'
    },
    {
      key: 'stage',
      label: 'Etapa',
      width: '16%',
      render: (row) => getStageLabel(row)
    },
    {
      key: 'status',
      label: 'Status',
      width: '16%',
      render: (row) => renderOrderStatus(row)
    },
    {
      key: 'latest-event',
      label: 'Última atualização',
      width: '10%',
      render: (row) =>
        timeline[row.id]?.length ? (
          <S.TableIconButton
            type="button"
            aria-label={`Visualizar atualizacoes da ordem ${row.id}`}
            title="Visualizar atualizacoes"
            onClick={() => {
              setSelectedTimelineOrderId(row.id);
            }}
          >
            <Eye size={15} aria-hidden />
          </S.TableIconButton>
        ) : (
          '-'
        )
    },
    {
      key: 'actions',
      label: 'Ações',
      width: '14%',
      render: (row) => {
        const actions = getLabActionConfigs(row);

        if (actions.length === 0) {
          return '-';
        }

        return (
          <S.TableActionRow>
            {actions.map((action) => (
              <S.TableIconButton
                key={action.id}
                type="button"
                data-testid={action.testId}
                aria-label={action.ariaLabel}
                title={action.title}
                disabled={activeAction === action.actionKey}
                onClick={() => {
                  if (action.id.endsWith(':documentation')) {
                    setSelectedDocumentationOrderId(row.id);
                    return;
                  }

                  setPendingOrderAction(action);
                }}
              >
                {action.icon}
              </S.TableIconButton>
            ))}
          </S.TableActionRow>
        );
      }
    }
  ];

  const inviteLinkUrl = selectedInviteLink ? buildPartnerInviteLink(selectedInviteLink.token) : '';
  const selectedTimelineOrder = selectedTimelineOrderId ? orders.find((order) => order.id === selectedTimelineOrderId) ?? null : null;
  const selectedTimelineEvents = selectedTimelineOrderId ? timeline[selectedTimelineOrderId] ?? [] : [];
  const selectedDocumentationOrder = selectedDocumentationOrderId ? orders.find((order) => order.id === selectedDocumentationOrderId) ?? null : null;
  const requiresReturnReason = pendingOrderAction?.id.endsWith(':return') ?? false;
  const inviteLinkMessage = selectedInviteLink
    ? `Olá! Segue seu link individual do Biteplaner: ${inviteLinkUrl}`
    : '';
  const emailHref = selectedInviteLink
    ? `mailto:${selectedInviteLink.intendedCustomerEmail ?? ''}?subject=${encodeURIComponent('Seu link individual do Biteplaner')}&body=${encodeURIComponent(inviteLinkMessage)}`
    : '#';
  const whatsappHref = selectedInviteLink
    ? `https://wa.me/?text=${encodeURIComponent(inviteLinkMessage)}`
    : '#';
  const athleteAppointment = athleteOrder ? appointments[athleteOrder.id]?.[0] ?? null : null;

  return (
    <S.Page>
      {isLicensingActorMode ? (
        <S.DentistStatusBar>
          <S.DentistStatusItem>
            <S.StatLabel>E-mail</S.StatLabel>
            <S.DentistStatusValue>{backendUser?.email ?? session?.user.email ?? '-'}</S.DentistStatusValue>
          </S.DentistStatusItem>
          <S.DentistStatusItem>
            <S.StatLabel>Status do {licenseeNoun}</S.StatLabel>
            <S.DentistStatusValue>
              <S.DentistStatusDot
                $tone={dentistStatusTone}
                aria-hidden="true"
                data-testid="dentist-status-dot"
                data-tone={dentistStatusTone}
              />
              {dentistStatusLabel}
            </S.DentistStatusValue>
          </S.DentistStatusItem>
        </S.DentistStatusBar>
      ) : (
        <S.Hero $showcase={selectedMode === 'user'}>
          <S.HeroCopy>
            <S.Eyebrow>Biteplaner</S.Eyebrow>
            <S.Title $showcase={selectedMode === 'user'}>{currentCopy?.title ?? 'Biteplaner'}</S.Title>
            <S.Description $showcase={selectedMode === 'user'}>
              {selectedMode === 'admin'
                ? 'A narrativa transversal do produto continua no painel administrativo, com filtros e pipeline completo.'
                : currentCopy?.description ?? 'Selecione um modo para visualizar o fluxo compartilhado da demo.'}
            </S.Description>
          </S.HeroCopy>
          {selectedMode === 'user' ? (
            <S.HeroVisual aria-hidden="true" data-testid="athlete-hero-visual">
              <S.HeroBrowser>
                <S.HeroBrowserChrome>
                  <span />
                  <span />
                  <span />
                </S.HeroBrowserChrome>
                <S.HeroBrowserBody>
                  <S.HeroChartLine />
                  <S.HeroChartPoint $left="18%" $top="58%" />
                  <S.HeroChartPoint $left="36%" $top="50%" />
                  <S.HeroChartPoint $left="52%" $top="42%" />
                  <S.HeroChartPoint $left="72%" $top="42%" />
                  <S.HeroChartPoint $left="88%" $top="38%" $active />
                </S.HeroBrowserBody>
              </S.HeroBrowser>
              <S.HeroFloatingCard>
                <S.HeroFloatingIcon>
                  <Check size={20} aria-hidden />
                </S.HeroFloatingIcon>
                <span>
                  Jornada ativa
                  <strong>{athleteOrder?.id ?? 'BP-DEMO-005'}</strong>
                </span>
              </S.HeroFloatingCard>
            </S.HeroVisual>
          ) : null}
        </S.Hero>
      )}

      {notice || error ? (
        <SnackbarStack>
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

      {access && showDentistLicensingTabs ? (
        <Tabs value={selectedMode ?? access.defaultMode} onChange={(mode) => { setSearchParams({ mode }); }}>
          <TabList>
            {access.modes.filter((mode) => mode.allowed).map((mode) => (
              <Tab key={mode.key} value={mode.key}>
                {mode.label}
              </Tab>
            ))}
          </TabList>
        </Tabs>
      ) : null}

      {selectedMode === 'admin' ? (
        <S.Panel>
          <S.PanelHeader>
            <S.PanelTitle>Fluxo admin da demo</S.PanelTitle>
            <S.PanelText>
              Use o painel administrativo para visualizar os 6 casos compartilhados com filtros por status e etapa.
            </S.PanelText>
          </S.PanelHeader>
          <S.ActionRow>
            <S.PrimaryLink to="/painel/admin/home">Abrir painel admin</S.PrimaryLink>
            <S.SecondaryLink to="/painel/admin/ordens">Abrir ordens do sistema</S.SecondaryLink>
          </S.ActionRow>
        </S.Panel>
      ) : null}

      {loading && selectedMode !== 'admin' && selectedMode !== 'dentist' && !isLicensingActorMode ? <SkeletonPage /> : null}

      {dentistWorkspaceLoading ? (
        <S.DentistWorkspaceSkeleton aria-label={`Carregando painel do ${licenseeNoun}`}>
          <S.SkeletonCard>
            <S.SkeletonLine $width="28%" />
            <S.SkeletonLine $width="64%" />
            <S.SkeletonLine $width="42%" />
          </S.SkeletonCard>
          <S.SkeletonGrid>
            <S.SkeletonCard>
              <S.SkeletonLine $width="40%" />
              <S.SkeletonBlock $height="34px" />
              <S.SkeletonLine $width="72%" />
            </S.SkeletonCard>
            <S.SkeletonCard>
              <S.SkeletonLine $width="44%" />
              <S.SkeletonBlock $height="34px" />
              <S.SkeletonLine $width="68%" />
            </S.SkeletonCard>
            <S.SkeletonCard>
              <S.SkeletonLine $width="36%" />
              <S.SkeletonBlock $height="34px" />
              <S.SkeletonLine $width="74%" />
            </S.SkeletonCard>
          </S.SkeletonGrid>
          <S.SkeletonTable>
            <S.SkeletonLine $width="30%" />
            <S.SkeletonBlock $height="44px" />
            <S.SkeletonBlock $height="44px" />
            <S.SkeletonBlock $height="44px" />
          </S.SkeletonTable>
        </S.DentistWorkspaceSkeleton>
      ) : null}

      {!loading && selectedMode === 'user' ? (
        <>
          <S.AthleteStatsGrid>
            {athleteStats.map((stat) => (
              <S.AthleteStatCard key={stat.label} $tone={stat.tone}>
                <S.AthleteStatIcon $tone={stat.tone}>{stat.icon}</S.AthleteStatIcon>
                <S.AthleteStatContent>
                  <S.StatLabel>{stat.label}</S.StatLabel>
                  <S.StatValue>{stat.value}</S.StatValue>
                  <S.StatHint>{stat.hint}</S.StatHint>
                </S.AthleteStatContent>
                <ChevronRight size={22} aria-hidden />
              </S.AthleteStatCard>
            ))}
          </S.AthleteStatsGrid>

          <S.AthleteCasePanel data-testid="athlete-primary-case">
            <S.PanelHeader>
              <S.PanelTitle>Jornada do atleta</S.PanelTitle>
              <S.PanelText>
                O cliente acompanha uma única jornada Biteplaner neste primeiro momento. O backend continua preparado para múltiplas ordens, mas a interface foca na jornada ativa do atleta.
              </S.PanelText>
            </S.PanelHeader>

            {athleteOrder ? (
              <S.AthleteOrderHighlight data-testid="athlete-primary-order">
                <S.AthleteOrderAvatar aria-hidden="true">BP</S.AthleteOrderAvatar>
                <S.AthleteOrderMain>
                  <S.AthleteOrderHeader>
                    <div>
                    <S.OrderTitle>{athleteOrder.id}</S.OrderTitle>
                    <S.OrderText>
                      {athleteOrder.customer?.full_name ?? 'Atleta demo'} - etapa {getStageLabel(athleteOrder)}.
                    </S.OrderText>
                    </div>
                    <Chip tone={getStatusTone(athleteOrder.status)} data-testid="athlete-order-status">
                      <StatusIndicator
                        color={getOrderStatusPresentation(athleteOrder).color}
                        label={getOrderStatusPresentation(athleteOrder).label}
                      />
                    </Chip>
                  </S.AthleteOrderHeader>
                  <S.OrderText>Próximo passo visível: {athleteNextStepLabel}.</S.OrderText>
                  <S.ActionRow>
                    <S.PrimaryLink to={athleteNextPath}>
                      Continuar fluxo
                      <ChevronRight size={16} aria-hidden />
                    </S.PrimaryLink>
                    <S.SecondaryLink to="/painel/biteplaner/jornada">
                      Abrir jornada
                      <ExternalLink size={15} aria-hidden />
                    </S.SecondaryLink>
                  </S.ActionRow>
                </S.AthleteOrderMain>
                {athleteOrder.status === 'in_progress' && athleteAppointment ? (
                  <S.ActionRow>
                    {!athleteAppointment.user_confirmed_at ? (
                      <S.PrimaryButton
                        type="button"
                        disabled={activeAction === `${athleteOrder.id}:user-confirmation`}
                        onClick={() => {
                          void runOrderAction(
                            `${athleteOrder.id}:user-confirmation`,
                            () => confirmAppointmentByUser(athleteOrder.id, athleteAppointment.id, token),
                            'Sua confirmação de consulta realizada foi registrada.'
                          );
                        }}
                      >
                        Confirmar consulta realizada
                      </S.PrimaryButton>
                    ) : (
                      <S.OrderText>Paciente confirmou a consulta. Aguardando confirmação do dentista.</S.OrderText>
                    )}
                  </S.ActionRow>
                ) : null}
                {athleteOrder.status === 'appointment_confirmed' ? (
                  <S.OrderText>Consulta confirmada por paciente e dentista.</S.OrderText>
                ) : null}
              </S.AthleteOrderHighlight>
            ) : (
              <S.EmptyState>Nenhuma jornada do atleta apareceu neste momento da demo.</S.EmptyState>
            )}
          </S.AthleteCasePanel>
        </>
      ) : null}

      {!loading && selectedMode === 'partner' ? (
        <>
          <S.StatsGrid>
            {partnerStats.map((stat) => (
              <S.StatCard key={stat.label}>
                <S.StatLabel>{stat.label}</S.StatLabel>
                <S.StatValue>{stat.value}</S.StatValue>
                <S.StatHint>{stat.hint}</S.StatHint>
              </S.StatCard>
            ))}
          </S.StatsGrid>

          <S.PartnerDashboardGrid>
            <S.Panel>
              <S.PartnerChartHeader>
                <S.PanelTitle>Resumo das indicações</S.PanelTitle>
                <S.PanelText>
                  Visão comercial do parceiro, separando links gerados, clientes que se cadastraram e indicações convertidas em compra.
                </S.PanelText>
                <S.PartnerPeriodControl aria-label="Filtrar resumo das indicações">
                  {PARTNER_DASHBOARD_PERIODS.map((period) => (
                    <S.PartnerPeriodButton
                      key={period.key}
                      type="button"
                      $active={partnerDashboardPeriod === period.key}
                      aria-pressed={partnerDashboardPeriod === period.key}
                      onClick={() => setPartnerDashboardPeriod(period.key)}
                    >
                      {period.label}
                    </S.PartnerPeriodButton>
                  ))}
                </S.PartnerPeriodControl>
              </S.PartnerChartHeader>
              <S.PartnerBarChart aria-label="Gráfico de barras do resumo das indicações">
                <ResponsiveContainer width="100%" height={292}>
                  <BarChart data={partnerDashboardRows} margin={{ top: 24, right: 8, left: -18, bottom: 6 }}>
                    <CartesianGrid stroke="#E5E7EB" strokeDasharray="4 6" vertical={false} />
                    <XAxis
                      dataKey="shortLabel"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#525252', fontSize: 12, fontWeight: 700 }}
                    />
                    <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#737373', fontSize: 11 }} />
                    <Tooltip
                      cursor={{ fill: 'rgba(23, 23, 23, 0.04)' }}
                      formatter={(value, _name, item) => [
                        Number(value).toLocaleString('pt-BR'),
                        item.payload?.label ?? 'Total',
                      ]}
                      labelFormatter={() => `PerÃ­odo: ${partnerDashboardPeriodLabel}`}
                      contentStyle={{
                        border: '1px solid #E0E0E0',
                        borderRadius: 8,
                        boxShadow: '0 18px 42px rgba(23, 23, 23, 0.08)',
                        color: '#171717',
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="value" radius={[8, 8, 4, 4]} barSize={58} isAnimationActive>
                      <LabelList dataKey="value" position="top" fill="#171717" fontSize={13} fontWeight={800} />
                      {partnerDashboardRows.map((row) => (
                        <Cell key={row.key} fill={row.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <S.PartnerChartLegend>
                  {partnerDashboardRows.map((row) => (
                    <S.PartnerChartLegendItem key={row.key}>
                      <S.PartnerChartLegendDot $color={row.color} />
                      <span>{row.label}</span>
                      <strong data-testid={`partner-chart-value-${row.key}`}>{row.value}</strong>
                    </S.PartnerChartLegendItem>
                  ))}
                </S.PartnerChartLegend>
              </S.PartnerBarChart>
            </S.Panel>

            <S.Panel>
              <S.PanelHeader>
                <S.PanelTitle>Operação do parceiro</S.PanelTitle>
                <S.PanelText>
                  A geração de QR code, URL individual e lista de indicações fica concentrada no submenu Indicar.
                </S.PanelText>
              </S.PanelHeader>
              <S.ActionRow>
                <S.PrimaryLink to="/painel/biteplaner/indicar?mode=partner">Abrir Indicar</S.PrimaryLink>
                <S.SecondaryLink to="/painel/biteplaner/avaliacoes?mode=partner">Ver avaliações</S.SecondaryLink>
              </S.ActionRow>
            </S.Panel>
          </S.PartnerDashboardGrid>

          {false ? (
          <S.Panel>
            <S.PanelHeader>
              <S.PanelTitle>Leads e links do parceiro</S.PanelTitle>
              <S.PanelText>
                O parceiro vê a evolução comercial e operacional resumida, sem acesso a informações clínicas detalhadas.
              </S.PanelText>
            </S.PanelHeader>

            <S.InlineForm
              onSubmit={(event) => {
                event.preventDefault();

                if (!qualifiedCustomerName.trim()) {
                  setError('Informe o nome do cliente qualificado antes de gerar um link individual.');
                  return;
                }

                void runOrderAction(
                  'partner:create-link',
                  async () => {
                    await createPartnerInviteLink(
                      {
                        customerName: qualifiedCustomerName,
                        customerEmail: qualifiedCustomerEmail || undefined
                      },
                      token
                    );
                    setQualifiedCustomerName('');
                    setQualifiedCustomerEmail('');
                  },
                  'Novo link individual gerado para um cliente qualificado.'
                );
              }}
            >
              <Field
                as="input"
                label="Cliente qualificado"
                placeholder="Nome da pessoa abordada"
                value={qualifiedCustomerName}
                onChange={(event) => {
                  setQualifiedCustomerName(event.target.value);
                }}
              />
              <Field
                as="input"
                label="E-mail do contato"
                placeholder="opcional@cliente.com"
                value={qualifiedCustomerEmail}
                onChange={(event) => {
                  setQualifiedCustomerEmail(event.target.value);
                }}
              />
              <S.ActionButton type="submit" disabled={activeAction === 'partner:create-link'}>
                {activeAction === 'partner:create-link' ? 'Gerando...' : 'Gerar link individual'}
              </S.ActionButton>
            </S.InlineForm>

            <S.SectionStack>
              <S.SectionHeading>
                <S.SectionTitle>Links individuais gerados</S.SectionTitle>
                <S.SectionDescription>
                  Lista dos links criados pelo parceiro para clientes qualificados, com acesso rápido para compartilhar.
                </S.SectionDescription>
              </S.SectionHeading>
              <div data-testid="partner-links-table">
                <DataTable
                  data={partnerOverview?.inviteLinks ?? []}
                  columns={partnerInviteColumns}
                  keyExtractor={(row) => row.id}
                  pageSize={6}
                  emptyMessage="Nenhum link individual gerado nesta demo."
                />
              </div>
            </S.SectionStack>

            <S.SectionStack>
              <S.SectionHeading>
                <S.SectionTitle>Leads captados</S.SectionTitle>
                <S.SectionDescription>
                  Pessoas que realmente entraram no funil por um link do parceiro, com destaque para conversão em conta e pedido.
                </S.SectionDescription>
              </S.SectionHeading>
              <S.LeadTable data-testid="partner-leads-table">
                <DataTable
                  data={partnerOverview?.leads ?? []}
                  columns={partnerColumns}
                  keyExtractor={(row) => row.id}
                  pageSize={6}
                  emptyMessage="Nenhum lead captado nesta demo."
                />
              </S.LeadTable>
            </S.SectionStack>

            <S.SectionStack>
              <S.SectionHeading>
                <S.SectionTitle>Pedidos originados por lead</S.SectionTitle>
                <S.SectionDescription>
                  Recorte somente dos leads que já viraram pedido, agora com o status da ordem separado da etapa operacional.
                </S.SectionDescription>
              </S.SectionHeading>
              <div data-testid="partner-orders-table">
                <DataTable
                  data={partnerOrderRows}
                  columns={partnerOrderColumns}
                  keyExtractor={(row) => row.id}
                  pageSize={6}
                  emptyMessage="Nenhum lead virou pedido nesta demo."
                />
              </div>
            </S.SectionStack>

            <S.OrderText>
              Links ativos: {(partnerOverview?.inviteLinks ?? [])
                .filter((item) => item.status === 'active')
                .map((item) => item.token)
                .join(', ') || 'nenhum link ativo'}.
            </S.OrderText>
          </S.Panel>
          ) : null}
        </>
      ) : null}

      {!loading && showDentistLicensingPanel ? (
        <>
          <S.StatsGrid>
            <S.StatCard>
              <S.StatLabel>Status</S.StatLabel>
              <S.StatValue>{dentistStatusLabel}</S.StatValue>
              <S.StatHint>Etapa atual do licenciamento.</S.StatHint>
            </S.StatCard>
            {showDentistCourseFlow ? (
              <>
                <S.StatCard>
                  <S.StatLabel>Curso</S.StatLabel>
                  <S.StatValue>{completedCourseCount}/{courseTotalCount}</S.StatValue>
                  <S.StatHint>Vídeos concluídos.</S.StatHint>
                </S.StatCard>
                <S.StatCard>
                  <S.StatLabel>Prova</S.StatLabel>
                  <S.StatValue>{dentistWorkflow.testAttempts}/3</S.StatValue>
                  <S.StatHint>Tentativas usadas.</S.StatHint>
                </S.StatCard>
              </>
            ) : null}
          </S.StatsGrid>

          <S.Panel>
            <S.PanelHeader>
              <S.PanelTitle>Licenciamento Biteplaner</S.PanelTitle>
              <S.PanelText>
                {showOnlyDentistPayment
                  ? 'Seu cadastro foi aprovado pela Nexor. Para continuar o licenciamento, realize o pagamento.'
                  : showFinalLicensingContract
                    ? 'Prova aprovada. Leia o contrato de licenciamento e confirme o aceite para finalizar.'
                    : showDistratoAction
                      ? 'As tentativas de prova foram encerradas. O próximo passo é registrar o distrato de intenção de licenciamento.'
                      : 'Pagamento confirmado. Conclua o curso de licenciamento para liberar a prova.'}
              </S.PanelText>
            </S.PanelHeader>

            {showOnlyDentistPayment ? (
              <S.SectionStack>
                <S.SectionHeading>
                  <S.SectionTitle>Pagamento</S.SectionTitle>
                  <S.SectionDescription>
                    O pagamento e simulado neste MVP. Após confirmar, o conteúdo de licenciamento será liberado.
                  </S.SectionDescription>
                </S.SectionHeading>
                <S.ActionButton
                  type="button"
                  disabled={activeAction === 'dentist-license:payment' || dentistWorkflow.paymentStatus === 'confirmed'}
                  onClick={() => {
                    void runLicensingAction(
                      'dentist-license:payment',
                      () => selectedMode === 'lab' ? confirmLabLicensingPayment(token) : confirmDentistLicensingPayment(token),
                      'Pagamento do licenciamento confirmado.'
                    );
                  }}
                >
                  Confirmar pagamento
                </S.ActionButton>
              </S.SectionStack>
            ) : null}

            {showDentistCourseFlow && !showFinalLicensingContract && !showDistratoAction ? (
              <S.SectionStack>
                <S.SectionHeading>
                  <S.SectionTitle>Cursó de licenciamento</S.SectionTitle>
                  <S.SectionDescription>Assista aos vídeos e marque cada conteúdo como concluído antes de fazer a prova.</S.SectionDescription>
                </S.SectionHeading>

                <S.CourseLayout>
                  <S.CourseTabs aria-label="Vídeos do curso de licenciamento">
                    {courseContents.map((content, index) => (
                      <S.CourseTabButton
                        key={content.id}
                        type="button"
                        $active={selectedCourseContent?.id === content.id}
                        onClick={() => setSelectedCourseContentId(content.id)}
                      >
                        <span>Vídeo {index + 1}</span>
                        <strong>{content.title}</strong>
                        {courseProgress[content.id] === true ? (
                          <S.CourseCompletionMark>
                            <Check size={13} aria-hidden />
                            Concluído
                          </S.CourseCompletionMark>
                        ) : null}
                      </S.CourseTabButton>
                    ))}
                  </S.CourseTabs>

                  {selectedCourseContent ? (
                    <S.CourseContentPanel>
                      <S.VideoFrame>
                        <FileText size={28} aria-hidden />
                        <strong>{selectedCourseContent.videoTitle}</strong>
                        <span>Conteúdo de vídeo demonstrativo para o MVP.</span>
                      </S.VideoFrame>
                      <S.CourseTextBlock>
                        <S.SectionTitle>{selectedCourseContent.title}</S.SectionTitle>
                        <S.OrderText>
                          Material de apoio: {selectedCourseContent.documentTitle}. Revise o protocolo, os pontos de
                          documentação e os critérios de qualidade antes de avançar para a prova.
                        </S.OrderText>
                        <S.StudyMaterialBox tabIndex={0} aria-label={`Texto de estudo: ${selectedCourseContent.title}`}>
                          <S.OrderText>{getCourseStudyText(selectedCourseContent.id, selectedMode)}</S.OrderText>
                        </S.StudyMaterialBox>
                        <S.ActionHref
                          href={buildCoursePdfHref(selectedCourseContent.title, selectedCourseContent.id, selectedMode)}
                          download={`${selectedCourseContent.id}-biteplaner.pdf`}
                        >
                          <Download size={14} aria-hidden />
                          Baixar PDF
                        </S.ActionHref>
                        <S.ActionButton
                          type="button"
                          disabled={activeAction === `dentist-license:course:${selectedCourseContent.id}`}
                          onClick={() => {
                            void runLicensingAction(
                              `dentist-license:course:${selectedCourseContent.id}`,
                              () => selectedMode === 'lab'
                                ? updateLabLicensingCourseProgress(selectedCourseContent.id, true, token)
                                : updateDentistLicensingCourseProgress(selectedCourseContent.id, true, token),
                              `${selectedCourseContent.title} marcado como concluído.`
                            );
                          }}
                        >
                          {courseProgress[selectedCourseContent.id] === true ? 'Concluído' : 'Marcar como concluído'}
                        </S.ActionButton>
                      </S.CourseTextBlock>
                    </S.CourseContentPanel>
                  ) : null}
                </S.CourseLayout>

                {canTakeDentistLicensingTest ? (
                  <S.ActionRow>
                    <S.PrimaryButton
                      type="button"
                      disabled={activeAction === 'dentist-license:test'}
                      onClick={() => {
                        void runLicensingAction(
                          'dentist-license:test',
                          () => selectedMode === 'lab'
                            ? submitLabLicensingTest(['correta', 'correta', 'correta'], token)
                            : submitDentistLicensingTest(['correta', 'correta', 'correta'], token),
                          'Prova enviada e aprovada.'
                        );
                      }}
                    >
                      Fazer teste
                    </S.PrimaryButton>
                  </S.ActionRow>
                ) : null}
              </S.SectionStack>
            ) : null}

            {showFinalLicensingContract ? (
              <S.SectionStack>
                <S.SectionHeading>
                  <S.SectionTitle>Contrato de licenciamento</S.SectionTitle>
                  <S.SectionDescription>
                    Revise o contrato final. A assinatura conclui o licenciamento e emite o certificado Biteplaner.
                  </S.SectionDescription>
                </S.SectionHeading>
                <S.ContractBox>
                  <S.OrderText>
                    Este contrato registra a autorização para atuar como dentista licenciado Biteplaner, observando os
                    protocolos clínicos, operacionais e de qualidade apresentados no curso.
                  </S.OrderText>
                  <S.CheckboxLabel>
                    <input
                      type="checkbox"
                      checked={licensingContractRead}
                      onChange={(event) => setLicensingContractRead(event.target.checked)}
                    />
                    Li e estou de acordo com o Contrato de Licenciamento Biteplaner.
                  </S.CheckboxLabel>
                </S.ContractBox>
                <S.PrimaryButton
                  type="button"
                  disabled={activeAction === 'dentist-license:contract' || !licensingContractRead}
                  onClick={() => {
                    void runLicensingAction(
                      'dentist-license:contract',
                    () => selectedMode === 'lab'
                      ? signLabLicensingContract('licensing', token)
                      : signDentistLicensingContract('licensing', token),
                      'Contrato de licenciamento assinado. Certificado Biteplaner emitido.'
                    );
                  }}
                >
                  Assinar contrato final
                </S.PrimaryButton>
              </S.SectionStack>
            ) : null}

            {showDistratoAction ? (
              <S.SectionStack>
                <S.SectionHeading>
                  <S.SectionTitle>Distrato de intenção de licenciamento</S.SectionTitle>
                  <S.SectionDescription>
                    O distrato aparece somente quando as tentativas de prova foram encerradas sem aprovação.
                  </S.SectionDescription>
                </S.SectionHeading>
                <S.ActionButton
                  type="button"
                  disabled={activeAction === 'dentist-license:distrato'}
                  onClick={() => {
                    void runLicensingAction(
                      'dentist-license:distrato',
                      () => selectedMode === 'lab'
                        ? signLabLicensingContract('distrato', token)
                        : signDentistLicensingContract('distrato', token),
                      'Distrato de intenção de licenciamento assinado.'
                    );
                  }}
                >
                  Assinar distrato
                </S.ActionButton>
              </S.SectionStack>
            ) : null}
          </S.Panel>
        </>
      ) : null}

      {!loading && showDentistLicensedPanel ? (
        <S.Panel>
          <S.CelebrationHeader>
            <S.CelebrationIcon aria-hidden="true">
              <PartyPopper size={28} />
            </S.CelebrationIcon>
            <div>
              <S.PanelTitle>Licenciamento concluído</S.PanelTitle>
              <S.PanelText>
                Parabens! Seu licenciamento Biteplaner foi concluído com sucesso. O contrato final foi assinado e seu certificado está disponível para download.
              </S.PanelText>
            </div>
          </S.CelebrationHeader>
          <S.ActionRow>
            <S.ActionHref href={dentistCertificateHref} download="certificado-biteplaner.txt">
              <Download size={14} aria-hidden />
              Baixar certificado
            </S.ActionHref>
          </S.ActionRow>
        </S.Panel>
      ) : null}

      {!dentistWorkspaceLoading && isLicensingActorMode && isLicensingRoute && !dentistWorkflow ? (
        <S.Panel>
          <S.PanelHeader>
            <S.PanelTitle>Licenciamento Biteplaner</S.PanelTitle>
            <S.PanelText>
              Nenhum processo de licenciamento foi encontrado para este {licenseeNoun}.
            </S.PanelText>
          </S.PanelHeader>
        </S.Panel>
      ) : null}

      {!loading && showDentistLockedPanel ? (
        <S.Panel>
          <S.LockedNotice role="status">
            <S.LockedIcon aria-hidden="true">
              <AlertTriangle size={22} />
            </S.LockedIcon>
            <S.PanelTitle>Conteúdo liberado apenas para {licenseePlural} licenciados</S.PanelTitle>
          </S.LockedNotice>
          {dentistWorkflow && dentistWorkflow.status !== 'admin_rejected' && dentistWorkflow.status !== 'distrato_signed' ? (
            <S.ActionRow>
              <S.PrimaryLink to={`/painel/biteplaner/licenciamento?mode=${selectedMode}`}>
                Ir para licenciamento
              </S.PrimaryLink>
            </S.ActionRow>
          ) : null}
        </S.Panel>
      ) : null}

      {!loading && showOperationalPanel ? (
        <>
          <S.StatsGrid>
            {operationalStats.map((stat) => (
              <S.StatCard key={stat.label}>
                <S.StatLabel>{stat.label}</S.StatLabel>
                <S.StatValue>{stat.value}</S.StatValue>
                <S.StatHint>{stat.hint}</S.StatHint>
              </S.StatCard>
            ))}
          </S.StatsGrid>

          <S.Panel>
            {selectedMode === 'dentist' ? (
              <S.PanelHeader>
                <S.PanelTitle>Fila operacional do dentista</S.PanelTitle>
                <S.PanelText>
                  Ordens com consulta agendada pelo cliente aparecem aqui já vinculadas ao dentista licenciado. A
                  realização da consulta ainda precisa do match de confirmação entre paciente e dentista.
                </S.PanelText>
              </S.PanelHeader>
            ) : (
              <S.PanelHeader>
                <S.PanelTitle>Fila operacional do laboratório</S.PanelTitle>
                <S.PanelText>
                  Cada ação abaixo modifica o mesmo conjunto de pedidos e deve refletir nas outras personas da demo.
                </S.PanelText>
              </S.PanelHeader>
            )}

            {selectedMode === 'dentist' ? (
              <div data-testid="dentist-queue-table">
                <DataTable
                  data={filteredDentistOrders}
                  columns={dentistColumns}
                  keyExtractor={(row) => row.id}
                  filterOptions={dentistStatusOptions}
                  filterValues={dentistStatusFilters}
                  onFilterValuesChange={setDentistStatusFilters}
                  pageSize={4}
                  emptyMessage="Nenhum pedido do dentista corresponde aos filtros atuais."
                />
              </div>
            ) : (
              <div data-testid="lab-queue-table">
                <DataTable
                  data={filteredLabOrders}
                  columns={labColumns}
                  keyExtractor={(row) => row.id}
                  filterOptions={labStatusOptions}
                  filterValues={labStatusFilters}
                  onFilterValuesChange={setLabStatusFilters}
                  pageSize={4}
                  emptyMessage="Nenhuma ordem do laboratório nesta etapa da demo."
                />
              </div>
            )}
          </S.Panel>
        </>
      ) : null}

      {pendingOrderAction ? (
        <S.ModalOverlay
          role="dialog"
            aria-modal="true"
            aria-label="Confirmar ação da ordem"
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                setPendingOrderAction(null);
                setPendingOrderReason('');
              }
            }}
          >
            <S.ModalBox>
            <S.ModalHeader>
              <div>
                <S.ModalTitle>{pendingOrderAction.confirmTitle}</S.ModalTitle>
                <S.ModalSubtitle>{pendingOrderAction.confirmDescription}</S.ModalSubtitle>
              </div>
                <S.ModalCloseButton
                  type="button"
                  aria-label="Fechar modal de confirmação da ordem"
                  onClick={() => {
                    setPendingOrderAction(null);
                    setPendingOrderReason('');
                  }}
                >
                  <X size={16} aria-hidden />
                </S.ModalCloseButton>
              </S.ModalHeader>

              {requiresReturnReason ? (
                <Field
                  as="textarea"
                  label="Descricao do motivo"
                  placeholder="Explique o ajuste que o dentista precisa realizar."
                  value={pendingOrderReason}
                  onChange={(event) => {
                    setPendingOrderReason(event.target.value);
                  }}
                />
              ) : null}

              <S.ModalActions>
                <S.ActionButton
                  type="button"
                  onClick={() => {
                    setPendingOrderAction(null);
                    setPendingOrderReason('');
                  }}
                >
                  Cancelar
                </S.ActionButton>
                <S.PrimaryButton
                  type="button"
                  disabled={activeAction === pendingOrderAction.actionKey || (requiresReturnReason && !pendingOrderReason.trim())}
                  onClick={() => {
                    const action = pendingOrderAction;
                    const callback =
                      requiresReturnReason
                        ? () => returnToDentist(action.id.split(':')[0], pendingOrderReason.trim(), token)
                        : action.execute;

                    void runOrderAction(action.actionKey, callback, action.successMessage).then(() => {
                      setPendingOrderAction(null);
                      setPendingOrderReason('');
                    });
                  }}
                >
                  {activeAction === pendingOrderAction.actionKey ? 'Confirmando...' : 'Confirmar'}
                </S.PrimaryButton>
              </S.ModalActions>
            </S.ModalBox>
        </S.ModalOverlay>
      ) : null}

      {showLicensingApprovalModal ? (
        <S.ModalOverlay role="dialog" aria-modal="true" aria-label="Cadastro aprovado">
          <S.ModalBox>
            <S.ModalHeader>
              <div>
                <S.ModalTitle>Cadastro aprovado</S.ModalTitle>
                <S.ModalSubtitle>
                  A Nexor aprovou seu cadastro de {licenseeNoun} Biteplaner. Agora realize o pagamento para liberar
                  o curso de licenciamento e, depois, a prova.
                </S.ModalSubtitle>
              </div>
              <S.ModalCloseButton
                type="button"
                aria-label="Fechar aprovação do cadastro"
                onClick={() => setShowLicensingApprovalModal(false)}
              >
                <X size={16} aria-hidden />
              </S.ModalCloseButton>
            </S.ModalHeader>
            <S.ModalActions>
              <S.PrimaryButton type="button" onClick={() => setShowLicensingApprovalModal(false)}>
                Entendi
              </S.PrimaryButton>
            </S.ModalActions>
          </S.ModalBox>
        </S.ModalOverlay>
      ) : null}

      {selectedInviteLink ? (
        <S.ModalOverlay
          role="dialog"
          aria-modal="true"
          aria-label="Visualizar link individual"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedInviteLink(null);
            }
          }}
        >
          <S.ModalBox>
            <S.ModalHeader>
              <div>
                <S.ModalTitle>Visualizar link individual</S.ModalTitle>
                <S.ModalSubtitle>
                  {selectedInviteLink.intendedCustomerName ?? 'Cliente qualificado'} pode receber este acesso por QR code,
                  e-mail ou WhatsApp.
                </S.ModalSubtitle>
              </div>
              <S.ModalCloseButton
                type="button"
                aria-label="Fechar modal do link"
                onClick={() => {
                  setSelectedInviteLink(null);
                }}
              >
                <X size={16} aria-hidden />
              </S.ModalCloseButton>
            </S.ModalHeader>

            <S.QrShell>
              <DemoQrCode value={inviteLinkUrl} />
              <S.QrCaption>QR code de apresentação</S.QrCaption>
            </S.QrShell>

            <S.ModalField>
              <S.ModalLabel>Link individual</S.ModalLabel>
              <S.LinkPreview value={inviteLinkUrl} readOnly aria-label="Link individual do parceiro" />
            </S.ModalField>

            <S.ModalActions>
              <S.ActionButton
                type="button"
                onClick={() => {
                  void navigator.clipboard.writeText(inviteLinkUrl).then(() => {
                    setNotice('Link copiado para compartilhar com o cliente.');
                  });
                }}
              >
                <Copy size={14} aria-hidden />
                Copiar link
              </S.ActionButton>
              <S.ActionHref href={emailHref}>
                <Mail size={14} aria-hidden />
                Enviar por e-mail
              </S.ActionHref>
              <S.ActionHref href={whatsappHref} target="_blank" rel="noreferrer">
                <MessageCircle size={14} aria-hidden />
                Enviar por WhatsApp
              </S.ActionHref>
            </S.ModalActions>
          </S.ModalBox>
        </S.ModalOverlay>
      ) : null}

      {selectedTimelineOrder ? (
        <S.ModalOverlay
          role="dialog"
          aria-modal="true"
          aria-label="Atualizacoes da ordem"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedTimelineOrderId(null);
            }
          }}
        >
          <S.ModalBox>
            <S.ModalHeader>
              <div>
                <S.ModalTitle>Atualizacoes da ordem {selectedTimelineOrder.id}</S.ModalTitle>
                <S.ModalSubtitle>
                  Historico resumido da jornada operacional deste pedido no fluxo compartilhado.
                </S.ModalSubtitle>
              </div>
              <S.ModalCloseButton
                type="button"
                aria-label="Fechar modal das atualizacoes"
                onClick={() => {
                  setSelectedTimelineOrderId(null);
                }}
              >
                <X size={16} aria-hidden />
              </S.ModalCloseButton>
            </S.ModalHeader>

            <S.SimpleTableWrap>
              <S.SimpleTable>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Status</th>
                    <th>Descricao</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedTimelineEvents.length > 0 ? (
                    selectedTimelineEvents.map((event) => (
                      <tr key={event.id}>
                        <td>{formatDate(event.createdAt)}</td>
                        <td>{event.toStatus}</td>
                        <td>{event.reason ?? '-'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3}>Nenhuma atualização registrada para está ordem.</td>
                    </tr>
                  )}
                </tbody>
              </S.SimpleTable>
            </S.SimpleTableWrap>
          </S.ModalBox>
        </S.ModalOverlay>
      ) : null}

      {selectedDocumentationOrder ? (
        <S.ModalOverlay
          role="dialog"
          aria-modal="true"
          aria-label="Formulário de Solicitação de Produção"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedDocumentationOrderId(null);
            }
          }}
        >
          <S.DocumentationModalBox>
            <S.ModalHeader>
              <div>
                <S.ModalTitle>Formulário de Solicitação de Produção</S.ModalTitle>
                <S.ModalSubtitle>
                  Ordem {selectedDocumentationOrder.id} - {selectedDocumentationOrder.customer?.full_name ?? 'Paciente demo'}.
                </S.ModalSubtitle>
              </div>
              <S.ModalCloseButton
                type="button"
                aria-label="Fechar documentação"
                onClick={() => {
                  setSelectedDocumentationOrderId(null);
                }}
              >
                <X size={16} aria-hidden />
              </S.ModalCloseButton>
            </S.ModalHeader>

            {selectedDocumentationOrder.productionRequestDraft ? (
              <S.DocumentationGrid>
                <S.DocumentationItem>
                  <S.DocumentationLabel>Resumo da anamnese</S.DocumentationLabel>
                  <S.DocumentationValue>{selectedDocumentationOrder.productionRequestDraft.anamnesisSummary}</S.DocumentationValue>
                </S.DocumentationItem>
                <S.DocumentationItem>
                  <S.DocumentationLabel>Solicitação de produção</S.DocumentationLabel>
                  <S.DocumentationValue>{selectedDocumentationOrder.productionRequestDraft.productionRequestSummary}</S.DocumentationValue>
                </S.DocumentationItem>
                <S.DocumentationItem>
                  <S.DocumentationLabel>Orientações ao laboratório</S.DocumentationLabel>
                  <S.DocumentationValue>{selectedDocumentationOrder.productionRequestDraft.labNotes || '-'}</S.DocumentationValue>
                </S.DocumentationItem>
                <S.DocumentationItem>
                  <S.DocumentationLabel>LGPD e retencao</S.DocumentationLabel>
                  <S.DocumentationValue>
                    {selectedDocumentationOrder.productionRequestDraft.lgpdConfirmed ? 'Confirmado pelo dentista' : 'Pendente'}
                  </S.DocumentationValue>
                </S.DocumentationItem>
                <S.DocumentationItem>
                  <S.DocumentationLabel>Anamnese baixada</S.DocumentationLabel>
                  <S.DocumentationValue>
                    {selectedDocumentationOrder.productionRequestDraft.anamnesisDownloaded ? 'Sim' : 'Não'}
                  </S.DocumentationValue>
                </S.DocumentationItem>
                <S.DocumentationItem>
                  <S.DocumentationLabel>Laboratório selecionado</S.DocumentationLabel>
                  <S.DocumentationValue>{selectedDocumentationOrder.productionRequestDraft.selectedLabId ?? 'Não informado'}</S.DocumentationValue>
                </S.DocumentationItem>
                <S.DocumentationItem>
                  <S.DocumentationLabel>Escaneamento 3D</S.DocumentationLabel>
                  {selectedDocumentationOrder.productionRequestDraft.scan3dFileName ? (
                    <S.DocumentationDownloadLink
                      href={buildProductionAttachmentHref(selectedDocumentationOrder.productionRequestDraft.scan3dFileName)}
                      download={selectedDocumentationOrder.productionRequestDraft.scan3dFileName}
                      aria-label={`Baixar Escaneamento 3D ${selectedDocumentationOrder.productionRequestDraft.scan3dFileName}`}
                    >
                      <Download size={14} aria-hidden />
                      {selectedDocumentationOrder.productionRequestDraft.scan3dFileName}
                    </S.DocumentationDownloadLink>
                  ) : (
                    <S.DocumentationValue>Não anexado</S.DocumentationValue>
                  )}
                </S.DocumentationItem>
                <S.DocumentationItem>
                  <S.DocumentationLabel>Prescrição</S.DocumentationLabel>
                  {selectedDocumentationOrder.productionRequestDraft.prescriptionFileName ? (
                    <S.DocumentationDownloadLink
                      href={buildProductionAttachmentHref(selectedDocumentationOrder.productionRequestDraft.prescriptionFileName)}
                      download={selectedDocumentationOrder.productionRequestDraft.prescriptionFileName}
                      aria-label={`Baixar Prescrição ${selectedDocumentationOrder.productionRequestDraft.prescriptionFileName}`}
                    >
                      <Download size={14} aria-hidden />
                      {selectedDocumentationOrder.productionRequestDraft.prescriptionFileName}
                    </S.DocumentationDownloadLink>
                  ) : (
                    <S.DocumentationValue>Não anexada</S.DocumentationValue>
                  )}
                </S.DocumentationItem>
              </S.DocumentationGrid>
            ) : (
              <S.EmptyState>Nenhum formulário de solicitação de produção foi enviado para está ordem.</S.EmptyState>
            )}
          </S.DocumentationModalBox>
        </S.ModalOverlay>
      ) : null}
    </S.Page>
  );
}
