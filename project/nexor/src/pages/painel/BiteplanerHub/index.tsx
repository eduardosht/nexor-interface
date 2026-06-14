import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bell,
  Check,
  ChevronRight,
  ClipboardList,
  Clock3,
  Copy,
  Download,
  ExternalLink,
  Eye,
  FileText,
  Flag,
  ListChecks,
  Mail,
  MessageCircle,
  PartyPopper,
  QrCode,
  RefreshCw,
  Stethoscope,
  User,
  UserRound,
  X,
  XCircle
} from 'lucide-react';
import { SkeletonPage } from '../../../components/Skeleton';
import {
  DataTable,
  Field,
  Snackbar,
  SnackbarStack,
  StatusIndicator,
  Chip,
  type DataTableColumn,
} from '@nexor/design-system';
import { useAuth } from '../../../hooks/useAuth';
import * as S from './styles';
import {
  completeLabProduction,
  fetchAppointments,
  fetchOrderForm,
  fetchOrderForms,
  fetchOrders,
  fetchTimeline,
  fetchWorkflowForm,
  fetchWorkflowForms,
  receiveProduct as confirmProductReceived,
  returnOrderToDentist as returnToDentist,
  startLabProduction,
} from '../../../features/biteplaner/orders/orders.api';
import {
  createPartnerInviteLink,
  fetchPartnerOverview,
} from '../../../features/biteplaner/partners/partner.api';
import {
  confirmDentistLicensingPayment,
  fetchAccessOptions,
  fetchDentistLicensing,
  fetchLabLicensing,
  signDentistLicensingContract,
  signLabLicensingContract,
  submitDentistLicensingTest,
  submitLabLicensingTest,
  updateDentistLicensingCourseProgress,
  updateLabLicensingCourseProgress,
} from '../../../features/biteplaner/licensing/licensing.api';
import { fetchLicensedLabs } from '../../../features/biteplaner/labs/labs.api';
import {
  PartnerDashboardChart,
} from '../../../features/biteplaner/hub/partnerDashboard';
import { MODE_COPY, MODE_TAB_ICONS } from '../../../features/biteplaner/hub/hubModeConfig';
import type { LicensedLabSelectionApiRecord } from '../../../features/biteplaner/labs/labs.types';
import type {
  AccessOption,
  DentistLicensingResponse,
  DentistLicensingWorkflow,
} from '../../../features/biteplaner/licensing/licensing.types';
import type { PartnerOverviewResponse } from '../../../features/biteplaner/partners/partner.types';
import {
  acceptInitialConsultation,
  completeAdaptation,
  confirmAppointmentByDentist,
  confirmAppointmentByUser,
  createAppointment,
  formatDate,
  getAthleteNextPath,
  getAthletePrimaryOrder,
  getAuthToken,
  getEffectiveAthleteOrder,
  getOrderDisplayId,
  getOrderStatusPresentation,
  getStageLabel,
  markAccountNotificationRead,
  PERSONA_MODE,
  registerClinicalDecision,
  updateAppointment,
  type AccessMode,
  type DemoAppointment,
  type DemoOrderSummary,
  type DemoTimelineEvent,
  type DemoWorkflowForm,
  type ExternalFileReference,
  type ProductionRequestDraft,
} from '../../../features/demo/biteplanerFlow';
import { mapProductionRequestPayload } from '../../../features/biteplaner/production/productionRequestPayload';
import { PendingFeedbackPrompt } from '../components/PendingFeedbackPrompt';





















































type PartnerDashboardPeriod = 'week' | 'month' | 'year' | 'all';

const PARTNER_DASHBOARD_PERIODS: Array<{ key: PartnerDashboardPeriod; label: string }> = [
  { key: 'week', label: 'Semana' },
  { key: 'month', label: 'Mês' },
  { key: 'year', label: 'Ano' },
  { key: 'all', label: 'Tudo' },
];

const FIRST_ACCESS_MODE_PRIORITY: AccessMode[] = ['lab', 'dentist', 'partner', 'user'];

export function getFirstAccessMode(access: { defaultMode: AccessMode; modes: AccessOption[] }): AccessMode {
  return (
    FIRST_ACCESS_MODE_PRIORITY.find((modeKey) =>
      access.modes.some((mode) => mode.key === modeKey && mode.allowed)
    ) ?? access.defaultMode
  );
}

