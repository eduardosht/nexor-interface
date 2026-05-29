import { useEffect, useMemo, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
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

function classificationLabel(value: ReportField['classification']) {
  if (value === 'personal') return 'Pessoal';
  if (value === 'sensitive') return 'Sensível';
  if (value === 'financial') return 'Financeiro';
  return 'Operacional';
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

        <S.SummaryGrid>
          <S.SummaryCard>
            <S.SummaryValue>{loading ? '...' : report.rows.length}</S.SummaryValue>
            <S.SummaryLabel>Registros retornados</S.SummaryLabel>
          </S.SummaryCard>
          <S.SummaryCard>
            <S.SummaryValue>{report.fields.length}</S.SummaryValue>
            <S.SummaryLabel>Campos liberados</S.SummaryLabel>
          </S.SummaryCard>
          <S.SummaryCard>
            <S.SummaryValue>{sensitiveFieldCount}</S.SummaryValue>
            <S.SummaryLabel>Campos sensíveis visíveis</S.SummaryLabel>
          </S.SummaryCard>
        </S.SummaryGrid>

        {error ? <S.Feedback $tone="error" role="alert">{error}</S.Feedback> : null}

        <S.TableWrap>
          <S.Table>
            <thead>
              <tr>
                {report.fields.map((field) => (
                  <S.Th key={field.key}>
                    {field.label}
                    <br />
                    <S.Classification $tone={field.classification}>
                      {classificationLabel(field.classification)}
                    </S.Classification>
                  </S.Th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, rowIndex) => (
                  <tr key={`report-skeleton-${rowIndex}`}>
                    {Array.from({ length: Math.max(report.fields.length, 1) }).map((__, columnIndex) => (
                      <S.Td key={`report-skeleton-${rowIndex}-${columnIndex}`}>
                        <S.TableSkeleton data-testid="report-table-skeleton" />
                      </S.Td>
                    ))}
                  </tr>
                ))
              ) : report.rows.length === 0 ? (
                <tr>
                  <S.Td colSpan={Math.max(report.fields.length, 1)}>
                    {loading ? 'Carregando relatório...' : 'Nenhum registro encontrado para os filtros atuais.'}
                  </S.Td>
                </tr>
              ) : (
                report.rows.map((row, rowIndex) => (
                  <tr key={`${row.orderId ?? 'row'}-${rowIndex}`}>
                    {report.fields.map((field) => (
                      <S.Td key={field.key}>{row[field.key] ?? '-'}</S.Td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </S.Table>
        </S.TableWrap>

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
