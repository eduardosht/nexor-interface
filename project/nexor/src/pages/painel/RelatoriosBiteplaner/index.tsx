import { useEffect, useMemo, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { AdminDataTable, AdminMetricGrid, type AdminDataTableColumn, type AdminMetric } from '@nexor/design-system';
import { api } from '../../../lib/api';
import { useAuth } from '../../../hooks/useAuth';
import * as S from './styles';

type ReportPurpose = 'support' | 'finance' | 'clinical_care' | 'operations' | 'management' | 'compliance';

type ReportField = {
  key: string;
  label: string;
  classification: 'operational' | 'personal' | 'sensitive' | 'financial';
};

type ReportResponse = {
  fields: ReportField[];
  rows: Array<Record<string, string | null>>;
};

const PURPOSE_OPTIONS: Array<{ value: ReportPurpose; label: string; description: string }> = [
  { value: 'operations', label: 'Operação', description: 'Fila, status e andamento sem dados clínicos.' },
  { value: 'support', label: 'Suporte', description: 'Contato mínimo e acompanhamento do atendimento.' },
  { value: 'finance', label: 'Financeiro', description: 'Status de pedido e pagamento sem saúde.' },
  { value: 'clinical_care', label: 'Clínico', description: 'Dados necessários ao cuidado autorizado.' },
  { value: 'management', label: 'Gestão', description: 'Leitura executiva e minimizada.' },
  { value: 'compliance', label: 'Compliance', description: 'Governança, auditoria e solicitações LGPD.' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'registration_started', label: 'Cadastro iniciado' },
  { value: 'awaiting_payment', label: 'Aguardando pagamento' },
  { value: 'payment_confirmed', label: 'Pagamento confirmado' },
  { value: 'awaiting_scheduling', label: 'Aguardando agendamento' },
  { value: 'in_progress', label: 'Em andamento' },
  { value: 'appointment_confirmed', label: 'Consulta confirmada' },
  { value: 'ineligible_refund', label: 'Inapto / reembolso' },
  { value: 'lab_processing', label: 'Em produção no laboratório' },
  { value: 'product_received_by_clinic', label: 'Produto recebido pela clínica' },
  { value: 'awaiting_adaptation', label: 'Aguardando adaptação' },
  { value: 'follow_up', label: 'Acompanhamento' },
  { value: 'completed', label: 'Concluído' },
  { value: 'cancelled', label: 'Cancelado' },
];

function getDefaultPurpose(roles: string[] = []): ReportPurpose {
  if (roles.includes('finance')) return 'finance';
  if (roles.includes('clinical')) return 'clinical_care';
  if (roles.includes('support')) return 'support';
  if (roles.includes('management')) return 'management';
  if (roles.includes('compliance')) return 'compliance';
  return 'operations';
}

function buildReportPath(purpose: ReportPurpose, filters: { status: string; dateFrom: string; dateTo: string }) {
  const params = new URLSearchParams({ purpose });

  if (filters.status.trim()) params.set('status', filters.status.trim());
  if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
  if (filters.dateTo) params.set('dateTo', filters.dateTo);

  return `/v1/reports/biteplaner/orders?${params.toString()}`;
}

const reportFieldLabels: Record<string, string> = {
  orderId: 'ID da ordem',
  orderStatus: 'Status da ordem',
  createdAt: 'Criado em',
};

const orderStatusLabels: Record<string, string> = {
  registration_started: 'Cadastro iniciado',
  awaiting_payment: 'Aguardando pagamento',
  payment_confirmed: 'Pagamento confirmado',
  awaiting_scheduling: 'Aguardando agendamento',
  awaiting_initial_appointment_acceptance: 'Aguardando aceite do dentista',
  appointment_confirmed: 'Consulta confirmada',
  in_progress: 'Consulta em andamento',
  treatment_required: 'Tratamento prévio pendente',
  clinical_decision_pending: 'Aguardando decisão clínica',
  dentist_forms_pending: 'Aguardando preenchimento dentista',
  lab_processing: 'Em produção no laboratório',
  lab_production: 'Em produção no laboratório',
  lab_acceptance_pending: 'Aguardando aceite do laboratório',
  dentist_adjustment_required: 'Ajuste de produção',
  product_received_by_clinic: 'Produto recebido pela clínica',
  awaiting_adaptation: 'Aguardando adaptação',
  follow_up: 'Acompanhamento',
  completed: 'Concluído',
  ineligible_refund: 'Inapto / reembolso',
  cancelled: 'Cancelado',
};

function formatDateTime(value: string | null | undefined) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function formatOrderId(value: string | null | undefined) {
  if (!value) return '-';
  if (value.startsWith('#')) return value;
  if (/^\d+$/.test(value)) return `#${value}`;
  return value;
}

function formatReportValue(fieldKey: string, value: string | null | undefined) {
  if (fieldKey === 'orderId') return formatOrderId(value);
  if (fieldKey === 'orderStatus') return orderStatusLabels[value ?? ''] ?? value ?? '-';
  if (fieldKey === 'createdAt') return formatDateTime(value);
  return value ?? '-';
}

export function RelatoriosBiteplaner() {
  const { backendUser, session } = useAuth();
  const token = session?.access_token;
  const [purpose, setPurpose] = useState<ReportPurpose>(() => getDefaultPurpose(backendUser?.roles));
  const [status, setStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [exportReason, setExportReason] = useState('');
  const [report, setReport] = useState<ReportResponse>({ fields: [], rows: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    setPurpose(getDefaultPurpose(backendUser?.roles));
  }, [backendUser?.roles]);

  useEffect(() => {
    if (!token) return;

    let active = true;

    async function loadReport() {
      setLoading(true);
      setError('');

      try {
        const response = await api.get<ReportResponse>(
          buildReportPath(purpose, { status, dateFrom, dateTo }),
          token
        );

        if (active) {
          setReport(response);
        }
      } catch {
        if (active) {
          setError('Não foi possível carregar os relatórios seguros do Biteplaner.');
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
  }, [dateFrom, dateTo, purpose, status, token]);

  const sensitiveFieldCount = useMemo(
    () => report.fields.filter((field) => field.classification === 'sensitive').length,
    [report.fields]
  );
  const personalFieldCount = useMemo(
    () => report.fields.filter((field) => field.classification === 'personal').length,
    [report.fields]
  );
  const exportRequiresReason = personalFieldCount > 0 || sensitiveFieldCount > 0;
  const hasReportRows = report.rows.length > 0;
  const metrics = useMemo<AdminMetric[]>(
    () => [
      { label: 'Registros retornados', value: loading ? '...' : report.rows.length, tone: 'success' },
      { label: 'Campos liberados', value: report.fields.length, tone: 'success' },
      { label: 'Campos sensíveis visíveis', value: sensitiveFieldCount, tone: sensitiveFieldCount > 0 ? 'danger' : 'success' },
    ],
    [loading, report.fields.length, report.rows.length, sensitiveFieldCount]
  );
  const reportColumns = useMemo<AdminDataTableColumn<Record<string, string | null>>[]>(
    () =>
      report.fields.map((field) => ({
        key: field.key,
        label: reportFieldLabels[field.key] ?? field.label,
        sortValue: (row) => row[field.key] ?? '',
        render: (row) => formatReportValue(field.key, row[field.key]),
      })),
    [report.fields]
  );

  async function handleExport() {
    if (!token || !hasReportRows || (exportRequiresReason && !exportReason.trim())) {
      return;
    }

    setExporting(true);
    setError('');

    try {
      await api.post(
        '/v1/reports/biteplaner/orders/export',
        {
          purpose,
          status: status.trim() || undefined,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
          exportReason: exportReason.trim() || undefined,
        },
        token
      );
    } catch {
      setError('Não foi possível exportar este relatório com as permissões atuais.');
    } finally {
      setExporting(false);
    }
  }

  return (
    <S.Page>
      <S.Header>
        <S.TitleBlock>
          <S.Eyebrow>Governança de dados</S.Eyebrow>
          <S.Title>Relatórios Biteplaner</S.Title>
          <S.Subtitle>
            Visualização segura para pessoas não técnicas, com campos reduzidos por finalidade e trilha de auditoria
            para acessos e exportações.
          </S.Subtitle>
        </S.TitleBlock>
      </S.Header>

      <S.Notice>
        <ShieldCheck size={18} aria-hidden /> Acessos e exportações são registrados. Dados sensíveis só aparecem para
        finalidades autorizadas.
      </S.Notice>

      <S.Panel>
        <S.FilterGrid>
          <S.FieldGroup>
            Finalidade
            <S.Select value={purpose} onChange={(event) => setPurpose(event.target.value as ReportPurpose)}>
              {PURPOSE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </S.Select>
          </S.FieldGroup>
          <S.FieldGroup>
            Status
            <S.Select value={status} onChange={(event) => setStatus(event.target.value)}>
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value || 'all'} value={option.value}>
                  {option.label}
                </option>
              ))}
            </S.Select>
          </S.FieldGroup>
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
          <AdminDataTable
            data={report.rows}
            columns={reportColumns}
            keyExtractor={(row, index) => `${row.orderId ?? 'row'}-${index}`}
            emptyMessage="Nenhum registro encontrado para os filtros atuais."
            testId="report-table"
          />
        )}

        <S.Actions>
          <S.FieldGroup>
            Justificativa da exportação
            <S.Input
              value={exportReason}
              onChange={(event) => setExportReason(event.target.value)}
              placeholder={exportRequiresReason ? 'Obrigatória para dados pessoais ou sensíveis' : 'Opcional'}
            />
          </S.FieldGroup>
          <S.Button type="button" disabled={!hasReportRows || exporting || (exportRequiresReason && !exportReason.trim())} onClick={handleExport}>
            {exporting ? 'Exportando...' : 'Exportar CSV'}
          </S.Button>
        </S.Actions>
      </S.Panel>
    </S.Page>
  );
}