function getValidDate(value?: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getTimeValue(value?: string | null) {
  return getValidDate(value)?.getTime() ?? 0;
}

function sortByDateDesc<T>(items: T[], getDate: (item: T) => string | null | undefined) {
  return [...items].sort((left, right) => getTimeValue(getDate(right)) - getTimeValue(getDate(left)));
}

function sortOrdersByLatestFirst(orders: DemoOrderSummary[]) {
  return sortByDateDesc(orders, (order) => order.created_at);
}

function sortTimelineEventsByLatestFirst(events: DemoTimelineEvent[]) {
  return sortByDateDesc(events, (event) => event.createdAt);
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
  if (status === 'follow_up' || status === 'completed') {
    return 'success';
  }

  if (
    status === 'registration_started' ||
    status === 'awaiting_payment' ||
    status === 'awaiting_dentist_forms' ||
    status === 'awaiting_scheduling' ||
    status === 'dentist_adjustment_required' ||
    status === 'awaiting_adaptation'
  ) {
    return 'warning';
  }

  if (status === 'lab_processing' || status === 'in_progress') {
    return 'warning';
  }

  return 'neutral';
}

const TIMELINE_STATUS_LABELS: Record<string, string> = {
  seeded: 'Ordem criada',
  registration_started: 'Cadastro iniciado',
  awaiting_scheduling: 'Aguardando agendamento',
  in_progress: 'Consulta em andamento',
  awaiting_dentist_acceptance: 'Aguardando aceite do dentista',
  appointment_confirmed: 'Consulta confirmada',
  treatment_required: 'Tratamento prévio necessário',
  awaiting_payment: 'Aguardando pagamento',
  awaiting_dentist_forms: 'Formulários do dentista pendentes',
  ineligible_reassessment: 'Inaptidão',
  awaiting_lab_start: 'Aguardando aceite do laboratório',
  lab_processing: 'Em produção',
  dentist_adjustment_required: 'Ajuste de produção',
  product_received_by_clinic: 'Aguardando recebimento pelo dentista',
  awaiting_adaptation: 'Aguardando adaptação',
  follow_up: 'Acompanhamento em andamento',
  completed: 'Finalizado',
  cancelled: 'Jornada cancelada',
};

const TIMELINE_REASON_DESCRIPTIONS: Record<string, string> = {
  order_created: 'Pedido criado para iniciar a jornada Biteplaner.',
  customer_pre_consultation_intake_submitted:
    'Cliente concluiu o pre-requisito e liberou a escolha do local de atendimento.',
  scheduling_released: 'Pagamento confirmado e etapa de escolha do local de atendimento liberada.',
  practice_location_selected_by_customer:
    'Cliente informou que combinou a consulta fora da plataforma; a ordem agora aguarda aceite do dentista.',
  practice_location_selected_by_customer_backfill:
    'Consulta informada pelo cliente foi sincronizada para aguardar aceite do dentista.',
  initial_consultation_accepted_by_dentist:
    'Dentista aceitou a consulta informada pelo cliente e a ordem entrou em acompanhamento clínico inicial.',
  initial_consultation_linked_by_dentist:
    'Dentista vinculou a consulta inicial à ordem e liberou a preparação clínica.',
  attendance_match_completed:
    'Paciente e dentista confirmaram que a consulta aconteceu; a ordem está pronta para decisão clínica.',
  appointment_no_show_reported:
    'Dentista registrou não comparecimento; a ordem voltou para escolha ou confirmação de consulta.',
  clinical_eligibility_confirmed:
    'Dentista declarou o cliente apto para seguir com o Biteplaner.',
  payment_confirmed: 'Pagamento confirmado pela operação.',
  stripe_checkout_completed: 'Pagamento confirmado pelo checkout.',
  production_request_created: 'Dentista criou a solicitação de produção.',
  product_received: 'Produto recebido pelo dentista ou local de atendimento.',
  adaptation_completed: 'Adaptação concluída e ordem finalizada.',
  follow_up_completed: 'Ciclo de acompanhamento concluído.',
  account_deletion_approved:
    'Jornada interrompida por remoção de conta aprovada pela Nexor. A ordem foi cancelada e não foi gerado ressarcimento automático.',
  pre_lab_requirements_missing:
    'A ordem ainda possui pendências antes de ser enviada ao laboratório.',
};

const TIMELINE_TRANSITION_DESCRIPTIONS: Record<string, string> = {
  'registration_started->awaiting_scheduling':
    'Pre-requisito concluído; cliente pode escolher o local da consulta inicial.',
  'payment_confirmed->awaiting_scheduling':
    'Ordem liberada para escolha do local de atendimento.',
  'awaiting_scheduling->awaiting_dentist_acceptance':
    'Cliente informou consulta agendada e o dentista precisa aceitar no workspace.',
  'awaiting_dentist_acceptance->in_progress':
    'Dentista aceitou a consulta e a etapa clínica inicial ficou em andamento.',
  'awaiting_scheduling->in_progress':
    'Consulta inicial vinculada e etapa clínica inicial em andamento.',
  'in_progress->appointment_confirmed':
    'Comparecimento confirmado; ordem aguarda decisão clínica.',
  'in_progress->ineligible_reassessment':
    'Dentista registrou inaptidão momentânea; cliente pode marcar uma nova consulta para reavaliação.',
  'appointment_confirmed->ineligible_reassessment':
    'Dentista registrou inaptidão momentânea; cliente pode marcar uma nova consulta para reavaliação.',
  'appointment_confirmed->awaiting_payment':
    'Cliente declarado apto; pagamento do produto foi liberado.',
  'awaiting_payment->payment_confirmed':
    'Pagamento do produto foi confirmado.',
  'awaiting_payment->awaiting_dentist_forms':
    'Pagamento confirmado; dentista precisa finalizar a documentação de produção.',
  'appointment_confirmed->awaiting_lab_start':
    'Ordem enviada para aceite do laboratório.',
  'awaiting_dentist_forms->awaiting_lab_start':
    'Documentação finalizada e pedido enviado para a fila do laboratório.',
  'awaiting_lab_start->lab_processing':
    'Laboratório aceitou a ordem e iniciou a produção do Biteplaner.',
  'lab_processing->product_received_by_clinic':
    'Laboratório concluiu a produção e entregou o produto ao dentista/local.',
  'lab_processing->dentist_adjustment_required':
    'Laboratório solicitou ajuste de produção antes de continuar.',
  'dentist_adjustment_required->awaiting_lab_start':
    'Dentista reenviou a solicitação de produção ajustada para aceite do laboratório.',
  'product_received_by_clinic->awaiting_adaptation':
    'Dentista confirmou recebimento do produto; adaptação foi liberada.',
  'awaiting_adaptation->completed':
    'Adaptação concluída; jornada finalizada.',
  'follow_up->completed': 'Acompanhamento concluído e jornada encerrada.',
};

function getTimelineStatusLabel(status: string) {
  if (TIMELINE_STATUS_LABELS[status]) {
    return TIMELINE_STATUS_LABELS[status];
  }

  return status
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ');
}

function getTimelineEventDescription(event: DemoTimelineEvent) {
  if (event.reason && TIMELINE_REASON_DESCRIPTIONS[event.reason]) {
    return TIMELINE_REASON_DESCRIPTIONS[event.reason];
  }

  const transitionKey = `${event.fromStatus ?? 'start'}->${event.toStatus}`;

  if (TIMELINE_TRANSITION_DESCRIPTIONS[transitionKey]) {
    return TIMELINE_TRANSITION_DESCRIPTIONS[transitionKey];
  }

  if (event.fromStatus === null) {
    return `A ordem entrou em ${getTimelineStatusLabel(event.toStatus).toLowerCase()}.`;
  }

  if (event.reason && !/^[a-z0-9_.:-]+$/i.test(event.reason)) {
    return event.reason;
  }

  return `Status alterado de ${getTimelineStatusLabel(event.fromStatus).toLowerCase()} para ${getTimelineStatusLabel(event.toStatus).toLowerCase()}.`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function getDentistPayloadFromWorkflowForm(form: DemoWorkflowForm) {
  const payload = isRecord(form.payload) ? form.payload : {};

  return isRecord(payload.dentist) ? payload.dentist : payload;
}

function isSubmittedIneligiblePreConsultationForm(form: DemoWorkflowForm) {
  if (form.templateKey !== 'customer_pre_consultation_intake') {
    return false;
  }

  const dentistPayload = getDentistPayloadFromWorkflowForm(form);

  return (
    form.status === 'submitted' &&
    form.roleState?.dentist === 'submitted' &&
    dentistPayload.biteplannerEligible === 'no'
  );
}

function getEffectiveDentistOrder(order: DemoOrderSummary, workflowForms: DemoWorkflowForm[] | undefined) {
  const hasIneligibleAssessment = workflowForms?.some(isSubmittedIneligiblePreConsultationForm) ?? false;

  if (!hasIneligibleAssessment || order.status === 'ineligible_reassessment') {
    return order;
  }

  return {
    ...order,
    status: 'ineligible_reassessment',
    statusLabel: 'Inaptidão',
    stage: 'awaiting_initial_consultation',
  };
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

export function isLegacyLicensedLabStatus(mode: AccessMode | null, status?: string | null) {
  return (mode === 'lab' || mode === 'dentist') && status === 'approved_pending_payment';
}

export function getDentistLicensingStatusLabel(mode: AccessMode | null, status?: string | null) {
  if (status === 'licensed') {
    return 'Licenciado';
  }

  if (isLegacyLicensedLabStatus(mode, status)) {
    return 'Licenciado';
  }

  if (status === 'admin_rejected' || status === 'distrato_signed') {
    return 'Encerrado';
  }

  if (status) {
    return 'Processo de licenciamento';
  }

  return 'Sem processo de licenciamento';
}

function getLicenseeNoun(mode: AccessMode | null) {
  return mode === 'lab' ? 'laboratório' : 'dentista';
}

function getLicenseePlural(mode: AccessMode | null) {
  return mode === 'lab' ? 'laboratórios' : 'dentistas';
}

export function getDentistLicensingStatusTone(
  mode: AccessMode | null,
  status?: string | null
): 'success' | 'warning' | 'neutral' {
  if (status === 'licensed' || isLegacyLicensedLabStatus(mode, status)) {
    return 'success';
  }

  if (status) {
    return 'warning';
  }

  return 'neutral';
}

function getOperationalRoleStatusLabel(status?: string | null) {
  if (status === 'active') {
    return 'Aprovado';
  }

  if (status === 'pending') {
    return 'Aguardando análise';
  }

  if (status === 'rejected') {
    return 'Encerrado';
  }

  if (status === 'suspended') {
    return 'Suspenso';
  }

  return 'Sem processo de licenciamento';
}

function getOperationalRoleStatusTone(status?: string | null): 'success' | 'warning' | 'neutral' {
  if (status === 'active') {
    return 'success';
  }

  if (status === 'pending') {
    return 'warning';
  }

  return 'neutral';
}

function buildCertificateHref(workflow: DentistLicensingWorkflow | null) {
  const issuedAt = workflow?.certificateIssuedAt ? formatDate(workflow.certificateIssuedAt) : 'data não informada';
  return `data:text/plain;charset=utf-8,${encodeURIComponent(`Certificado Biteplaner\nStatus: Licenciado\nEmitido em: ${issuedAt}`)}`;
}

function getOneYearAgo(referenceDate = new Date()) {
  const date = new Date(referenceDate);
  date.setFullYear(date.getFullYear() - 1);
  date.setHours(0, 0, 0, 0);
  return date;
}

function isWithinLastYear(value?: string | null, referenceDate = new Date()) {
  const date = getValidDate(value);

  if (!date) {
    return false;
  }

  return date >= getOneYearAgo(referenceDate) && date <= referenceDate;
}

function escapeXml(value: unknown) {
  return String(value ?? 'Não informado')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getPartnerInviteStatusLabel(status: string) {
  if (status === 'active') {
    return 'Ativo';
  }

  if (status === 'expired') {
    return 'Expirado';
  }

  if (status === 'consumed') {
    return 'Consumido';
  }

  return status || 'Não informado';
}

function getPartnerLeadOrderStatusLabel(lead: PartnerOverviewResponse['leads'][number]) {
  return lead.orderStatus ?? lead.statusLabel ?? 'Pedido ativo';
}

function getPartnerOrderLifecycleLabel(lead: PartnerOverviewResponse['leads'][number]) {
  const status = getPartnerLeadOrderStatusLabel(lead).toLowerCase();

  if (status.includes('finalizado') || status.includes('completed') || status.includes('acompanhamento')) {
    return 'Finalizado';
  }

  return 'Ativo';
}

function getPartnerReportRows(partnerOverview: PartnerOverviewResponse | null, referenceDate = new Date()) {
  const inviteLinks = (partnerOverview?.inviteLinks ?? []).filter((inviteLink) =>
    isWithinLastYear(inviteLink.created_at, referenceDate)
  );
  const linkIds = new Set(inviteLinks.map((inviteLink) => inviteLink.id));
  const orderLeads = (partnerOverview?.leads ?? []).filter(
    (lead) =>
      linkIds.has(lead.partnerLinkId) &&
      (lead.funnelStage === 'order_advanced' || lead.funnelStage === 'pre_requisite_completed')
  );
  const generatedAt = formatDate(referenceDate.toISOString());

  return [
    ['Relatório do parceiro - últimos 12 meses'],
    [`Gerado em ${generatedAt}`],
    [],
    ['Links gerados'],
    ['Token', 'Status', 'Cliente', 'E-mail', 'Gerado em', 'Expira em', 'Consumido em', 'ID do link'],
    ...inviteLinks.map((inviteLink) => [
      inviteLink.token,
      getPartnerInviteStatusLabel(inviteLink.status),
      inviteLink.intendedCustomerName ?? 'Não informado',
      inviteLink.intendedCustomerEmail ?? 'Não informado',
      formatDate(inviteLink.created_at),
      inviteLink.expires_at ? formatDate(inviteLink.expires_at) : 'Não informado',
      inviteLink.consumed_at ? formatDate(inviteLink.consumed_at) : 'Não informado',
      inviteLink.id,
    ]),
    [],
    ['Pedidos ativos e finalizados'],
    ['Pedido', 'Ciclo', 'Status do pedido', 'Cliente', 'E-mail', 'Telefone', 'Link de origem', 'Originado em'],
    ...orderLeads.map((lead) => [
      lead.orderId,
      getPartnerOrderLifecycleLabel(lead),
      getPartnerLeadOrderStatusLabel(lead),
      lead.customerName,
      lead.customerEmail,
      lead.customerPhone ?? 'Não informado',
      lead.partnerLinkId,
      formatDate(lead.created_at),
    ]),
  ];
}

function getColumnName(index: number) {
  let columnName = '';
  let value = index + 1;

  while (value > 0) {
    const remainder = (value - 1) % 26;
    columnName = `${String.fromCharCode(65 + remainder)}${columnName}`;
    value = Math.floor((value - 1) / 26);
  }

  return columnName;
}

function buildWorksheetXml(rows: string[][]) {
  const xmlRows = rows.map((row, rowIndex) => {
    const rowNumber = rowIndex + 1;
    const cells = row.map((cell, columnIndex) => (
      `<c r="${getColumnName(columnIndex)}${rowNumber}" t="inlineStr"><is><t>${escapeXml(cell)}</t></is></c>`
    ));

    return `<row r="${rowNumber}">${cells.join('')}</row>`;
  });

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>${xmlRows.join('')}</sheetData>
</worksheet>`;
}

const CRC_TABLE = Array.from({ length: 256 }, (_, index) => {
  let value = index;

  for (let bit = 0; bit < 8; bit += 1) {
    value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  }

  return value >>> 0;
});

function crc32(bytes: Uint8Array) {
  let crc = 0xffffffff;

  for (const byte of bytes) {
    crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function writeUint16(output: number[], value: number) {
  output.push(value & 0xff, (value >>> 8) & 0xff);
}

function writeUint32(output: number[], value: number) {
  output.push(value & 0xff, (value >>> 8) & 0xff, (value >>> 16) & 0xff, (value >>> 24) & 0xff);
}

function writeBytes(output: number[], bytes: Uint8Array) {
  output.push(...bytes);
}

function encodeText(value: string) {
  return new TextEncoder().encode(value);
}

function createZip(files: Array<{ name: string; content: string }>) {
  const output: number[] = [];
  const centralDirectory: number[] = [];
  const entries = files.map((file) => ({
    ...file,
    nameBytes: encodeText(file.name),
    contentBytes: encodeText(file.content),
  }));

  for (const entry of entries) {
    const localHeaderOffset = output.length;
    const checksum = crc32(entry.contentBytes);

    writeUint32(output, 0x04034b50);
    writeUint16(output, 20);
    writeUint16(output, 0);
    writeUint16(output, 0);
    writeUint16(output, 0);
    writeUint16(output, 0);
    writeUint32(output, checksum);
    writeUint32(output, entry.contentBytes.length);
    writeUint32(output, entry.contentBytes.length);
    writeUint16(output, entry.nameBytes.length);
    writeUint16(output, 0);
    writeBytes(output, entry.nameBytes);
    writeBytes(output, entry.contentBytes);

    writeUint32(centralDirectory, 0x02014b50);
    writeUint16(centralDirectory, 20);
    writeUint16(centralDirectory, 20);
    writeUint16(centralDirectory, 0);
    writeUint16(centralDirectory, 0);
    writeUint16(centralDirectory, 0);
    writeUint16(centralDirectory, 0);
    writeUint32(centralDirectory, checksum);
    writeUint32(centralDirectory, entry.contentBytes.length);
    writeUint32(centralDirectory, entry.contentBytes.length);
    writeUint16(centralDirectory, entry.nameBytes.length);
    writeUint16(centralDirectory, 0);
    writeUint16(centralDirectory, 0);
    writeUint16(centralDirectory, 0);
    writeUint16(centralDirectory, 0);
    writeUint32(centralDirectory, 0);
    writeUint32(centralDirectory, localHeaderOffset);
    writeBytes(centralDirectory, entry.nameBytes);
  }

  const centralDirectoryOffset = output.length;
  output.push(...centralDirectory);
  writeUint32(output, 0x06054b50);
  writeUint16(output, 0);
  writeUint16(output, 0);
  writeUint16(output, entries.length);
  writeUint16(output, entries.length);
  writeUint32(output, centralDirectory.length);
  writeUint32(output, centralDirectoryOffset);
  writeUint16(output, 0);

  return new Uint8Array(output);
}

export function buildPartnerReportWorkbook(partnerOverview: PartnerOverviewResponse | null, referenceDate = new Date()) {
  const worksheetXml = buildWorksheetXml(getPartnerReportRows(partnerOverview, referenceDate));

  return createZip([
    {
      name: '[Content_Types].xml',
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>`,
    },
    {
      name: '_rels/.rels',
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`,
    },
    {
      name: 'xl/workbook.xml',
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets><sheet name="Relatório" sheetId="1" r:id="rId1"/></sheets>
</workbook>`,
    },
    {
      name: 'xl/_rels/workbook.xml.rels',
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>`,
    },
    {
      name: 'xl/worksheets/sheet1.xml',
      content: worksheetXml,
    },
  ]);
}

function downloadPartnerReport(partnerOverview: PartnerOverviewResponse | null) {
  const referenceDate = new Date();
  const workbook = buildPartnerReportWorkbook(partnerOverview, referenceDate);
  const blob = new Blob([workbook], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const filenameDate = referenceDate.toISOString().slice(0, 10);

  link.href = url;
  link.download = `relatorio-parceiro-biteplaner-${filenameDate}.xlsx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
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
type WorkflowFormMap = Record<string, DemoWorkflowForm[]>;

type QueueActionConfig = {
  id: string;
  title: string;
  ariaLabel: string;
  testId: string;
  icon: ReactNode;
  tone?: 'neutral' | 'success' | 'danger' | 'warning' | 'info';
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

function getAttachmentFileName(fileName: string, fileRef?: ExternalFileReference | null) {
  return fileName || fileRef?.fileName || '';
}

function formatAttachmentSize(sizeBytes?: number | null) {
  if (!sizeBytes || sizeBytes <= 0) {
    return 'Tamanho não informado';
  }

  if (sizeBytes < 1024) {
    return `${sizeBytes} bytes`;
  }

  if (sizeBytes < 1024 * 1024) {
    return `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(sizeBytes / 1024)} KB`;
  }

  return `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(sizeBytes / (1024 * 1024))} MB`;
}

function getLatestLabAdjustmentEvent(events: DemoTimelineEvent[]) {
  return sortTimelineEventsByLatestFirst(events).find((event) => event.toStatus === 'dentist_adjustment_required') ?? null;
}

function getAdjustmentReason(event: DemoTimelineEvent | null) {
  if (event?.reason && !/^[a-z0-9_.:-]+$/i.test(event.reason)) {
    return event.reason;
  }

  return 'O laboratório solicitou ajustes nos informativos de produção antes de continuar.';
}

function getProductionRequestLabId(order: DemoOrderSummary | null, draft: ProductionRequestDraft | null) {
  return order?.lab_profile_id ?? draft?.selectedLabId ?? null;
}

function findLicensedLabByProductionRequest(
  labs: LicensedLabSelectionApiRecord[],
  order: DemoOrderSummary | null,
  draft: ProductionRequestDraft | null
) {
  const labId = getProductionRequestLabId(order, draft);

  if (!labId) {
    return null;
  }

  return labs.find((lab) => lab.profileId === labId || lab.id === labId) ?? null;
}

function formatOrderDentist(order: DemoOrderSummary) {
  return order.dentist?.full_name || order.dentist?.email || 'Não informado';
}

function normalizeBrazilianPhone(phone?: string | null) {
  const digits = (phone ?? '').replace(/\D/g, '');

  if (!digits) {
    return '';
  }

  return digits.startsWith('55') ? digits : `55${digits}`;
}

function formatBrazilianPhone(phone?: string | null) {
  const digits = (phone ?? '').replace(/\D/g, '');

  if (!digits) {
    return '';
  }

  const nationalDigits = digits.startsWith('55') && digits.length > 11 ? digits.slice(2) : digits;

  if (nationalDigits.length === 11) {
    return `(${nationalDigits.slice(0, 2)}) ${nationalDigits.slice(2, 7)}-${nationalDigits.slice(7)}`;
  }

  if (nationalDigits.length === 10) {
    return `(${nationalDigits.slice(0, 2)}) ${nationalDigits.slice(2, 6)}-${nationalDigits.slice(6)}`;
  }

  return phone?.trim() ?? '';
}

function buildAdaptationWhatsAppUrl(order: DemoOrderSummary, customerPhone?: string) {
  const customerName = order.customer?.full_name?.trim() || 'cliente';
  const phone = normalizeBrazilianPhone(customerPhone || getOrderCustomerPhone(order));
  const message =
    `Olá, ${customerName}. Aqui é o dentista responsável pelo seu Biteplaner. ` +
    'Podemos combinar uma data para a consulta de adaptação e entrega? ' +
    'Por favor, me envie algumas opções de data e horário.';
  const params = new URLSearchParams({ text: message });

  if (phone) {
    params.set('phone', phone);
  }

  return `https://web.whatsapp.com/send?${params.toString()}`;
}

function getOrderCustomerPhone(order: DemoOrderSummary | null) {
  if (!order) {
    return '';
  }

  const extendedOrder = order as DemoOrderSummary & {
    user?: { phone?: string | null } | null;
    user_profile?: { phone?: string | null } | null;
    customerPhone?: string | null;
    customer_phone?: string | null;
  };

  return (
    order.customer?.phone ||
    extendedOrder.user?.phone ||
    extendedOrder.user_profile?.phone ||
    extendedOrder.customerPhone ||
    extendedOrder.customer_phone ||
    ''
  );
}

function getStringFromRecord(record: Record<string, unknown> | null | undefined, keys: string[]) {
  if (!record) {
    return '';
  }

  for (const key of keys) {
    const value = record[key];

    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }

  return '';
}

function extractCustomerPhoneFromWorkflowPayload(payload: Record<string, unknown> | null | undefined) {
  if (!payload) {
    return '';
  }

  const customer = payload.customer;
  const customerPayload =
    customer !== null && typeof customer === 'object' && !Array.isArray(customer)
      ? (customer as Record<string, unknown>)
      : null;

  return (
    getStringFromRecord(customerPayload, ['phone', 'telefone', 'phoneNumber', 'customerPhone']) ||
    getStringFromRecord(payload, ['phone', 'telefone', 'customerPhone', 'customer_phone'])
  );
}

function toDateTimeLocalValue(value?: string | null) {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const pad = (input: number) => input.toString().padStart(2, '0');

  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate())
  ].join('-') + `T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function dateTimeLocalValueToIso(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toISOString();
}

function getLatestAdaptationAppointmentFromList(list: DemoAppointment[] | undefined) {
  return [...(list ?? [])]
    .filter((appointment) => appointment.type === 'adaptation' && appointment.status !== 'cancelled')
    .sort((left, right) => Date.parse(right.scheduled_at) - Date.parse(left.scheduled_at))[0] ?? null;
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
  const { session, demoPersona } = useAuth();
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
  const [workflowFormsByOrder, setWorkflowFormsByOrder] = useState<WorkflowFormMap>({});
  const [activeAction, setActiveAction] = useState('');
  const [qualifiedCustomerName, setQualifiedCustomerName] = useState('');
  const [qualifiedCustomerEmail, setQualifiedCustomerEmail] = useState('');
  const [selectedInviteLink, setSelectedInviteLink] = useState<PartnerOverviewResponse['inviteLinks'][number] | null>(null);
  const [selectedTimelineOrderId, setSelectedTimelineOrderId] = useState<string | null>(null);
  const [dentistStatusFilters, setDentistStatusFilters] = useState<string[]>([]);
  const [labStatusFilters, setLabStatusFilters] = useState<string[]>([]);
  const [pendingOrderAction, setPendingOrderAction] = useState<QueueActionConfig | null>(null);
  const [pendingOrderReason, setPendingOrderReason] = useState('');
  const [selectedAdjustmentOrderId, setSelectedAdjustmentOrderId] = useState<string | null>(null);
  const [selectedAdaptationOrderId, setSelectedAdaptationOrderId] = useState<string | null>(null);
  const [adaptationCustomerPhones, setAdaptationCustomerPhones] = useState<Record<string, string>>({});
  const [adaptationScheduledAt, setAdaptationScheduledAt] = useState('');
  const [licensedLabs, setLicensedLabs] = useState<LicensedLabSelectionApiRecord[]>([]);
  const [selectedDocumentationOrderId, setSelectedDocumentationOrderId] = useState<string | null>(null);
  const [selectedProductionRequestDraft, setSelectedProductionRequestDraft] = useState<ProductionRequestDraft | null>(null);
  const [productionRequestLoading, setProductionRequestLoading] = useState(false);
  const [productionRequestError, setProductionRequestError] = useState('');
  const [dentistLicensing, setDentistLicensing] = useState<DentistLicensingResponse | null>(null);
  const [dentistLicensingLoading, setDentistLicensingLoading] = useState(false);
  const [showLicensingApprovalModal, setShowLicensingApprovalModal] = useState(false);
  const [licensingApprovalNotificationId, setLicensingApprovalNotificationId] = useState<string | null>(null);
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
      return getFirstAccessMode(access);
    }

    return fallbackMode;
  }, [access, fallbackMode, requestedMode]);
  const dentistOrders = useMemo(
    () =>
      selectedMode === 'dentist'
        ? orders.map((order) => getEffectiveDentistOrder(order, workflowFormsByOrder[order.id]))
        : orders,
    [orders, selectedMode, workflowFormsByOrder]
  );

  async function fetchOperationalWorkspace(activeMode: AccessMode) {
    if (activeMode === 'partner') {
      return {
        orders: [],
        partnerOverview: await fetchPartnerOverview(token),
        appointments: {} as AppointmentMap,
        timeline: {} as TimelineMap,
        workflowForms: {} as WorkflowFormMap,
      };
    }

    const ordersResponse = await fetchOrders(activeMode, token);

    async function fetchOrderRelations(targetOrders: DemoOrderSummary[]) {
      const [appointmentEntries, timelineEntries, workflowFormEntries] = await Promise.all([
        Promise.all(
          targetOrders.map(async (order) => [
            order.id,
            (await fetchAppointments(order.id, token)).appointments
          ] as const)
        ),
        Promise.all(
          targetOrders.map(async (order) => [
            order.id,
            (await fetchTimeline(order.id, token)).events
          ] as const)
        ),
        activeMode === 'user' || activeMode === 'dentist'
          ? Promise.all(
              targetOrders
                .filter((order) => activeMode === 'user' || order.status === 'in_progress')
                .map(async (order) => [
                  order.id,
                  await fetchWorkflowForms(order.id, token)
                    .then((response) => (Array.isArray(response.forms) ? response.forms : []))
                    .catch((error) => {
                      if (activeMode === 'dentist') {
                        return [];
                      }

                      throw error;
                    })
                ] as const)
            )
          : Promise.resolve([] as Array<readonly [string, DemoWorkflowForm[]]>),
      ]);

      return {
        appointments: Object.fromEntries(appointmentEntries) as AppointmentMap,
        timeline: Object.fromEntries(timelineEntries) as TimelineMap,
        workflowForms: Object.fromEntries(workflowFormEntries) as WorkflowFormMap,
      };
    }

    const relations = await fetchOrderRelations(ordersResponse.orders);

    if (activeMode === 'dentist') {
      const dueOrders = ordersResponse.orders.filter((order) => {
        if (order.status !== 'awaiting_adaptation') {
          return false;
        }

        const appointment = getLatestAdaptationAppointmentFromList(relations.appointments[order.id]);
        return appointment ? Date.parse(appointment.scheduled_at) <= Date.now() : false;
      });

      if (dueOrders.length > 0) {
        await Promise.all(dueOrders.map((order) => completeAdaptation(order.id, token)));
        const refreshedOrdersResponse = await fetchOrders(activeMode, token);
        const refreshedRelations = await fetchOrderRelations(refreshedOrdersResponse.orders);

        return {
          orders: refreshedOrdersResponse.orders,
          partnerOverview: null,
          ...refreshedRelations,
        };
      }
    }

    return {
      orders: ordersResponse.orders,
      partnerOverview: null,
      ...relations,
    };
  }

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
          setSearchParams({ mode: getFirstAccessMode(response) });
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
        const workspace = await fetchOperationalWorkspace(activeMode);

        if (!active) {
          return;
        }

        setOrders(workspace.orders);
        setPartnerOverview(workspace.partnerOverview);
        setAppointments(workspace.appointments);
        setTimeline(workspace.timeline);
        setWorkflowFormsByOrder(workspace.workflowForms);
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

        const approvalNotification = response.notifications.find((notification) =>
          /cadastro aprovado/i.test(notification.title) && notification.read !== true
        );
        if (approvalNotification) {
          setLicensingApprovalNotificationId(approvalNotification.id);
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

  useEffect(() => {
    const productionRequestOrderId = selectedDocumentationOrderId ?? selectedAdjustmentOrderId;

    if (!productionRequestOrderId) {
      setSelectedProductionRequestDraft(null);
      setProductionRequestError('');
      setProductionRequestLoading(false);
      return;
    }

    const documentationOrderId = productionRequestOrderId;
    const order = orders.find((item) => item.id === productionRequestOrderId) ?? null;

    if (order?.productionRequestDraft) {
      setSelectedProductionRequestDraft(order.productionRequestDraft);
      setProductionRequestError('');
      setProductionRequestLoading(false);
      return;
    } else {
      setSelectedProductionRequestDraft(null);
    }

    if (!token) {
      setProductionRequestLoading(false);
      return;
    }

    let active = true;
    setProductionRequestLoading(true);
    setProductionRequestError('');

    async function loadProductionRequest() {
      try {
        const formsResponse = await fetchOrderForms(documentationOrderId, token);
        const productionForm = formsResponse.forms
          .filter((form) => form.type === 'production_request')
          .sort((a, b) => b.version - a.version || Date.parse(b.created_at) - Date.parse(a.created_at))[0];

        if (!productionForm) {
          if (active && !order?.productionRequestDraft) {
            setProductionRequestError('Nenhum formulário de produção foi encontrado para esta ordem.');
          }
          return;
        }

        const formDetail = await fetchOrderForm(documentationOrderId, productionForm.id, token);

        if (active) {
          setSelectedProductionRequestDraft(mapProductionRequestPayload(formDetail.payload ?? {}));
        }
      } catch {
        if (active && !order?.productionRequestDraft) {
          setProductionRequestError('Não foi possível carregar os dados enviados pelo dentista.');
        }
      } finally {
        if (active) {
          setProductionRequestLoading(false);
        }
      }
    }

    void loadProductionRequest();

    return () => {
      active = false;
    };
  }, [orders, selectedAdjustmentOrderId, selectedDocumentationOrderId, token]);

  useEffect(() => {
    if (!token || selectedMode !== 'dentist' || !selectedAdjustmentOrderId) {
      if (!selectedAdjustmentOrderId) {
        setLicensedLabs([]);
      }
      return;
    }

    let active = true;

    async function loadLicensedLabs() {
      try {
        const response = await fetchLicensedLabs(token);

        if (active) {
          setLicensedLabs(response.labs);
        }
      } catch {
        if (active) {
          setLicensedLabs([]);
        }
      }
    }

    void loadLicensedLabs();

    return () => {
      active = false;
    };
  }, [selectedAdjustmentOrderId, selectedMode, token]);

  async function refreshWorkspace() {
    if (!token || !selectedMode || selectedMode === 'admin') {
      return;
    }

    const workspace = await fetchOperationalWorkspace(selectedMode);
    setOrders(workspace.orders);
    setPartnerOverview(workspace.partnerOverview);
    setAppointments(workspace.appointments);
    setTimeline(workspace.timeline);
    setWorkflowFormsByOrder(workspace.workflowForms);
  }

  async function refreshDentistLicensing() {
    if (!token || (selectedMode !== 'dentist' && selectedMode !== 'lab')) {
      return;
    }

    const response = selectedMode === 'lab' ? await fetchLabLicensing(token) : await fetchDentistLicensing(token);
    setDentistLicensing(response);
  }

  async function dismissLicensingApprovalModal() {
    const notificationId = licensingApprovalNotificationId;
    setShowLicensingApprovalModal(false);
    setLicensingApprovalNotificationId(null);

    if (!notificationId) {
      return;
    }

    try {
      await markAccountNotificationRead(notificationId, token);
      setDentistLicensing((current) =>
        current
          ? {
              ...current,
              notifications: current.notifications.map((notification) =>
                notification.id === notificationId ? { ...notification, read: true } : notification
              ),
            }
          : current
      );
    } catch {
      // If the read-state update fails, keep the modal dismissed in the current session.
    }
  }

  async function hydrateAdaptationCustomerPhone(order: DemoOrderSummary) {
    if (getOrderCustomerPhone(order) || adaptationCustomerPhones[order.id]) {
      return;
    }

    try {
      const formsResponse = await fetchWorkflowForms(order.id, token);
      const preConsultationForm = formsResponse.forms.find(
        (form) => form.templateKey === 'customer_pre_consultation_intake' && form.canViewPayload
      );

      if (!preConsultationForm) {
        return;
      }

      const formDetail = await fetchWorkflowForm(order.id, preConsultationForm.id, token);
      const phone = extractCustomerPhoneFromWorkflowPayload(formDetail.payload);

      if (phone) {
        setAdaptationCustomerPhones((current) => ({ ...current, [order.id]: phone }));
      }
    } catch {
      // The modal remains usable even when historical intake contact data is unavailable.
    }
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

  async function handleSaveAdaptationSchedule() {
    const order = selectedAdaptationOrderId ? orders.find((item) => item.id === selectedAdaptationOrderId) ?? null : null;
    const scheduledAt = dateTimeLocalValueToIso(adaptationScheduledAt);

    if (!order || !scheduledAt) {
      setError('Informe uma data válida para o retorno de adaptação.');
      return;
    }

    const existingAppointment = getLatestAdaptationAppointmentFromList(appointments[order.id]);
    const actionKey = `${order.id}:schedule-adaptation`;
    const isDue = Date.parse(scheduledAt) <= Date.now();

    setActiveAction(actionKey);
    setNotice('');
    setError('');

    try {
      if (existingAppointment) {
        await updateAppointment(
          order.id,
          existingAppointment.id,
          { status: 'rescheduled', scheduledAt },
          token
        );
      } else {
        await createAppointment(order.id, { type: 'adaptation', scheduledAt }, token);
      }

      if (isDue) {
        await completeAdaptation(order.id, token);
      }

      await refreshWorkspace();
      setSelectedAdaptationOrderId(null);
      setAdaptationScheduledAt('');
      setNotice(
        isDue
          ? `${getOrderLabel(order)} foi finalizado após a data de adaptação.`
          : `${getOrderLabel(order)} teve o retorno de adaptação agendado.`
      );
    } catch {
      setError('Não foi possível salvar o retorno de adaptação agora.');
    } finally {
      setActiveAction('');
    }
  }

  const currentCopy = selectedMode ? MODE_COPY[selectedMode] : null;
  const athleteRawOrder = getAthletePrimaryOrder(orders);
  const athleteOrder = getEffectiveAthleteOrder(
    athleteRawOrder,
    athleteRawOrder ? workflowFormsByOrder[athleteRawOrder.id] ?? [] : []
  );
  const athleteNextPath = athleteOrder ? getAthleteNextPath(athleteOrder) : '#';
  const athleteNextStepLabel = athleteOrder
    ? athleteNextPath === '/painel/biteplaner/onboarding'
      ? 'concluir o cadastro Biteplaner'
      : athleteNextPath === '/painel/consulta-inicial'
        ? 'escolher a clínica da consulta inicial'
      : athleteNextPath === '/painel/compra'
        ? 'confirmar a compra mock'
        : 'acompanhar a jornada completa'
    : 'aguardar o próximo caso';

  const athleteStats = [
    {
      label: 'Jornada Biteplaner',
      value: athleteOrder ? 'Ativa' : 'Não iniciada',
      hint: athleteOrder
        ? `Jornada do atleta ${getOrderLabel(athleteOrder)}.`
        : 'O cliente inicia uma única jornada Biteplaner neste momento.',
      icon: <FileText size={22} aria-hidden />,
      tone: 'blue' as const
    },
    {
      label: 'Status principal',
      value: athleteOrder?.statusLabel ?? 'Sem jornada',
      hint: athleteOrder ? `Status atual da jornada ${getOrderLabel(athleteOrder)}.` : 'Nenhuma jornada ativa identificada.',
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

  const partnerInviteLinks = partnerOverview?.inviteLinks ?? [];
  const partnerLeads = partnerOverview?.leads ?? [];
  const partnerSummary = partnerOverview?.summary ?? { leadsCaptured: 0, convertedToAccount: 0, activeOrders: 0, finishedOrders: 0 };
  const partnerStats = selectedMode === 'partner'
    ? [
        {
          label: 'Contas criadas',
          value: String(partnerSummary.convertedToAccount),
          hint: 'Leads que efetivamente viraram conta na Nexor.',
          icon: <UserRound size={24} aria-hidden />,
          tone: 'green' as const
        },
        {
          label: 'Pedidos ativos',
          value: String(partnerSummary.activeOrders),
          hint: 'Clientes indicados que preencheram o onboarding e chegaram na etapa de pré-consulta.',
          icon: <ClipboardList size={24} aria-hidden />,
          tone: 'purple' as const
        },
        {
          label: 'Pedidos finalizados',
          value: String(partnerSummary.finishedOrders ?? 0),
          hint: 'Pedidos indicados que chegaram ao acompanhamento ou foram finalizados.',
          icon: <Flag size={24} aria-hidden />,
          tone: 'blue' as const
        }
      ]
    : [];
  const partnerDashboardReferenceDate = useMemo(() => {
    const dates = [
      ...partnerInviteLinks.map((inviteLink) => getValidDate(inviteLink.created_at)),
      ...partnerLeads.map((lead) => getValidDate(lead.created_at)),
    ].filter((date): date is Date => date !== null);

    if (dates.length === 0) {
      return new Date();
    }

    return new Date(Math.max(...dates.map((date) => date.getTime())));
  }, [partnerInviteLinks, partnerLeads]);
  const partnerDashboardRows = (() => {
        const filteredInviteLinks = partnerInviteLinks.filter((inviteLink) =>
          isWithinPartnerDashboardPeriod(inviteLink.created_at, partnerDashboardPeriod, partnerDashboardReferenceDate)
        );
        const filteredLeads = partnerLeads.filter((lead) =>
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
      })();
  const partnerDashboardPeriodLabel =
    PARTNER_DASHBOARD_PERIODS.find((period) => period.key === partnerDashboardPeriod)?.label ?? 'Mês';

  const operationalStats = [
    {
      label: 'Pedidos visiveis',
      value: String(orders.length),
      hint: 'Fila compartilhada do modo atual.',
      icon: <ClipboardList size={28} aria-hidden />,
      tone: 'purple' as const
    },
    {
      label: 'Pendencias ativas',
      value: String(
        orders.filter((order) =>
          selectedMode === 'dentist'
            ? ['awaiting_dentist_acceptance', 'in_progress', 'appointment_confirmed', 'treatment_required', 'awaiting_payment', 'awaiting_dentist_forms', 'dentist_adjustment_required', 'product_received_by_clinic'].includes(order.status)
            : ['awaiting_lab_start', 'lab_processing', 'awaiting_adaptation'].includes(order.status)
        ).length
      ),
      hint: 'Itens que ainda dependem de uma ação do perfil atual.',
      icon: <Bell size={28} aria-hidden />,
      tone: 'amber' as const
    },
    {
      label: 'Atualizados hoje',
      value: String(
        Object.values(timeline).reduce((count, events) => count + events.slice(0, 1).length, 0)
      ),
      hint: 'Indicador simples para leitura rapida durante a apresentação.',
      icon: <RefreshCw size={28} aria-hidden />,
      tone: 'blue' as const
    }
  ];

  const dentistWorkflow = dentistLicensing?.workflow ?? null;
  const labOperationalFallback = selectedMode === 'lab' && demoPersona === 'lab' && dentistWorkflow === null;
  const dentistIsLicensed =
    dentistWorkflow?.status === 'licensed' ||
    isLegacyLicensedLabStatus(selectedMode, dentistWorkflow?.status) ||
    labOperationalFallback;
  const isLicensingActorMode = selectedMode === 'dentist' || selectedMode === 'lab';
  const currentModeAccessAllowed = Boolean(access?.modes.some((mode) => mode.key === selectedMode && mode.allowed));
  const operationalAccessApproved = isLicensingActorMode && currentModeAccessAllowed;
  const canOperateLicensingActor = dentistIsLicensed || operationalAccessApproved;
  const licenseeNoun = getLicenseeNoun(selectedMode);
  const licenseePlural = getLicenseePlural(selectedMode);
  const dentistWorkspaceLoading = isLicensingActorMode && (loading || dentistLicensingLoading);
  const showDentistLicensingPanel =
    isLicensingActorMode && !dentistWorkspaceLoading && isLicensingRoute && dentistWorkflow !== null && !dentistIsLicensed;
  const showDentistLicensedPanel = isLicensingActorMode && !dentistWorkspaceLoading && isLicensingRoute && dentistIsLicensed;
  const showDentistLockedPanel = isLicensingActorMode && !dentistWorkspaceLoading && !isLicensingRoute && !canOperateLicensingActor;
  const showOperationalPanel =
    isLicensingActorMode && !dentistWorkspaceLoading && !isLicensingRoute && canOperateLicensingActor;
  const showDentistLicensingTabs = !(isLicensingActorMode && isLicensingRoute);
  const showOnlyDentistPayment = false;
  const showDentistCourseFlow = Boolean(dentistWorkflow) && !showOnlyDentistPayment;
  const showFinalLicensingContract = dentistWorkflow?.status === 'licensing_contract_pending' && dentistWorkflow.testPassed;
  const showDistratoAction = dentistWorkflow?.status === 'distrato_pending';
  const dentistStatusLabel = getDentistLicensingStatusLabel(selectedMode, dentistWorkflow?.status);
  const dentistStatusTone = getDentistLicensingStatusTone(selectedMode, dentistWorkflow?.status);
  const currentAccessMode = access?.modes.find((mode) => mode.key === selectedMode);
  const workspaceStatusLabel = selectedMode === 'user' ? 'Jornada ativa' : 'Status licenciamento';
  const workspaceStatusValue =
    selectedMode === 'user'
      ? athleteOrder?.id ?? 'BP-DEMO-005'
      : isLicensingActorMode
        ? dentistStatusLabel
        : getOperationalRoleStatusLabel(currentAccessMode?.status);
  const workspaceStatusTone =
    selectedMode === 'user'
      ? 'success'
      : isLicensingActorMode
        ? dentistStatusTone
        : getOperationalRoleStatusTone(currentAccessMode?.status);
  const allWorkflowForms = useMemo(
    () => Object.values(workflowFormsByOrder).flat(),
    [workflowFormsByOrder]
  );
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
      render: (row) => {
        const isActive = row.status === 'active';
        const actionTarget = row.intendedCustomerName ?? row.token;

        return (
          <S.IconActionButton
            type="button"
            aria-label={
              isActive
                ? `Visualizar link ${actionTarget}`
                : `Visualizar link indisponível ${actionTarget}`
            }
            disabled={!isActive}
            title={isActive ? 'Visualizar link individual' : 'Disponível apenas para links ativos'}
            onClick={() => {
              if (isActive) {
                setSelectedInviteLink(row);
              }
            }}
          >
            <Eye size={16} aria-hidden />
          </S.IconActionButton>
        );
      }
    }
  ];

  const partnerOrderRows = useMemo(
    () =>
      sortByDateDesc(
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
        (row) => row.order?.created_at ?? row.createdAt
      ),
    [orders, partnerOverview]
  );

  const partnerOrderColumns: DataTableColumn<(typeof partnerOrderRows)[number]>[] = [
    {
      key: 'order',
      label: 'Pedido',
      width: '9%',
      render: (row) => (row.order ? getOrderLabel(row.order) : 'Pedido sincronizando')
    },
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
      render: (row) => (row.order ? renderStagePill(row.order) : <S.StagePill>Aguardando atualização</S.StagePill>)
    },
    { key: 'created', label: 'Originado em', render: (row) => formatDate(row.createdAt) }
  ];

  function renderOrderStatus(order: DemoOrderSummary) {
    const presentation = getOrderStatusPresentation(order);

    return <StatusIndicator color={presentation.color} label={presentation.label} />;
  }

  function getOrderLabel(order: DemoOrderSummary) {
    return getOrderDisplayId(order);
  }

  function renderStagePill(order: DemoOrderSummary) {
    return <S.StagePill>{getStageLabel(order)}</S.StagePill>;
  }

  function getPreConsultationReviewAction(order: DemoOrderSummary): QueueActionConfig {
    const orderLabel = getOrderLabel(order);

    return {
      id: `${order.id}:production-wizard`,
      title: 'Complementar pre-consulta',
      ariaLabel: `Complementar pre-consulta da ordem ${orderLabel}`,
      testId: 'dentist-order-action-open-pre-consultation-review',
      icon: <Stethoscope size={15} aria-hidden />,
      tone: 'neutral',
      confirmTitle: 'Complementar pre-consulta',
      confirmDescription: `Abra a avaliacao inicial compartilhada da ordem ${orderLabel} para complementar os dados clinicos e gerar a anamnese.`,
      actionKey: `${order.id}:production-wizard`,
      successMessage: '',
      execute: async () => undefined
    };
  }

  function getDentistActionConfigs(order: DemoOrderSummary): QueueActionConfig[] {
    const orderLabel = getOrderLabel(order);

    if (order.status === 'awaiting_dentist_acceptance') {
      return [
        {
          id: `${order.id}:accept-initial-consultation`,
          title: 'Aceitar consulta agendada',
          ariaLabel: `Aceitar consulta agendada da ordem ${orderLabel}`,
          testId: 'dentist-order-action-accept-consultation',
          icon: <Check size={15} aria-hidden />,
          tone: 'success',
          confirmTitle: 'Aceitar consulta agendada',
          confirmDescription: `Deseja aceitar a consulta agendada da ordem ${orderLabel}? A ordem só continua depois desse aceite do dentista.`,
          actionKey: `${order.id}:accept-initial-consultation`,
          successMessage: `${orderLabel} foi aceita pelo dentista e agora aguarda confirmação de realização.`,
          execute: () => acceptInitialConsultation(order.id, token)
        }
      ];
    }

    if (order.status === 'in_progress') {
      const appointment = appointments[order.id]?.[0] ?? null;

      if (appointment?.user_confirmed_at && appointment.dentist_confirmed_at) {
        return [getPreConsultationReviewAction(order)];
      }

      if (!appointment || appointment.dentist_confirmed_at) {
        return [];
      }

      return [
        {
          id: `${order.id}:dentist-confirmation`,
          title: 'Confirmar consulta realizada',
          ariaLabel: `Confirmar consulta realizada da ordem ${orderLabel}`,
          testId: 'dentist-order-action-confirm-appointment',
          icon: <Check size={15} aria-hidden />,
          tone: 'success',
          confirmTitle: 'Confirmar consulta realizada',
          confirmDescription: `Deseja confirmar que a consulta inicial da ordem ${orderLabel} foi realizada? A decisão clínica fica liberada quando paciente e dentista confirmarem o atendimento.`,
          actionKey: `${order.id}:dentist-confirmation`,
          successMessage: `${orderLabel} teve confirmação do dentista registrada.`,
          execute: () => confirmAppointmentByDentist(order.id, appointment.id, token)
        }
      ];
    }

    if (order.status === 'appointment_confirmed') {
      return [getPreConsultationReviewAction(order)];
    }

    if (order.status === 'treatment_required') {
      return [
        {
          id: `${order.id}:approve`,
          title: 'Registrar apto',
          ariaLabel: `Registrar apto da ordem ${orderLabel}`,
          testId: 'dentist-order-action-approve',
          icon: <Check size={15} aria-hidden />,
          tone: 'success',
          confirmTitle: 'Confirmar aptidão',
          confirmDescription: `Deseja registrar a ordem ${orderLabel} como apta após o tratamento prévio?`,
          actionKey: `${order.id}:approve`,
          successMessage: `${orderLabel} foi aprovado clinicamente na demo.`,
          execute: () => registerClinicalDecision(order.id, 'eligible', token)
        },
        {
          id: `${order.id}:ineligible`,
          title: 'Registrar inapto',
          ariaLabel: `Registrar inapto da ordem ${orderLabel}`,
          testId: 'dentist-order-action-ineligible',
          icon: <XCircle size={15} aria-hidden />,
          tone: 'danger',
          confirmTitle: 'Confirmar inaptidão',
          confirmDescription: `Deseja registrar a ordem ${orderLabel} como inapta neste momento e liberar nova consulta para reavaliação?`,
          actionKey: `${order.id}:ineligible`,
          successMessage: `${orderLabel} foi marcado como inapto para reavaliação na demo.`,
          execute: () => registerClinicalDecision(order.id, 'ineligible', token)
        }
      ];
    }

    if (order.status === 'dentist_adjustment_required') {
      return [
        {
          id: `${order.id}:adjustment-details`,
          title: 'Ver detalhes',
          ariaLabel: `Ver detalhes do ajuste de produção da ordem ${orderLabel}`,
          testId: 'dentist-order-action-view-lab-adjustment',
          icon: <MessageCircle size={15} aria-hidden />,
          tone: 'warning',
          confirmTitle: 'Ver detalhes',
          confirmDescription: `Visualizar o ajuste de produção solicitado para a ordem ${orderLabel}.`,
          actionKey: `${order.id}:adjustment-details`,
          successMessage: '',
          execute: async () => undefined
        }
      ];
    }

    if (order.status === 'awaiting_dentist_forms') {
      return [
        {
          id: `${order.id}:production-wizard`,
          title: 'Abrir solicitação de produção',
          ariaLabel: `Abrir solicitação de produção da ordem ${orderLabel}`,
          testId: 'dentist-order-action-open-production-wizard',
          icon: <FileText size={15} aria-hidden />,
          tone: 'neutral',
          confirmTitle: 'Abrir solicitação de produção',
          confirmDescription: `Deseja abrir a solicitação de produção da ordem ${orderLabel} para preencher os documentos obrigatórios?`,
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
          title: 'Pedido recebido',
          ariaLabel: `Confirmar recebimento do produto da ordem ${orderLabel}`,
          testId: 'dentist-order-action-confirm-product-received',
          icon: <Check size={15} aria-hidden />,
          tone: 'success',
          confirmTitle: 'Pedido recebido',
          confirmDescription: `Deseja confirmar que o pedido da ordem ${orderLabel} foi recebido pelo dentista?`,
          actionKey: `${order.id}:received`,
          successMessage: `${orderLabel} teve recebimento confirmado e foi liberada para adaptação.`,
          execute: () => confirmProductReceived(order.id, token)
        }
      ];
    }

    if (order.status === 'awaiting_adaptation') {
      return [
        {
          id: `${order.id}:schedule-adaptation`,
          title: 'Agendar retorno',
          ariaLabel: `Agendar retorno de adaptação da ordem ${orderLabel}`,
          testId: 'dentist-order-action-schedule-adaptation',
          icon: <Clock3 size={15} aria-hidden />,
          tone: 'info',
          confirmTitle: 'Agendar retorno',
          confirmDescription: `Combine a consulta de adaptação e entrega da ordem ${orderLabel} com o cliente.`,
          actionKey: `${order.id}:schedule-adaptation`,
          successMessage: '',
          execute: async () => undefined
        }
      ];
    }

    return [];
  }

  function getLabActionConfigs(order: DemoOrderSummary): QueueActionConfig[] {
    const orderLabel = getOrderLabel(order);

    const documentationAction: QueueActionConfig = {
      id: `${order.id}:documentation`,
      title: 'Verificar documentação',
      ariaLabel: `Verificar documentação da ordem ${orderLabel}`,
      testId: 'lab-order-action-documentation',
      icon: <FileText size={15} aria-hidden />,
      tone: 'neutral',
      confirmTitle: 'Verificar documentação',
      confirmDescription: `Visualizar documentação de produção da ordem ${orderLabel}.`,
      actionKey: `${order.id}:documentation`,
      successMessage: '',
      execute: async () => undefined
    };

    if (order.status === 'awaiting_lab_start') {
      return [
        documentationAction,
        {
          id: `${order.id}:start`,
          title: 'Aprovar e iniciar produ\u00e7\u00e3o',
          ariaLabel: `Aprovar e iniciar produ\u00e7\u00e3o da ordem ${orderLabel}`,
          testId: 'lab-order-action-start',
          icon: <Check size={15} aria-hidden />,
          tone: 'success',
          confirmTitle: 'Aprovar e iniciar produ\u00e7\u00e3o',
          confirmDescription: `Deseja aprovar a ordem ${orderLabel} e iniciar a produ\u00e7\u00e3o?`,
          actionKey: `${order.id}:start`,
          successMessage: `${orderLabel} entrou em produ\u00e7\u00e3o no laborat\u00f3rio.`,
          execute: () => startLabProduction(order.id, token)
        },
        {
          id: `${order.id}:return`,
          title: 'Devolver ao dentista',
          ariaLabel: `Devolver ao dentista a ordem ${orderLabel}`,
          testId: 'lab-order-action-return',
          icon: <XCircle size={15} aria-hidden />,
          tone: 'danger',
          confirmTitle: 'Devolver para o dentista',
          confirmDescription: `Deseja devolver a ordem ${orderLabel} para ajuste do dentista?`,
          actionKey: `${order.id}:return`,
          successMessage: `${orderLabel} voltou para ajuste do dentista.`,
          execute: () => returnToDentist(order.id, 'Laborat\u00f3rio solicitou ajuste adicional na demo compartilhada.', token)
        }
      ];
    }

    if (order.status !== 'lab_processing') {
      return [];
    }

    return [
      documentationAction,
      {
        id: `${order.id}:return`,
        title: 'Devolver ao dentista',
        ariaLabel: `Devolver ao dentista a ordem ${orderLabel}`,
        testId: 'lab-order-action-return',
        icon: <XCircle size={15} aria-hidden />,
        tone: 'danger',
        confirmTitle: 'Devolver para o dentista',
        confirmDescription: `Deseja devolver a ordem ${orderLabel} para ajuste do dentista?`,
        actionKey: `${order.id}:return`,
        successMessage: `${orderLabel} voltou para ajuste do dentista.`,
        execute: () => returnToDentist(order.id, 'Laborat\u00f3rio solicitou ajuste adicional na demo compartilhada.', token)
      },
      {
        id: `${order.id}:complete`,
        title: 'Entrega para o dentista',
        ariaLabel: `Registrar entrega para o dentista da ordem ${orderLabel}`,
      testId: 'lab-order-action-complete',
      icon: <Check size={15} aria-hidden />,
      tone: 'success',
        confirmTitle: 'Entrega para o dentista',
        confirmDescription: `Deseja registrar que a produ\u00e7\u00e3o da ordem ${orderLabel} foi entregue ao dentista?`,
        actionKey: `${order.id}:complete`,
        successMessage: `${orderLabel} foi entregue ao dentista e aguarda confirma\u00e7\u00e3o de recebimento.`,
        execute: () => completeLabProduction(order.id, token)
      }
    ];
  }

  const dentistStatusOptions = useMemo(
    () =>
      Array.from(new Set(dentistOrders.map((order) => order.status))).map((status) => {
        const matchingOrder = dentistOrders.find((order) => order.status === status);
        const presentation = matchingOrder
          ? getOrderStatusPresentation(matchingOrder)
          : { label: status, color: '#737373' };

        return {
          value: status,
          label: presentation.label,
        };
      }),
    [dentistOrders]
  );

  const filteredDentistOrders = useMemo(
    () => {
      const visibleOrders =
        dentistStatusFilters.length === 0
          ? dentistOrders
          : dentistOrders.filter((order) => dentistStatusFilters.includes(order.status));

      return sortOrdersByLatestFirst(visibleOrders);
    },
    [dentistOrders, dentistStatusFilters]
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
    () => {
      const visibleOrders =
        labStatusFilters.length === 0
          ? orders
          : orders.filter((order) => labStatusFilters.includes(order.status));

      return sortOrdersByLatestFirst(visibleOrders);
    },
    [labStatusFilters, orders]
  );

  const dentistColumns: DataTableColumn<DemoOrderSummary>[] = [
    { key: 'order', label: 'Pedido', width: '9%', render: (row) => getOrderLabel(row) },
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
      render: (row) => renderStagePill(row)
    },
    {
      key: 'status',
      label: 'Status',
      width: '18%',
      render: (row) => renderOrderStatus(row)
    },
    {
      key: 'latest-event',
      label: 'Última atualização',
      width: '14%',
      render: (row) =>
        timeline[row.id]?.length ? (
          <S.TableIconButton
            type="button"
            $tone="neutral"
            aria-label={`Visualizar atualizacoes da ordem ${getOrderLabel(row)}`}
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
      width: '24%',
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
                $tone={action.tone ?? 'neutral'}
                data-testid={action.testId}
                aria-label={action.ariaLabel}
                title={action.title}
                disabled={activeAction === action.actionKey}
                onClick={() => {
                  if (action.id.endsWith(':production-wizard')) {
                    navigate(`/painel/dentista/producao/${row.id}`);
                    return;
                  }

                  if (action.id.endsWith(':adjustment-details')) {
                    setSelectedAdjustmentOrderId(row.id);
                    return;
                  }

                  if (action.id.endsWith(':schedule-adaptation')) {
                    const appointment = getLatestAdaptationAppointmentFromList(appointments[row.id]);
                    setSelectedAdaptationOrderId(row.id);
                    setAdaptationScheduledAt(toDateTimeLocalValue(appointment?.scheduled_at));
                    void hydrateAdaptationCustomerPhone(row);
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
    { key: 'order', label: 'Pedido', width: '9%', render: (row) => getOrderLabel(row) },
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
      render: (row) => formatOrderDentist(row)
    },
    {
      key: 'stage',
      label: 'Etapa',
      width: '16%',
      render: (row) => renderStagePill(row)
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
            $tone="neutral"
            aria-label={`Visualizar atualizacoes da ordem ${getOrderLabel(row)}`}
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
                $tone={action.tone ?? 'neutral'}
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
  const selectedTimelineEvents = selectedTimelineOrderId
    ? sortTimelineEventsByLatestFirst(timeline[selectedTimelineOrderId] ?? [])
    : [];
  const selectedDocumentationOrder = selectedDocumentationOrderId ? orders.find((order) => order.id === selectedDocumentationOrderId) ?? null : null;
  const productionRequestDraft = selectedProductionRequestDraft ?? selectedDocumentationOrder?.productionRequestDraft ?? null;
  const selectedAdjustmentOrder = selectedAdjustmentOrderId ? orders.find((order) => order.id === selectedAdjustmentOrderId) ?? null : null;
  const selectedAdaptationOrder = selectedAdaptationOrderId ? orders.find((order) => order.id === selectedAdaptationOrderId) ?? null : null;
  const selectedAdaptationAppointment = selectedAdaptationOrder
    ? getLatestAdaptationAppointmentFromList(appointments[selectedAdaptationOrder.id])
    : null;
  const selectedAdaptationCustomerPhone = selectedAdaptationOrder
    ? getOrderCustomerPhone(selectedAdaptationOrder) || adaptationCustomerPhones[selectedAdaptationOrder.id] || ''
    : '';
  const selectedAdaptationCustomerPhoneLabel = formatBrazilianPhone(selectedAdaptationCustomerPhone) || 'Não informado';
  const selectedAdaptationWhatsAppUrl = selectedAdaptationOrder
    ? buildAdaptationWhatsAppUrl(selectedAdaptationOrder, selectedAdaptationCustomerPhone)
    : '#';
  const selectedAdjustmentDraft = selectedAdjustmentOrder
    ? selectedProductionRequestDraft ?? selectedAdjustmentOrder.productionRequestDraft ?? null
    : null;
  const selectedAdjustmentEvent = selectedAdjustmentOrderId
    ? getLatestLabAdjustmentEvent(timeline[selectedAdjustmentOrderId] ?? [])
    : null;
  const selectedAdjustmentLab = findLicensedLabByProductionRequest(
    licensedLabs,
    selectedAdjustmentOrder,
    selectedAdjustmentDraft
  );
  const selectedAdjustmentLabAddress = selectedAdjustmentLab
    ? [selectedAdjustmentLab.address, selectedAdjustmentLab.city, selectedAdjustmentLab.state].filter(Boolean).join(' - ')
    : '';
  const productionScanFileName = productionRequestDraft
    ? getAttachmentFileName(productionRequestDraft.scan3dFileName, productionRequestDraft.scan3dFileRef)
    : '';
  const productionPrescriptionFileName = productionRequestDraft
    ? getAttachmentFileName(productionRequestDraft.prescriptionFileName, productionRequestDraft.prescriptionFileRef)
    : '';
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
  const hasAthletePendingAppointmentConfirmation = Boolean(
    athleteOrder?.status === 'in_progress' &&
    athleteAppointment &&
    !athleteAppointment.user_confirmed_at
  );
  const CurrentModeIcon = selectedMode ? MODE_TAB_ICONS[selectedMode] ?? User : User;
  const showWorkspaceHero = selectedMode !== 'admin';

  return (
    <S.Page>
      {
        <S.Hero $showcase={showWorkspaceHero} $mode={selectedMode ?? undefined}>
          <S.HeroCopy>
            <S.Eyebrow>Biteplaner</S.Eyebrow>
            <S.Title $showcase={showWorkspaceHero}>{currentCopy?.title ?? 'Biteplaner'}</S.Title>
            <S.Description $showcase={showWorkspaceHero}>
              {selectedMode === 'admin'
                ? 'A narrativa transversal do produto continua no painel administrativo, com filtros e pipeline completo.'
                : currentCopy?.description ?? 'Selecione um modo para visualizar o fluxo compartilhado da demo.'}
            </S.Description>
          </S.HeroCopy>
          {showWorkspaceHero ? (
            <S.HeroVisual
              aria-hidden="true"
              data-testid={selectedMode === 'user' ? 'athlete-hero-visual' : `${selectedMode ?? 'workspace'}-hero-visual`}
            >
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
                  <S.HeroChartPoint $left="88%" $top="38%" $active $mode={selectedMode ?? undefined} />
                </S.HeroBrowserBody>
              </S.HeroBrowser>
              <S.HeroFloatingCard>
                <S.HeroFloatingIcon $mode={selectedMode ?? undefined} $tone={workspaceStatusTone}>
                  {selectedMode === 'user' ? <Check size={20} aria-hidden /> : <CurrentModeIcon size={20} aria-hidden />}
                </S.HeroFloatingIcon>
                <span>
                  {workspaceStatusLabel}
                  <strong>
                    {selectedMode === 'user' ? null : (
                      <S.DentistStatusDot
                        $tone={workspaceStatusTone}
                        aria-hidden="true"
                        data-testid="dentist-status-dot"
                        data-tone={workspaceStatusTone}
                      />
                    )}
                    {workspaceStatusValue}
                  </strong>
                </span>
              </S.HeroFloatingCard>
            </S.HeroVisual>
          ) : null}
        </S.Hero>
      }

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

      {selectedMode ? (
        <PendingFeedbackPrompt mode={selectedMode} orders={orders} forms={allWorkflowForms} />
      ) : null}

      {access && showDentistLicensingTabs ? (
        <S.RoleTabs aria-label="Alternar modo de acesso Biteplaner">
          {access.modes.filter((mode) => mode.allowed).map((mode) => {
            const Icon = MODE_TAB_ICONS[mode.key] ?? User;
            const isActive = (selectedMode ?? access.defaultMode) === mode.key;

            return (
              <S.RoleTabButton
                key={mode.key}
                type="button"
                $active={isActive}
                aria-pressed={isActive}
                onClick={() => { setSearchParams({ mode: mode.key }); }}
              >
                <Icon size={20} aria-hidden />
                {mode.label}
              </S.RoleTabButton>
            );
          })}
        </S.RoleTabs>
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
                    <S.OrderTitle>{getOrderLabel(athleteOrder)}</S.OrderTitle>
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
                {/*
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
                      null
                    )}
                  </S.ActionRow>
                */}
              </S.AthleteOrderHighlight>
            ) : (
              <S.EmptyState data-testid="athlete-onboarding-empty-state">
                <p>Você ainda não iniciou sua jornada Biteplaner.</p>
                <S.PrimaryLink to="/painel/biteplaner/onboarding">
                  Iniciar onboarding
                  <ChevronRight size={16} aria-hidden />
                </S.PrimaryLink>
              </S.EmptyState>
            )}
          </S.AthleteCasePanel>

          {athleteOrder && athleteAppointment && hasAthletePendingAppointmentConfirmation ? (
            <S.AthletePendingActionsPanel data-testid="athlete-pending-actions">
              <S.AthletePendingActionsCopy>
                <S.PanelTitle>Acoes pendentes do usuario</S.PanelTitle>
                <S.PanelText>
                  Confirme que a consulta agendada foi realizada para liberar a validacao conjunta com o dentista.
                </S.PanelText>
              </S.AthletePendingActionsCopy>
              <S.AthletePendingActionButton
                type="button"
                disabled={activeAction === `${athleteOrder.id}:user-confirmation`}
                onClick={() => {
                  void runOrderAction(
                    `${athleteOrder.id}:user-confirmation`,
                    () => confirmAppointmentByUser(athleteOrder.id, athleteAppointment.id, token),
                    'Sua confirmacao de consulta realizada foi registrada.'
                  );
                }}
              >
                <Check size={18} aria-hidden />
                <span>Confirmar consulta realizada</span>
              </S.AthletePendingActionButton>
            </S.AthletePendingActionsPanel>
          ) : null}
        </>
      ) : null}

      {!loading && selectedMode === 'partner' ? (
        <>
          <S.PartnerStatsGrid>
            {partnerStats.map((stat) => (
              <S.PartnerStatCard key={stat.label} $tone={stat.tone}>
                <S.PartnerStatIcon $tone={stat.tone}>{stat.icon}</S.PartnerStatIcon>
                <S.PartnerStatContent>
                  <S.StatLabel>{stat.label}</S.StatLabel>
                  <S.StatValue>{stat.value}</S.StatValue>
                  <S.StatHint>{stat.hint}</S.StatHint>
                </S.PartnerStatContent>
              </S.PartnerStatCard>
            ))}
          </S.PartnerStatsGrid>

          <S.PartnerDashboardGrid>
            <PartnerDashboardChart
              rows={partnerDashboardRows}
              activePeriod={partnerDashboardPeriod}
              periodLabel={partnerDashboardPeriodLabel}
              onPeriodChange={setPartnerDashboardPeriod}
            />

            <S.PartnerOperationPanel>
              <S.PanelHeader>
                <S.PartnerPanelTitleGroup>
                  <S.PartnerPanelIcon $tone="purple">
                    <QrCode size={22} aria-hidden />
                  </S.PartnerPanelIcon>
                  <S.PanelTitle>Operação do parceiro</S.PanelTitle>
                </S.PartnerPanelTitleGroup>
                <S.PanelText>
                  A geração de QR code, URL individual e lista de indicações fica concentrada no submenu Indicar.
                </S.PanelText>
              </S.PanelHeader>
              <S.PartnerActionCards>
                <S.PartnerActionCardPrimary to="/painel/biteplaner/indicar?mode=partner">
                  <S.PartnerActionIcon $dark>
                    <QrCode size={24} aria-hidden />
                  </S.PartnerActionIcon>
                  <strong>Abrir Indicar</strong>
                  <S.PartnerActionText>Gere links, QR codes e acompanhe suas indicações.</S.PartnerActionText>
                  <ArrowRight size={22} aria-hidden />
                </S.PartnerActionCardPrimary>
                <S.PartnerActionCard to="/painel/biteplaner/avaliacoes?mode=partner">
                  <S.PartnerActionIcon>
                    <BarChart3 size={24} aria-hidden />
                  </S.PartnerActionIcon>
                  <strong>Ver avaliações</strong>
                  <S.PartnerActionText>Veja o desempenho das suas indicações e conversões.</S.PartnerActionText>
                  <ArrowRight size={22} aria-hidden />
                </S.PartnerActionCard>
                <S.PartnerActionButton type="button" onClick={() => downloadPartnerReport(partnerOverview)}>
                  <S.PartnerActionIcon>
                    <Download size={24} aria-hidden />
                  </S.PartnerActionIcon>
                  <strong>Download do relatório</strong>
                  <S.PartnerActionText>
                    Exporte em Excel os links gerados no último ano, com status e pedidos ativos ou finalizados.
                  </S.PartnerActionText>
                  <Download size={22} aria-hidden />
                </S.PartnerActionButton>
              </S.PartnerActionCards>
            </S.PartnerOperationPanel>
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
                      () => confirmDentistLicensingPayment(token),
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
            <S.PanelTitle>Conteúdo liberado apenas para {licenseePlural} aprovados</S.PanelTitle>
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
          <S.OperationalStatsGrid>
            {operationalStats.map((stat) => (
              <S.OperationalStatCard key={stat.label} $tone={stat.tone}>
                <S.OperationalStatIcon $tone={stat.tone}>{stat.icon}</S.OperationalStatIcon>
                <S.OperationalStatContent>
                  <S.StatLabel>{stat.label}</S.StatLabel>
                  <S.StatValue>{stat.value}</S.StatValue>
                  <S.StatHint>{stat.hint}</S.StatHint>
                </S.OperationalStatContent>
              </S.OperationalStatCard>
            ))}
          </S.OperationalStatsGrid>

          <S.OperationalPanel>
            {selectedMode === 'dentist' ? (
              <S.OperationalPanelHeader>
                <S.PartnerPanelIcon $tone="purple">
                  <ListChecks size={22} aria-hidden />
                </S.PartnerPanelIcon>
                <span>
                  <S.PanelTitle>Fila operacional do dentista</S.PanelTitle>
                  <S.PanelText>
                    Ordens com consulta agendada pelo cliente aparecem aqui já vinculadas ao dentista aprovado. A
                    realização da consulta ainda precisa do match de confirmação entre paciente e dentista.
                  </S.PanelText>
                </span>
              </S.OperationalPanelHeader>
            ) : (
              <S.OperationalPanelHeader>
                <S.PartnerPanelIcon $tone="purple">
                  <ListChecks size={22} aria-hidden />
                </S.PartnerPanelIcon>
                <span>
                  <S.PanelTitle>Fila operacional do laboratório</S.PanelTitle>
                  <S.PanelText>
                    Cada ação abaixo modifica o mesmo conjunto de pedidos e deve refletir nas outras personas da demo.
                  </S.PanelText>
                </span>
              </S.OperationalPanelHeader>
            )}

            {selectedMode === 'dentist' ? (
              <S.OperationalTableShell data-testid="dentist-queue-table">
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
              </S.OperationalTableShell>
            ) : (
              <S.OperationalTableShell data-testid="lab-queue-table">
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
              </S.OperationalTableShell>
            )}
          </S.OperationalPanel>
        </>
      ) : null}

      {selectedAdaptationOrder ? (
        <S.ModalOverlay
          role="dialog"
          aria-modal="true"
          aria-label="Agendar retorno"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedAdaptationOrderId(null);
              setAdaptationScheduledAt('');
            }
          }}
        >
          <S.DocumentationModalBox>
            <S.ModalHeader>
              <div>
                <S.ModalTitle>Agendar retorno</S.ModalTitle>
                <S.ModalSubtitle>
                  Entre em contato com o cliente para combinar a consulta de adaptação e entrega do Biteplaner.
                </S.ModalSubtitle>
              </div>
              <S.ModalCloseButton
                type="button"
                aria-label="Fechar agendamento de retorno"
                onClick={() => {
                  setSelectedAdaptationOrderId(null);
                  setAdaptationScheduledAt('');
                }}
              >
                <X size={16} aria-hidden />
              </S.ModalCloseButton>
            </S.ModalHeader>

            <S.DocumentationGrid>
              <S.DocumentationItem>
                <S.DocumentationLabel>Cliente</S.DocumentationLabel>
                <S.DocumentationValue>{selectedAdaptationOrder.customer?.full_name || 'Não informado'}</S.DocumentationValue>
              </S.DocumentationItem>
              <S.DocumentationItem>
                <S.DocumentationLabel>Telefone</S.DocumentationLabel>
                <S.DocumentationValueRow>
                  <S.DocumentationValue>{selectedAdaptationCustomerPhoneLabel}</S.DocumentationValue>
                  <S.DocumentationIconLink
                    href={selectedAdaptationWhatsAppUrl}
                    target="_blank"
                    rel="noreferrer"
                    title="Abrir WhatsApp"
                    aria-label="Abrir WhatsApp para agendar retorno"
                  >
                    <MessageCircle size={16} aria-hidden />
                  </S.DocumentationIconLink>
                </S.DocumentationValueRow>
              </S.DocumentationItem>
              <S.DocumentationItem>
                <S.DocumentationLabel>E-mail</S.DocumentationLabel>
                <S.DocumentationValue>{selectedAdaptationOrder.customer?.email || 'Não informado'}</S.DocumentationValue>
              </S.DocumentationItem>
              <S.DocumentationItem>
                <S.DocumentationLabel>Retorno atual</S.DocumentationLabel>
                <S.DocumentationValue>
                  {selectedAdaptationAppointment ? formatDate(selectedAdaptationAppointment.scheduled_at) : 'Ainda não agendado'}
                </S.DocumentationValue>
              </S.DocumentationItem>
            </S.DocumentationGrid>

            <Field
              type="datetime-local"
              label="Data agendada/acordada com o cliente"
              value={adaptationScheduledAt}
              onChange={(event) => {
                setAdaptationScheduledAt(event.target.value);
              }}
            />

            <S.ModalActions>
              <S.ModalSecondaryButton
                type="button"
                onClick={() => {
                  setSelectedAdaptationOrderId(null);
                  setAdaptationScheduledAt('');
                }}
              >
                Cancelar
              </S.ModalSecondaryButton>
              <S.ModalPrimaryButton
                type="button"
                disabled={!adaptationScheduledAt || activeAction === `${selectedAdaptationOrder.id}:schedule-adaptation`}
                onClick={() => {
                  void handleSaveAdaptationSchedule();
                }}
              >
                {activeAction === `${selectedAdaptationOrder.id}:schedule-adaptation` ? 'Salvando...' : 'Salvar'}
              </S.ModalPrimaryButton>
            </S.ModalActions>
          </S.DocumentationModalBox>
        </S.ModalOverlay>
      ) : null}

      {selectedAdjustmentOrder ? (
        <S.ModalOverlay
          role="dialog"
          aria-modal="true"
          aria-label="Ajuste de produção"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedAdjustmentOrderId(null);
            }
          }}
        >
          <S.DocumentationModalBox>
            <S.ModalHeader>
              <div>
                <S.ModalTitle>Ajuste de produção</S.ModalTitle>
                <S.ModalSubtitle>
                  Ordem {getOrderLabel(selectedAdjustmentOrder)} - {selectedAdjustmentOrder.customer?.full_name ?? 'Paciente demo'}.
                </S.ModalSubtitle>
              </div>
              <S.ModalCloseButton
                type="button"
                aria-label="Fechar detalhes do ajuste"
                onClick={() => {
                  setSelectedAdjustmentOrderId(null);
                }}
              >
                <X size={16} aria-hidden />
              </S.ModalCloseButton>
            </S.ModalHeader>

            <S.DocumentationGrid>
              <S.DocumentationItem>
                <S.DocumentationLabel>Mensagem do laboratório</S.DocumentationLabel>
                <S.DocumentationValue>{getAdjustmentReason(selectedAdjustmentEvent)}</S.DocumentationValue>
              </S.DocumentationItem>
              <S.DocumentationItem>
                <S.DocumentationLabel>Solicitação de produção atual</S.DocumentationLabel>
                <S.DocumentationValue>
                  {selectedAdjustmentDraft?.productionRequestSummary || 'Não informado'}
                </S.DocumentationValue>
              </S.DocumentationItem>
              <S.DocumentationItem>
                <S.DocumentationLabel>Laboratório</S.DocumentationLabel>
                <S.DocumentationValue>{selectedAdjustmentLab?.labName ?? 'Laboratório selecionado'}</S.DocumentationValue>
              </S.DocumentationItem>
              <S.DocumentationItem>
                <S.DocumentationLabel>Telefone</S.DocumentationLabel>
                <S.DocumentationValue>{selectedAdjustmentLab?.phone || 'Não informado'}</S.DocumentationValue>
              </S.DocumentationItem>
              <S.DocumentationItem>
                <S.DocumentationLabel>E-mail</S.DocumentationLabel>
                <S.DocumentationValue>{selectedAdjustmentLab?.email || 'Não informado'}</S.DocumentationValue>
              </S.DocumentationItem>
              <S.DocumentationItem>
                <S.DocumentationLabel>Endereço</S.DocumentationLabel>
                <S.DocumentationValue>{selectedAdjustmentLabAddress || 'Não informado'}</S.DocumentationValue>
              </S.DocumentationItem>
            </S.DocumentationGrid>

            <S.ModalActions>
              <S.ModalSecondaryButton
                type="button"
                onClick={() => {
                  setSelectedAdjustmentOrderId(null);
                }}
              >
                Fechar
              </S.ModalSecondaryButton>
              <S.ModalPrimaryButton
                type="button"
                onClick={() => {
                  const adjustmentOrderId = selectedAdjustmentOrder.id;
                  setSelectedAdjustmentOrderId(null);
                  navigate(`/painel/dentista/producao/${adjustmentOrderId}#production-request`);
                }}
              >
                Abrir Solicitação de produção
              </S.ModalPrimaryButton>
            </S.ModalActions>
          </S.DocumentationModalBox>
        </S.ModalOverlay>
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
                  label="Descrição do motivo"
                  placeholder="Explique o ajuste que o dentista precisa realizar."
                  value={pendingOrderReason}
                  onChange={(event) => {
                    setPendingOrderReason(event.target.value);
                  }}
                />
              ) : null}

              <S.ModalActions>
                <S.ModalSecondaryButton
                  type="button"
                  onClick={() => {
                    setPendingOrderAction(null);
                    setPendingOrderReason('');
                  }}
                >
                  Cancelar
                </S.ModalSecondaryButton>
                <S.ModalPrimaryButton
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
                </S.ModalPrimaryButton>
              </S.ModalActions>
            </S.ModalBox>
        </S.ModalOverlay>
      ) : null}

      {showLicensingApprovalModal ? (
        <S.ModalOverlay
          role="dialog"
          aria-modal="true"
          aria-label="Cadastro aprovado"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              void dismissLicensingApprovalModal();
            }
          }}
        >
          <S.ModalBox>
            <S.ModalHeader>
              <div>
                <S.ModalTitle>Cadastro aprovado</S.ModalTitle>
                <S.ModalSubtitle>
                  A Nexor aprovou seu cadastro de {licenseeNoun} Biteplaner. Seu acesso já está liberado para operar
                  no fluxo do produto.
                </S.ModalSubtitle>
              </div>
              <S.ModalCloseButton
                type="button"
                aria-label="Fechar aprovação do cadastro"
                onClick={() => {
                  void dismissLicensingApprovalModal();
                }}
              >
                <X size={16} aria-hidden />
              </S.ModalCloseButton>
            </S.ModalHeader>
            <S.ModalActions>
              <S.PrimaryButton
                type="button"
                onClick={() => {
                  void dismissLicensingApprovalModal();
                }}
              >
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
                <S.ModalTitle>Atualizacoes da ordem {getOrderLabel(selectedTimelineOrder)}</S.ModalTitle>
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
                        <td>{getTimelineStatusLabel(event.toStatus)}</td>
                        <td>{getTimelineEventDescription(event)}</td>
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
                  Ordem {getOrderLabel(selectedDocumentationOrder)} - {selectedDocumentationOrder.customer?.full_name ?? 'Paciente demo'}.
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

            {productionRequestLoading ? (
              <S.EmptyState>Carregando dados enviados pelo dentista...</S.EmptyState>
            ) : productionRequestDraft ? (
              <S.DocumentationGrid>
                <S.DocumentationItem>
                  <S.DocumentationLabel>Dentista solicitante</S.DocumentationLabel>
                  <S.DocumentationValue>
                    {formatOrderDentist(selectedDocumentationOrder)}
                    {selectedDocumentationOrder.dentist?.full_name && selectedDocumentationOrder.dentist?.email
                      ? ` - ${selectedDocumentationOrder.dentist.email}`
                      : ''}
                  </S.DocumentationValue>
                </S.DocumentationItem>
                <S.DocumentationItem>
                  <S.DocumentationLabel>Paciente</S.DocumentationLabel>
                  <S.DocumentationValue>
                    {selectedDocumentationOrder.customer?.full_name || 'Não informado'}
                    {selectedDocumentationOrder.customer?.email ? ` - ${selectedDocumentationOrder.customer.email}` : ''}
                  </S.DocumentationValue>
                </S.DocumentationItem>
                <S.DocumentationItem>
                  <S.DocumentationLabel>Solicitação de produção</S.DocumentationLabel>
                  <S.DocumentationValue>{productionRequestDraft.productionRequestSummary || 'Não informado'}</S.DocumentationValue>
                </S.DocumentationItem>
                <S.DocumentationItem>
                  <S.DocumentationLabel>Orientações ao laboratório</S.DocumentationLabel>
                  <S.DocumentationValue>{productionRequestDraft.labNotes || 'Não informado'}</S.DocumentationValue>
                </S.DocumentationItem>
                <S.DocumentationItem>
                  <S.DocumentationLabel>Escaneamento 3D</S.DocumentationLabel>
                  {productionScanFileName ? (
                    <S.DocumentationDownloadLink
                      href={buildProductionAttachmentHref(productionScanFileName)}
                      download={productionScanFileName}
                      aria-label={`Baixar Escaneamento 3D ${productionScanFileName}`}
                    >
                      Baixar arquivo
                    </S.DocumentationDownloadLink>
                  ) : (
                    <S.DocumentationValue>Não anexado</S.DocumentationValue>
                  )}
                  {productionScanFileName ? (
                    <S.DocumentationValue>
                      Tamanho: {formatAttachmentSize(productionRequestDraft.scan3dFileRef?.sizeBytes)}
                    </S.DocumentationValue>
                  ) : null}
                </S.DocumentationItem>
                <S.DocumentationItem>
                  <S.DocumentationLabel>Prescrição</S.DocumentationLabel>
                  {productionPrescriptionFileName ? (
                    <S.DocumentationDownloadLink
                      href={buildProductionAttachmentHref(productionPrescriptionFileName)}
                      download={productionPrescriptionFileName}
                      aria-label={`Baixar Prescrição ${productionPrescriptionFileName}`}
                    >
                      Baixar arquivo
                    </S.DocumentationDownloadLink>
                  ) : (
                    <S.DocumentationValue>Não anexada</S.DocumentationValue>
                  )}
                  {productionPrescriptionFileName ? (
                    <S.DocumentationValue>
                      Tamanho: {formatAttachmentSize(productionRequestDraft.prescriptionFileRef?.sizeBytes)}
                    </S.DocumentationValue>
                  ) : null}
                </S.DocumentationItem>
              </S.DocumentationGrid>
            ) : productionRequestError ? (
              <S.EmptyState>{productionRequestError}</S.EmptyState>
            ) : (
              <S.EmptyState>Nenhum formulário de solicitação de produção foi enviado para esta ordem.</S.EmptyState>
            )}
          </S.DocumentationModalBox>
        </S.ModalOverlay>
      ) : null}
    </S.Page>
  );
}
