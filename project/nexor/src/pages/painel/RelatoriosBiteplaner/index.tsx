import { useEffect, useMemo, useRef, useState } from 'react';
import { Download, ShieldCheck } from 'lucide-react';
import { AdminDataTable, AdminMetricGrid, ResponsiveDataList, type AdminDataTableColumn, type AdminMetric } from '@nexor/design-system';
import { env } from '../../../config/env';
import { api } from '../../../lib/api';
import { useAuth } from '../../../hooks/useAuth';
import * as S from './styles';
import {
  AdminMobileCard,
  AdminMobileCardSubtitle,
  AdminMobileCardTitle,
  AdminMobileMetaGrid,
  AdminMobileMetaItem,
  AdminMobileMetaLabel,
  AdminMobileMetaValue,
} from '../admin/mobileCards';

type ReportField = {
  key: string;
  label: string;
};

type ReportResponse = {
  fields: ReportField[];
  rows: Array<Record<string, string | number | null>>;
};

const HIDDEN_INTERFACE_FIELD_KEYS = new Set(['buyerEmail', 'quantity', 'model', 'color']);

const STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'awaiting_payment', label: 'Aguardando pagamento' },
  { value: 'paid', label: 'Pago' },
  { value: 'technical_review', label: 'Revisão técnica' },
  { value: 'correction_requested', label: 'Correção solicitada' },
  { value: 'ready_for_production', label: 'Pronto para produção' },
  { value: 'in_production', label: 'Em produção' },
  { value: 'shipped', label: 'Enviado' },
  { value: 'delivered', label: 'Entregue' },
  { value: 'completed', label: 'Concluído' },
  { value: 'cancelled', label: 'Cancelado' },
  { value: 'refunded', label: 'Reembolsado' },
];

const statusLabels: Record<string, string> = {
  draft: 'Rascunho',
  awaiting_payment: 'Aguardando pagamento',
  payment_failed: 'Pagamento falhou',
  paid: 'Pago',
  technical_review: 'Revisão técnica',
  correction_requested: 'Correção solicitada',
  ready_for_production: 'Pronto para produção',
  in_production: 'Em produção',
  shipped: 'Enviado',
  delivered: 'Entregue',
  completed: 'Concluído',
  cancelled: 'Cancelado',
};

const paymentStatusLabels: Record<string, string> = {
  pending: 'Pendente',
  awaiting_payment: 'Aguardando pagamento',
  not_created: 'Não iniciado',
  paid: 'Pago',
  confirmed: 'Confirmado',
  received: 'Recebido',
  overdue: 'Vencido',
  refunded: 'Reembolsado',
  cancelled: 'Cancelado',
  failed: 'Falhou',
  payment_failed: 'Pagamento falhou',
};

function formatDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getInitialDateRange() {
  const dateTo = new Date();
  const dateFrom = new Date(dateTo);
  dateFrom.setMonth(dateFrom.getMonth() - 3);

  return {
    dateFrom: formatDateInputValue(dateFrom),
    dateTo: formatDateInputValue(dateTo),
  };
}

function buildReportPath(filters: { status: string; dateFrom: string; dateTo: string }, csv = false) {
  const params = new URLSearchParams();

  if (filters.status.trim()) params.set('status', filters.status.trim());
  if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
  if (filters.dateTo) params.set('dateTo', filters.dateTo);

  const query = params.toString();
  return `/v1/admin/commerce/biteplaner/report${csv ? '.csv' : ''}${query ? `?${query}` : ''}`;
}

function buildApiUrl(path: string) {
  return new URL(path, `${env.apiUrl.endsWith('/') ? env.apiUrl : `${env.apiUrl}/`}`).toString();
}

function formatDateTime(value: string | number | null | undefined) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function maskEmail(value: string) {
  const [localPart, domain] = value.split('@');
  if (!localPart || !domain) return value;

  const visibleStart = localPart.slice(0, 1);
  const visibleEnd = localPart.length > 2 ? localPart.slice(-1) : '';
  return `${visibleStart}${'*'.repeat(Math.max(3, localPart.length - visibleStart.length - visibleEnd.length))}${visibleEnd}@${domain}`;
}

