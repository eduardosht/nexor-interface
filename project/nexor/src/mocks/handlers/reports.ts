import { Response } from 'miragejs';
import type { Server } from 'miragejs';
import { getDemoStateSnapshot } from '../demoState';

type ReportPurpose = 'support' | 'finance' | 'clinical_care' | 'operations' | 'management' | 'compliance';

type ReportField = {
  key: string;
  label: string;
  classification: 'operational' | 'personal' | 'sensitive' | 'financial';
};

const FIELD_CATALOG: Record<string, ReportField> = {
  orderId: { key: 'orderId', label: 'Pedido', classification: 'operational' },
  customerName: { key: 'customerName', label: 'Cliente', classification: 'personal' },
  customerEmail: { key: 'customerEmail', label: 'E-mail', classification: 'personal' },
  orderStatus: { key: 'orderStatus', label: 'Status da ordem', classification: 'operational' },
  stage: { key: 'stage', label: 'Etapa', classification: 'operational' },
  paymentStatus: { key: 'paymentStatus', label: 'Status financeiro', classification: 'financial' },
  createdAt: { key: 'createdAt', label: 'Criado em', classification: 'operational' },
  practiceLocation: { key: 'practiceLocation', label: 'Local de atendimento', classification: 'operational' },
  currentTrainingHealthLimitations: {
    key: 'currentTrainingHealthLimitations',
    label: 'Limitação atual de treino ou saúde',
    classification: 'sensitive',
  },
};

const PURPOSE_FIELDS: Record<ReportPurpose, string[]> = {
  operations: ['orderId', 'orderStatus', 'stage', 'createdAt', 'practiceLocation'],
  support: ['orderId', 'customerName', 'customerEmail', 'orderStatus', 'stage'],
  finance: ['orderId', 'customerName', 'orderStatus', 'paymentStatus', 'createdAt'],
  clinical_care: [
    'orderId',
    'customerName',
    'orderStatus',
    'stage',
    'practiceLocation',
    'currentTrainingHealthLimitations',
  ],
  management: ['orderId', 'orderStatus', 'stage', 'paymentStatus', 'createdAt'],
  compliance: ['orderId', 'customerName', 'customerEmail', 'orderStatus', 'createdAt'],
};

function normalizePurpose(value: unknown): ReportPurpose {
  return value === 'support' ||
    value === 'finance' ||
    value === 'clinical_care' ||
    value === 'operations' ||
    value === 'management' ||
    value === 'compliance'
    ? value
    : 'operations';
}

function paymentStatusFor(orderStatus: string) {
  if (orderStatus === 'payment_confirmed' || orderStatus === 'lab_production' || orderStatus === 'adaptation') {
    return 'Confirmado';
  }

  if (orderStatus === 'awaiting_payment') {
    return 'Pendente';
  }

  return 'Nao aplicavel';
}

function formatOrderDisplayId(order: { id: string; displayId?: string; display_number?: number | string | null; displayNumber?: number | string | null }) {
  if (order.displayId?.trim()) return order.displayId.trim();

  const displayNumber = order.display_number ?? order.displayNumber;
  if (typeof displayNumber === 'number' && Number.isFinite(displayNumber)) return `#${displayNumber}`;
  if (typeof displayNumber === 'string' && /^\d+$/.test(displayNumber.trim())) return `#${displayNumber.trim()}`;

  return order.id;
}

export function getBiteplanerReportOrders(filters: {
  purpose?: string | string[];
  status?: string | string[];
  dateFrom?: string | string[];
  dateTo?: string | string[];
}) {
  const purpose = normalizePurpose(Array.isArray(filters.purpose) ? filters.purpose[0] : filters.purpose);
  const status = Array.isArray(filters.status) ? filters.status[0] : filters.status;
  const dateFrom = Array.isArray(filters.dateFrom) ? filters.dateFrom[0] : filters.dateFrom;
  const dateTo = Array.isArray(filters.dateTo) ? filters.dateTo[0] : filters.dateTo;
  const fieldKeys = PURPOSE_FIELDS[purpose];
  const fields = fieldKeys.map((key) => FIELD_CATALOG[key]);
  const snapshot = getDemoStateSnapshot();

  const rows = snapshot.orders
    .filter((order) => !status || order.status === status)
    .filter((order) => !dateFrom || order.created_at.slice(0, 10) >= dateFrom)
    .filter((order) => !dateTo || order.created_at.slice(0, 10) <= dateTo)
    .map((order) => {
      const baseRow: Record<string, string | null> = {
        orderId: formatOrderDisplayId(order),
        customerName: order.customer.full_name,
        customerEmail: order.customer.email,
        orderStatus: order.statusLabel || order.status,
        stage: order.stage,
        paymentStatus: paymentStatusFor(order.status),
        createdAt: order.created_at,
        practiceLocation: order.practice_location?.name ?? null,
        currentTrainingHealthLimitations: 'Campo sensivel liberado apenas para finalidade clinica no mock.',
      };

      return Object.fromEntries(fieldKeys.map((key) => [key, baseRow[key] ?? null]));
    });

  return { fields, rows };
}

export function reportHandlers(server: Server) {
  server.get('/v1/reports/biteplaner/orders', (_schema, request) =>
    getBiteplanerReportOrders(request.queryParams)
  );

  server.post('/v1/reports/biteplaner/orders/export', () =>
    new Response(200, {}, { ok: true, filename: 'biteplaner-report-demo.csv' })
  );
}
