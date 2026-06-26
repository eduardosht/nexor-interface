import { useEffect, useMemo, useState } from 'react';
import {
  AdminDataTable,
  AdminMobileActionButton,
  AdminMobileRecordCard,
  Button,
  Select,
  type AdminDataTableColumn,
} from '@nexor/design-system';
import { useAdminPortal } from '../../../features/admin/portal';
import { useAuth } from '../../../hooks/useAuth';
import {
  cancelPlatformEmail,
  listPlatformEmailJobRuns,
  listPlatformEmails,
  previewPlatformEmail,
  retryPlatformEmail,
  runPlatformEmailDailyJob,
  type PlatformEmailEvent,
  type PlatformEmailJobRun,
  type PlatformEmailStatus,
  type PlatformEmailPreview,
} from '../../../features/platformEmails/platformEmails.api';
import { AdminProductGate } from './AdminProductGate';
import { PageHeader, PageStack, PageSubtitle, PageTitle } from './styles';
import * as S from './AdminCheckupEmails.styles';

const statusOptions: Array<{ value: PlatformEmailStatus | ''; label: string }> = [
  { value: '', label: 'Todos os status' },
  { value: 'scheduled', label: 'Agendados' },
  { value: 'processing', label: 'Processando' },
  { value: 'sent', label: 'Enviados' },
  { value: 'failed', label: 'Falhas' },
  { value: 'cancelled', label: 'Cancelados' },
  { value: 'skipped', label: 'Ignorados' },
];

const statusLabel: Record<PlatformEmailStatus, string> = {
  scheduled: 'Agendado',
  processing: 'Processando',
  sent: 'Enviado',
  failed: 'Falha',
  cancelled: 'Cancelado',
  skipped: 'Ignorado',
};

const statusTone: Record<PlatformEmailStatus, 'neutral' | 'success' | 'warning' | 'danger'> = {
  scheduled: 'neutral',
  processing: 'warning',
  sent: 'success',
  failed: 'danger',
  cancelled: 'neutral',
  skipped: 'warning',
};

function formatDateTime(value: string | null | undefined) {
  if (!value) return 'Não informado';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(date);
}

function getFollowUpLabel(value: PlatformEmailEvent['follow_up_kind']) {
  if (value === 'return_15_days') return 'Check-up de 15 dias';
  if (value === 'return_30_days') return 'Check-up de 30 dias';
  return 'Check-up';
}

function getCustomerName(event: PlatformEmailEvent) {
  const value = event.metadata.customerName;
  return typeof value === 'string' && value.trim() ? value : event.recipient_email;
}

function getMetricValue(emails: PlatformEmailEvent[], status: PlatformEmailStatus) {
  return emails.filter((email) => email.status === status).length;
}