function formatValue(fieldKey: string, value: string | number | null | undefined) {
  if (value === null || value === undefined || value === '') return '-';
  if (fieldKey === 'createdAt' || fieldKey === 'paidAt') return formatDateTime(value);
  if (fieldKey === 'status' || fieldKey === 'orderStatus') return statusLabels[String(value)] ?? String(value);
  if (fieldKey === 'paymentStatus') return paymentStatusLabels[String(value)] ?? String(value);
  if (fieldKey.toLowerCase().includes('email')) return maskEmail(String(value));
  if (fieldKey === 'orderId') return String(value).slice(0, 8);
  return String(value);
}

function isStatusChipField(fieldKey: string) {
  return fieldKey === 'status' || fieldKey === 'orderStatus' || fieldKey === 'paymentStatus';
}

function getStatusChipColor(fieldKey: string, value: string | number | null | undefined) {
  const status = String(value ?? '');
  if (fieldKey === 'paymentStatus') {
    if (['paid', 'confirmed', 'received'].includes(status)) return '#15803d';
    if (['pending', 'awaiting_payment', 'not_created', 'overdue'].includes(status)) return '#d18a00';
    if (['failed', 'payment_failed', 'cancelled'].includes(status)) return '#b91c1c';
    if (status === 'refunded') return '#2563eb';
    return '#6b7280';
  }

  if (['paid', 'ready_for_production', 'completed', 'delivered'].includes(status)) return '#15803d';
  if (['awaiting_payment', 'technical_review', 'correction_requested', 'in_production', 'shipped'].includes(status)) return '#d18a00';
  if (['payment_failed', 'cancelled', 'refunded'].includes(status)) return '#b91c1c';
  return '#6b7280';
}

function renderReportValue(fieldKey: string, value: string | number | null | undefined) {
  const label = formatValue(fieldKey, value);
  if (!isStatusChipField(fieldKey)) return label;

  return (
    <S.ReportStatusPill $color={getStatusChipColor(fieldKey, value)}>
      <S.ReportStatusDot $color={getStatusChipColor(fieldKey, value)} />
      {label}
    </S.ReportStatusPill>
  );
}