export function AdminCheckupEmails() {
  const { selectedProduct } = useAdminPortal();
  const { session } = useAuth();
  const token = session?.access_token;
  const [emails, setEmails] = useState<PlatformEmailEvent[]>([]);
  const [runs, setRuns] = useState<PlatformEmailJobRun[]>([]);
  const [status, setStatus] = useState<PlatformEmailStatus | ''>('');
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [runModalOpen, setRunModalOpen] = useState(false);
  const [runningJob, setRunningJob] = useState(false);
  const [preview, setPreview] = useState<PlatformEmailPreview | null>(null);
  const [previewEvent, setPreviewEvent] = useState<PlatformEmailEvent | null>(null);
  const [cancelEvent, setCancelEvent] = useState<PlatformEmailEvent | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [actionId, setActionId] = useState('');

  async function loadData() {
    if (!selectedProduct || !token) return;
    setLoading(true);
    setError('');
    try {
      const [emailResponse, runResponse] = await Promise.all([
        listPlatformEmails(token, { status, limit: 100 }),
        listPlatformEmailJobRuns(token, 10),
      ]);
      setEmails(emailResponse.emails);
      setRuns(runResponse.runs);
    } catch {
      setError('Não foi possível carregar a agenda de e-mails.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, [selectedProduct, token, status]);

  const metrics = useMemo(
    () => [
      { label: 'Agendados', value: getMetricValue(emails, 'scheduled') },
      { label: 'Enviados hoje', value: getMetricValue(emails, 'sent') },
      { label: 'Falhas', value: getMetricValue(emails, 'failed') },
      { label: 'Ignorados', value: getMetricValue(emails, 'skipped') },
    ],
    [emails]
  );

  async function handlePreview(event: PlatformEmailEvent) {
    if (!token) return;
    setActionId(event.id);
    setError('');
    try {
      const response = await previewPlatformEmail(token, event.id);
      setPreview(response.preview);
      setPreviewEvent(event);
    } catch {
      setError('Não foi possível gerar a prévia do e-mail.');
    } finally {
      setActionId('');
    }
  }

  async function handleRetry(event: PlatformEmailEvent) {
    if (!token) return;
    setActionId(event.id);
    setError('');
    try {
      await retryPlatformEmail(token, event.id);
      setNotice('E-mail reagendado para nova tentativa.');
      await loadData();
    } catch {
      setError('Não foi possível reagendar o e-mail.');
    } finally {
      setActionId('');
    }
  }

  async function handleCancel() {
    if (!token || !cancelEvent || !cancelReason.trim()) return;
    setActionId(cancelEvent.id);
    setError('');
    try {
      await cancelPlatformEmail(token, cancelEvent.id, cancelReason.trim());
      setNotice('E-mail futuro cancelado.');
      setCancelEvent(null);
      setCancelReason('');
      await loadData();
    } catch {
      setError('Não foi possível cancelar o e-mail.');
    } finally {
      setActionId('');
    }
  }

  async function handleRunJob() {
    if (!token) return;
    setRunningJob(true);
    setError('');
    try {
      const summary = await runPlatformEmailDailyJob(token);
      setNotice(summary.alreadyRunning ? 'Job já estava em execução.' : 'Job executado: ' + summary.sent + ' enviados, ' + summary.failed + ' falhas.');
      setRunModalOpen(false);
      await loadData();
    } catch {
      setError('Não foi possível executar o job manualmente.');
    } finally {
      setRunningJob(false);
    }
  }

  const columns = useMemo<AdminDataTableColumn<PlatformEmailEvent>[]>(
    () => [
      {
        key: 'customer',
        label: 'Cliente',
        sortValue: (email) => getCustomerName(email),
        render: (email) => (
          <S.CustomerCell>
            <strong>{getCustomerName(email)}</strong>
            <span>{email.recipient_email}</span>
          </S.CustomerCell>
        ),
      },
      {
        key: 'checkup',
        label: 'Check-up',
        sortValue: (email) => getFollowUpLabel(email.follow_up_kind),
        render: (email) => `${getFollowUpLabel(email.follow_up_kind)} #${email.reminder_sequence ?? '-'}`,
      },
      {
        key: 'scheduled',
        label: 'Envio previsto',
        sortValue: (email) => email.scheduled_for ?? '',
        render: (email) => formatDateTime(email.scheduled_for),
      },
      {
        key: 'status',
        label: 'Status',
        sortValue: (email) => statusLabel[email.status],
        render: (email) => <S.StatusPill $tone={statusTone[email.status]}>{statusLabel[email.status]}</S.StatusPill>,
      },
      {
        key: 'attempts',
        label: 'Tentativas',
        width: '10%',
        sortValue: (email) => email.attempt_count,
        render: (email) => email.attempt_count,
      },
      {
        key: 'actions',
        label: 'Ações',
        width: '18%',
        render: (email) => (
          <S.ActionGroup>
            <button type="button" onClick={() => void handlePreview(email)} disabled={actionId === email.id}>Prévia</button>
            {email.status === 'scheduled' ? <button type="button" onClick={() => setCancelEvent(email)}>Cancelar</button> : null}
            {email.status === 'failed' ? <button type="button" onClick={() => void handleRetry(email)} disabled={actionId === email.id}>Retry</button> : null}
          </S.ActionGroup>
        ),
      },
    ],
    [actionId]
  );

  return (
    <PageStack>
      <PageHeader>
        <PageTitle>E-mails de check-up</PageTitle>
        <PageSubtitle>
          Acompanhe a agenda de lembretes automáticos, tentativas de envio e execuções do job diário.
        </PageSubtitle>
      </PageHeader>

      <AdminProductGate />

      {selectedProduct ? (
        <>
          <S.Toolbar>
            <Select label="Status" value={status} onChange={(value) => setStatus(value as PlatformEmailStatus | '')} options={statusOptions} />
            <Button variant="secondary" onClick={() => void loadData()} disabled={loading}>Atualizar</Button>
            <Button onClick={() => setRunModalOpen(true)}>Executar job agora</Button>
          </S.Toolbar>

          {notice ? <S.Notice role="status">{notice}</S.Notice> : null}
          {error ? <S.Error role="alert">{error}</S.Error> : null}

          <S.MetricGrid>
            {metrics.map((metric) => (
              <S.MetricCard key={metric.label}>
                <S.MetricValue>{metric.value}</S.MetricValue>
                <S.MetricLabel>{metric.label}</S.MetricLabel>
              </S.MetricCard>
            ))}
          </S.MetricGrid>

          <S.Panel>
            <S.PanelHeader>
              <S.PanelTitle>Agenda de envio</S.PanelTitle>
              <S.PanelMeta>{loading ? 'Carregando...' : emails.length + ' e-mails'}</S.PanelMeta>
            </S.PanelHeader>
            <AdminDataTable
              data={emails}
              columns={columns}
              keyExtractor={(email) => email.id}
              emptyMessage="Nenhum e-mail encontrado para o filtro aplicado."
              pageSize={10}
              testId="admin-checkup-emails-table"
              mobileTestId="admin-checkup-emails-mobile-list"
              renderMobileCard={(email) => (
                <AdminMobileRecordCard
                  title={getCustomerName(email)}
                  subtitle={email.recipient_email}
                  status={<S.StatusPill $tone={statusTone[email.status]}>{statusLabel[email.status]}</S.StatusPill>}
                  metadata={[
                    { label: 'Check-up', value: `${getFollowUpLabel(email.follow_up_kind)} #${email.reminder_sequence ?? '-'}` },
                    { label: 'Envio', value: formatDateTime(email.scheduled_for) },
                    { label: 'Tentativas', value: email.attempt_count },
                  ]}
                  primaryAction={
                    <AdminMobileActionButton type="button" onClick={() => void handlePreview(email)} disabled={actionId === email.id}>
                      Prévia
                    </AdminMobileActionButton>
                  }
                  secondaryActions={
                    <S.MobileSecondaryActions>
                      {email.status === 'scheduled' ? <button type="button" onClick={() => setCancelEvent(email)}>Cancelar</button> : null}
                      {email.status === 'failed' ? <button type="button" onClick={() => void handleRetry(email)} disabled={actionId === email.id}>Retry</button> : null}
                    </S.MobileSecondaryActions>
                  }
                />
              )}
            />
          </S.Panel>

          <S.Panel>
            <S.PanelHeader><S.PanelTitle>Execucoes recentes</S.PanelTitle><S.PanelMeta>{runs.length} registros</S.PanelMeta></S.PanelHeader>
            <S.RunList>
              {runs.map((run) => (
                <S.RunItem key={run.id}><strong>{run.status}</strong><span>{formatDateTime(run.started_at)} - {run.triggered_by}</span>{run.error_message ? <small>{run.error_message}</small> : null}</S.RunItem>
              ))}
            </S.RunList>
          </S.Panel>
        </>
      ) : null}

      {runModalOpen ? (
        <S.ModalOverlay role="presentation"><S.Modal role="dialog" aria-modal="true" aria-labelledby="run-email-job-title"><S.ModalTitle id="run-email-job-title">Executar job diário?</S.ModalTitle><p>O backend vai processar os e-mails elegíveis respeitando limite diário e preferências dos clientes.</p><S.ModalActions><Button variant="secondary" onClick={() => setRunModalOpen(false)} disabled={runningJob}>Cancelar</Button><Button onClick={() => void handleRunJob()} disabled={runningJob}>{runningJob ? 'Executando...' : 'Executar agora'}</Button></S.ModalActions></S.Modal></S.ModalOverlay>
      ) : null}

      {preview && previewEvent ? (
        <S.ModalOverlay role="presentation"><S.Modal role="dialog" aria-modal="true" aria-labelledby="email-preview-title"><S.ModalTitle id="email-preview-title">Prévia do e-mail</S.ModalTitle><S.PreviewMeta>{previewEvent.recipient_email}</S.PreviewMeta><S.PreviewSubject>{preview.subject}</S.PreviewSubject><S.PreviewText>{preview.text}</S.PreviewText><S.ModalActions><Button onClick={() => { setPreview(null); setPreviewEvent(null); }}>Fechar</Button></S.ModalActions></S.Modal></S.ModalOverlay>
      ) : null}

      {cancelEvent ? (
        <S.ModalOverlay role="presentation"><S.Modal role="dialog" aria-modal="true" aria-labelledby="cancel-email-title"><S.ModalTitle id="cancel-email-title">Cancelar e-mail agendado</S.ModalTitle><label>Motivo<textarea value={cancelReason} onChange={(event) => setCancelReason(event.target.value)} /></label><S.ModalActions><Button variant="secondary" onClick={() => setCancelEvent(null)} disabled={actionId === cancelEvent.id}>Voltar</Button><Button onClick={() => void handleCancel()} disabled={actionId === cancelEvent.id || cancelReason.trim().length < 3}>Cancelar e-mail</Button></S.ModalActions></S.Modal></S.ModalOverlay>
      ) : null}
    </PageStack>
  );
}