export function RelatoriosBiteplaner() {
  const { session } = useAuth();
  const token = session?.access_token;
  const initialDateRange = useRef(getInitialDateRange()).current;
  const [status, setStatus] = useState('');
  const [dateFrom, setDateFrom] = useState(initialDateRange.dateFrom);
  const [dateTo, setDateTo] = useState(initialDateRange.dateTo);
  const [report, setReport] = useState<ReportResponse>({ fields: [], rows: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!token) return;

    let active = true;

    async function loadReport() {
      setLoading(true);
      setError('');

      try {
        const response = await api.get<ReportResponse>(buildReportPath({ status, dateFrom, dateTo }), token);

        if (active) {
          setReport(response);
        }
      } catch {
        if (active) {
          setError('Não foi possível carregar o relatório Biteplaner.');
          setReport({ fields: [], rows: [] });
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadReport();

    return () => {
      active = false;
    };
  }, [dateFrom, dateTo, status, token]);

  const visibleFields = useMemo(
    () => report.fields.filter((field) => !HIDDEN_INTERFACE_FIELD_KEYS.has(field.key)),
    [report.fields]
  );
  const hasReportRows = report.rows.length > 0;
  const metrics = useMemo<AdminMetric[]>(
    () => [
      { label: 'Pedidos retornados', value: loading ? '...' : report.rows.length, tone: 'success' },
      { label: 'Campos do relatório', value: visibleFields.length, tone: 'success' },
      { label: 'Status filtrado', value: status ? statusLabels[status] ?? status : 'Todos', tone: 'success' },
    ],
    [loading, report.rows.length, status, visibleFields.length]
  );
  const reportColumns = useMemo<AdminDataTableColumn<Record<string, string | number | null>>[]>(
    () =>
      visibleFields.map((field) => ({
        key: field.key,
        label: field.label,
        sortValue: (row) => String(row[field.key] ?? ''),
        render: (row) => renderReportValue(field.key, row[field.key]),
      })),
    [visibleFields]
  );

  async function handleExport() {
    if (!token || !hasReportRows) {
      return;
    }

    setExporting(true);
    setError('');

    try {
      const response = await fetch(buildApiUrl(buildReportPath({ status, dateFrom, dateTo }, true)), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('export_failed');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `relatorio-biteplaner-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch {
      setError('Não foi possível baixar o CSV do relatório.');
    } finally {
      setExporting(false);
    }
  }

  return (
    <S.Page>
      <S.Header>
        <S.TitleBlock>
          <S.Eyebrow>Commerce</S.Eyebrow>
          <S.Title>Relatórios Biteplaner</S.Title>
          <S.Subtitle>
            Extração simples dos pedidos Biteplaner feitos por dentistas, com filtros por status e período.
          </S.Subtitle>
        </S.TitleBlock>
      </S.Header>

      <S.Notice>
        <ShieldCheck size={18} aria-hidden /> O relatório usa apenas dados operacionais do pedido commerce e mantém o paciente fora da plataforma.
      </S.Notice>

      <S.Panel>
        <S.FilterGrid>
          <S.StatusSelect
            id="admin-report-status-filter"
            label="Status"
            value={status}
            onChange={setStatus}
            options={STATUS_OPTIONS}
          />
          <S.FieldGroup>
            De
            <S.Input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
          </S.FieldGroup>
          <S.FieldGroup>
            Até
            <S.Input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
          </S.FieldGroup>
        </S.FilterGrid>

        <AdminMetricGrid metrics={metrics} />

        {error ? <S.Feedback $tone="error" role="alert">{error}</S.Feedback> : null}

        {loading ? (
          <S.TableWrap>
            {Array.from({ length: 4 }).map((_, index) => (
              <S.TableSkeleton data-testid="report-table-skeleton" key={`report-table-skeleton-${index}`} />
            ))}
          </S.TableWrap>
        ) : (
          <ResponsiveDataList
            desktop={
              <AdminDataTable
                data={report.rows}
                columns={reportColumns}
                keyExtractor={(row, index) => `${row.orderId ?? 'row'}-${index}`}
                emptyMessage="Nenhum pedido encontrado para os filtros atuais."
                testId="report-table"
              />
            }
            data={report.rows}
            keyExtractor={(row) => `${row.orderId ?? JSON.stringify(row)}`}
            emptyMessage="Nenhum pedido encontrado para os filtros atuais."
            mobileTestId="report-mobile-list"
            renderCard={(row) => (
              <AdminMobileCard>
                <div>
                  <AdminMobileCardTitle>{formatValue('orderId', row.orderId) || 'Pedido'}</AdminMobileCardTitle>
                  <AdminMobileCardSubtitle>{formatValue('createdAt', row.createdAt)}</AdminMobileCardSubtitle>
                </div>
                <AdminMobileMetaGrid>
                  {visibleFields.map((field) => (
                    <AdminMobileMetaItem key={field.key}>
                      <AdminMobileMetaLabel>{field.label}</AdminMobileMetaLabel>
                      <AdminMobileMetaValue>{renderReportValue(field.key, row[field.key])}</AdminMobileMetaValue>
                    </AdminMobileMetaItem>
                  ))}
                </AdminMobileMetaGrid>
              </AdminMobileCard>
            )}
          />
        )}

        <S.Actions>
          <S.Button type="button" disabled={!hasReportRows || exporting} onClick={handleExport}>
            <Download size={16} aria-hidden />
            {exporting ? 'Baixando...' : 'Baixar CSV'}
          </S.Button>
        </S.Actions>
      </S.Panel>
    </S.Page>
  );
}