import { AdminFormButton, AdminModal } from '@nexor/design-system';
import { Eye, EyeOff, Factory, FlaskConical, Info, Inbox, Pencil, Plus, RefreshCw, ShieldCheck, ToggleLeft, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { api } from '../../../lib/api';
import * as S from './AdminLaboratories.styles';
import { PageHeader, PageStack, PageSubtitle, PageTitle } from './styles';

type SplitValidationStatus = 'created' | 'awaiting_payment' | 'checkout_paid' | 'payment_received' | 'approved' | 'failed';
type SplitActionKind = 'activate' | 'deactivate' | 'create-split' | 'refresh-split' | 'validate-asaas';

type SplitTestSummary = {
  status: SplitValidationStatus;
  walletId: string | null;
  failureReason: string | null;
  amountCents?: number;
  splitFixedValueCents?: number;
  paymentStatus: string | null;
  splitStatus: string | null;
  verifiedAt: string | null;
  lastWebhookEventAt: string | null;
};

type SplitTestDetails = SplitTestSummary & {
  id: string;
  laboratoryPartnerId: string;
  externalReference: string;
  checkoutId: string;
  paymentId: string | null;
  walletId: string;
  amountCents: number;
  splitFixedValueCents: number;
  splitId: string | null;
  createdAt: string;
  updatedAt: string;
};

type Laboratory = {
  id: string;
  name: string;
  legalName: string | null;
  cnpj: string | null;
  email: string | null;
  phone: string | null;
  cep: string | null;
  addressLine: string | null;
  addressNumber: string | null;
  addressComplement: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  asaasMode: 'linked_account' | 'created_subaccount';
  companyType: 'MEI' | 'LIMITED' | 'INDIVIDUAL' | 'ASSOCIATION' | null;
  mobilePhone: string | null;
  incomeValue: number | null;
  asaasAccountId: string | null;
  asaasWalletId: string | null;
  integrationStatus: 'pending' | 'ready' | 'error' | 'disabled';
  integrationErrorMessage: string | null;
  splitFixedValueCents: number;
  distributionWeightBasisPoints: number;
  active: boolean;
  asaasValidationStatus?: SplitValidationStatus | null;
  asaasValidationReason?: string | null;
  paymentStatus?: string | null;
  splitStatus?: string | null;
  verifiedAt?: string | null;
  lastWebhookEventAt?: string | null;
  asaasSplitTest?: SplitTestSummary | null;
};

type Response = { laboratories: Laboratory[] };
type SplitTestCreateResponse = {
  test: {
    url: string;
    amountCents: number;
    splitFixedValueCents: number;
    testId: string;
    status: SplitValidationStatus;
  };
};
type SplitTestStatusResponse = {
  test: SplitTestDetails;
  reconciliation: {
    attempted: boolean;
    error: string | null;
  };
};

type Form = {
  name: string;
  legalName: string | null;
  cnpj: string | null;
  email: string | null;
  phone: string;
  asaasMode: Laboratory['asaasMode'];
  asaasWalletId: string;
  companyType: NonNullable<Laboratory['companyType']> | '';
  mobilePhone: string;
  incomeValue: string;
  cep: string;
  addressLine: string;
  addressNumber: string;
  addressComplement: string;
  neighborhood: string;
  city: string;
  state: string;
  splitFixedValue: string;
  weight: string;
};

const emptyForm: Form = {
  name: '',
  legalName: '',
  cnpj: '',
  email: '',
  phone: '',
  asaasMode: 'linked_account',
  asaasWalletId: '',
  companyType: '',
  mobilePhone: '',
  incomeValue: '',
  cep: '',
  addressLine: '',
  addressNumber: '',
  addressComplement: '',
  neighborhood: '',
  city: '',
  state: 'SP',
  splitFixedValue: '',
  weight: ''
};

const splitStatusLabels: Record<SplitValidationStatus, string> = {
  created: 'Teste criado; aguardando processamento',
  awaiting_payment: 'Aguardando pagamento',
  checkout_paid: 'Checkout pago; aguardando confirmação',
  payment_received: 'Pagamento recebido; validando split',
  approved: 'Aprovado para split',
  failed: 'Falha na validação'
};

const integrationStatusLabels: Record<Laboratory['integrationStatus'], string> = {
  pending: 'Pendente Asaas',
  ready: 'Integração Asaas pronta',
  error: 'Erro Asaas',
  disabled: 'Integração Asaas desativada'
};

const pendingSplitStatuses = new Set<SplitValidationStatus>(['created', 'awaiting_payment', 'checkout_paid', 'payment_received']);
const numberFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: 'America/Sao_Paulo'
});
const conclusiveSplitStatuses = new Set<SplitValidationStatus>(['approved', 'failed']);
const isConclusiveSplitStatus = (status: SplitValidationStatus | null) => status !== null && conclusiveSplitStatuses.has(status);

const money = (cents: number) => (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const percent = (value: number) => `${value.toFixed(2).replace('.', ',')}%`;
const onlyDigits = (value: string) => value.replace(/\D/g, '');
const sanitizeDecimalInput = (value: string) => value.replace(/[^\d,.-]/g, '');

const formatMoneyInput = (value: string) => {
  const digits = onlyDigits(value);
  if (!digits) return '';
  return (Number(digits) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const toCents = (value: string) => {
  const normalized = value.replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.');
  return Math.round(Number(normalized) * 100);
};

const formatPercentageInput = (value: string) => {
  const normalized = value.replace(/[^\d,.-]/g, '').replace(',', '.');
  if (!normalized) return '';
  const numeric = Math.min(100, Math.max(0, Number(normalized)));
  return Number.isFinite(numeric) ? `${numeric.toFixed(2).replace('.', ',')}%` : '';
};

const toPercentage = (value: string) => {
  const normalized = value.replace(/[^\d,.-]/g, '').replace(',', '.');
  const numeric = Math.min(100, Math.max(0, Number(normalized)));
  return Number.isFinite(numeric) ? Number(numeric.toFixed(2)) : 0;
};

const formatIncomeInput = (value: string) => {
  const normalized = value.replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.');
  if (!normalized) return '';
  const numeric = Number(normalized);
  return Number.isFinite(numeric)
    ? numeric.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }).replace(/\u00a0/g, ' ')
    : '';
};

const formatDateTime = (value: string) => numberFormatter.format(new Date(value));
const hasAsaasWallet = (item: Laboratory) => (item.asaasWalletId?.trim() ?? '') !== '';
const getPersistedSplitTest = (item: Laboratory): SplitTestSummary | null => {
  if (item.asaasSplitTest !== undefined) return item.asaasSplitTest;
  if (item.asaasValidationStatus === undefined || item.asaasValidationStatus === null) return null;
  return {
    status: item.asaasValidationStatus,
    failureReason: item.asaasValidationReason ?? null,
    walletId: null,
    paymentStatus: item.paymentStatus ?? null,
    splitStatus: item.splitStatus ?? null,
    verifiedAt: item.verifiedAt ?? null,
    lastWebhookEventAt: item.lastWebhookEventAt ?? null
  };
};
const getSplitValidationStatus = (item: Laboratory) => item.asaasValidationStatus ?? getPersistedSplitTest(item)?.status ?? null;
const doesSplitTestMatchCurrentWallet = (item: Laboratory) => {
  const currentWalletId = item.asaasWalletId?.trim() ?? '';
  const testedWalletId = getPersistedSplitTest(item)?.walletId?.trim() ?? '';
  return currentWalletId !== '' && testedWalletId !== '' && currentWalletId === testedWalletId;
};
const isSplitApproved = (item: Laboratory) =>
  item.active &&
  item.integrationStatus === 'ready' &&
  item.asaasValidationStatus === 'approved' &&
  getPersistedSplitTest(item)?.status === 'approved' &&
  doesSplitTestMatchCurrentWallet(item);
const isCurrentWalletPendingValidation = (item: Laboratory) =>
  item.active && item.asaasValidationStatus === 'approved' && !doesSplitTestMatchCurrentWallet(item);
const isIntegrationPendingValidation = (item: Laboratory) =>
  item.active && item.asaasValidationStatus === 'approved' && doesSplitTestMatchCurrentWallet(item) && item.integrationStatus !== 'ready';
const isSplitPending = (item: Laboratory) => {
  const status = getSplitValidationStatus(item);
  return status !== null && pendingSplitStatuses.has(status);
};
const integrationStatusLabel = (item: Laboratory) => (item.active ? integrationStatusLabels[item.integrationStatus] : 'Laboratório inativo');
const readinessAwareIntegrationStatusLabel = (item: Laboratory) => {
  if (!item.active) return integrationStatusLabel(item);
  if (item.integrationStatus === 'ready' && !isSplitApproved(item)) return integrationStatusLabels.pending;
  return integrationStatusLabel(item);
};
const canGuaranteeAsaasIntegration = (item: Laboratory) =>
  item.active &&
  item.asaasMode === 'linked_account' &&
  hasAsaasWallet(item) &&
  !isSplitApproved(item);
const asaasActionLabel = () => 'Validar integração Asaas';
const getCreateSplitLabel = (item: Laboratory) => {
  const status = getSplitValidationStatus(item);
  if (status === 'failed') return 'Reenviar teste de split';
  if (status === 'approved') return 'Enviar novo teste de split';
  return 'Enviar teste de split';
};
const getSplitStatusLabel = (status: SplitValidationStatus | null) => (status === null ? 'Teste não enviado' : splitStatusLabels[status]);
const getSplitStatusTone = (status: SplitValidationStatus | null) => {
  if (status === 'approved') return 'success';
  if (status === 'failed') return 'danger';
  if (status === 'checkout_paid' || status === 'payment_received') return 'info';
  if (status === 'created' || status === 'awaiting_payment') return 'warning';
  return 'neutral';
};
const getSplitStatusMessage = (status: SplitValidationStatus) => `Status atualizado: ${splitStatusLabels[status]}.`;
const getFailureReason = (item: Laboratory, detail: SplitTestDetails | null) => {
  const persistedTest = getPersistedSplitTest(item);
  if (persistedTest?.status === 'approved' || detail?.status === 'approved') return null;
  return detail?.failureReason ?? persistedTest?.failureReason ?? item.asaasValidationReason ?? null;
};
const getSplitDisplayAmount = (persistedTest: SplitTestSummary | null, detail: SplitTestDetails | null) =>
  detail?.amountCents ?? persistedTest?.amountCents ?? null;

export function AdminLaboratories() {
  const { session } = useAuth();
  const token = session?.access_token;
  const [items, setItems] = useState<Laboratory[]>([]);
  const [form, setForm] = useState<Form>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setFormOpen] = useState(false);
  const [includeInactive, setIncludeInactive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rowAction, setRowAction] = useState<{ id: string; kind: SplitActionKind } | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [splitTestDetails, setSplitTestDetails] = useState<Record<string, SplitTestDetails>>({});
  const [splitReconciliationErrors, setSplitReconciliationErrors] = useState<Record<string, string>>({});
  const inflightActions = useRef(new Set<string>());

  const load = useCallback(async () => {
    if (!token) return null;
    setLoading(true);
    setError('');
    try {
      const query = includeInactive ? '?includeInactive=true' : '';
      const response = await api.get<Response>(`/v1/admin/commerce/laboratories${query}`, token);
      setItems(response.laboratories);
      const conclusiveIds = new Set(
        response.laboratories
          .filter((item) => isConclusiveSplitStatus(getSplitValidationStatus(item)))
          .map((item) => item.id)
      );
      if (conclusiveIds.size > 0) {
        setSplitReconciliationErrors((current) => {
          const next = { ...current };
          for (const id of conclusiveIds) {
            delete next[id];
          }
          return next;
        });
      }
      return response.laboratories;
    } catch {
      setError('Não foi possível carregar os laboratórios.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [includeInactive, token]);

  useEffect(() => {
    void load();
  }, [load]);

  const pendingSplitIds = useMemo(
    () => items.filter((item) => item.active && isSplitPending(item)).map((item) => item.id).join('|'),
    [items]
  );

  useEffect(() => {
    if (!token || pendingSplitIds.length === 0) return undefined;
    const timer = window.setTimeout(() => {
      void load();
    }, 30_000);
    return () => window.clearTimeout(timer);
  }, [load, pendingSplitIds, token]);

  const totalWeight = useMemo(
    () => items.filter(isSplitApproved).reduce((sum, item) => sum + item.distributionWeightBasisPoints, 0),
    [items]
  );

  function change<K extends keyof Form>(key: K, value: Form[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function reset() {
    setEditingId(null);
    setForm(emptyForm);
    setFormOpen(false);
  }

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setMessage('');
    setError('');
    setFormOpen(true);
  }

  function edit(item: Laboratory) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      legalName: item.legalName,
      cnpj: item.cnpj,
      email: item.email,
      phone: item.phone ?? '',
      asaasMode: 'linked_account',
      asaasWalletId: item.asaasWalletId ?? '',
      companyType: item.companyType ?? '',
      mobilePhone: item.mobilePhone ?? '',
      incomeValue: item.incomeValue !== null ? formatIncomeInput(String(item.incomeValue)) : '',
      cep: item.cep ?? '',
      addressLine: item.addressLine ?? '',
      addressNumber: item.addressNumber ?? '',
      addressComplement: item.addressComplement ?? '',
      neighborhood: item.neighborhood ?? '',
      city: item.city ?? '',
      state: item.state ?? 'SP',
      splitFixedValue: formatMoneyInput(String(item.splitFixedValueCents)),
      weight: formatPercentageInput(String(item.distributionWeightBasisPoints))
    });
    setMessage('');
    setError('');
    setFormOpen(true);
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!token) return;
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const base = {
        name: form.name,
        splitFixedValueCents: toCents(form.splitFixedValue),
        distributionWeightBasisPoints: toPercentage(form.weight)
      };
      const payload = { ...base, asaasMode: 'linked_account' as const, asaasWalletId: form.asaasWalletId };
      if (editingId) await api.patch(`/v1/admin/commerce/laboratories/${editingId}`, payload, token);
      else await api.post('/v1/admin/commerce/laboratories', payload, token);
      reset();
      setMessage('Laboratório salvo com sucesso.');
      await load();
    } catch {
      setError('Não foi possível salvar. Verifique os dados e a integração Asaas.');
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function action(id: string, kind: SplitActionKind, path: string, body: Record<string, unknown> = {}, successMessage = '') {
    if (!token) return null;
    setError('');
    setMessage('');
    setRowAction({ id, kind });
    try {
      const response = await api.post<{ laboratory: Laboratory }>(`/v1/admin/commerce/laboratories/${id}/${path}`, body, token);
      if (successMessage) setMessage(successMessage);
      await load();
      return response;
    } catch {
      setError('Não foi possível concluir a ação do laboratório.');
      return null;
    } finally {
      setRowAction(null);
    }
  }

  async function loadSplitTestStatus(item: Laboratory, options?: { showMessage?: boolean }) {
    if (!token) return null;
    const response = await api.get<SplitTestStatusResponse>(`/v1/admin/commerce/laboratories/${item.id}/test-split`, token);
    setSplitTestDetails((current) => ({ ...current, [item.id]: response.test }));
    const detailIsConclusive = isConclusiveSplitStatus(response.test.status);
    const reconciliationError = detailIsConclusive ? null : response.reconciliation.error;
    if (reconciliationError !== null) {
      setSplitReconciliationErrors((current) => ({ ...current, [item.id]: reconciliationError }));
      if (options?.showMessage) {
        setError(reconciliationError);
        setMessage('');
      }
    } else {
      setSplitReconciliationErrors((current) => {
        const next = { ...current };
        delete next[item.id];
        return next;
      });
      if (options?.showMessage) {
        setMessage(getSplitStatusMessage(response.test.status));
      }
    }
    return response;
  }

  async function testSplit(item: Laboratory) {
    if (!token || !item.active || !hasAsaasWallet(item) || isSplitPending(item)) return;

    const guardKey = `create-split:${item.id}`;
    if (inflightActions.current.has(guardKey)) return;
    inflightActions.current.add(guardKey);

    setError('');
    setMessage('');
    setRowAction({ id: item.id, kind: 'create-split' });
    try {
      const retryFailed = getSplitValidationStatus(item) === 'failed';
      const response = await api.post<SplitTestCreateResponse>(
        `/v1/admin/commerce/laboratories/${item.id}/test-split`,
        retryFailed ? { retryFailed: true } : {},
        token
      );
      window.open(response.test.url, '_blank', 'noopener,noreferrer');
      setMessage('Checkout de teste criado. Acompanhe o status abaixo e atualize manualmente após o pagamento no Sandbox.');
      await load();
      try {
        await loadSplitTestStatus(item);
      } catch {
        // A lista já carrega o estado persistido; os detalhes podem ser recuperados manualmente depois.
      }
    } catch {
      setError('Não foi possível criar o checkout de teste do split.');
    } finally {
      inflightActions.current.delete(guardKey);
      setRowAction(null);
    }
  }

  async function checkSplit(item: Laboratory) {
    if (!token || !item.active || !hasAsaasWallet(item) || getPersistedSplitTest(item) === null) return;
    setError('');
    setMessage('');
    setRowAction({ id: item.id, kind: 'refresh-split' });
    try {
      const response = await loadSplitTestStatus(item, { showMessage: true });
      const refreshedLaboratories = await load();
      const refreshedItem = refreshedLaboratories?.find((laboratory) => laboratory.id === item.id) ?? null;
      const refreshedStatus = refreshedItem === null ? null : getSplitValidationStatus(refreshedItem);
      if (response?.reconciliation.error && refreshedLaboratories !== null && !isConclusiveSplitStatus(refreshedStatus)) {
        setError(response.reconciliation.error);
        setMessage('');
      }
    } catch {
      setError('Não foi possível consultar o resultado do teste de split. Envie um teste antes de consultar.');
    } finally {
      setRowAction(null);
    }
  }

  async function guaranteeAsaasIntegration(item: Laboratory) {
    if (item.asaasMode !== 'linked_account' || !hasAsaasWallet(item)) {
      setError('Informe o wallet Asaas antes de validar a integração.');
      return;
    }

    await action(item.id, 'validate-asaas', 'validate-asaas', {}, 'Integração Asaas validada.');
  }

  return (
    <PageStack>
      <PageHeader>
        <PageTitle><Factory size={28} aria-hidden /> Laboratórios</PageTitle>
        <PageSubtitle>Vincule contas Asaas de laboratórios e configure os repasses dos pedidos Biteplaner.</PageSubtitle>
      </PageHeader>

      {error ? <S.Alert role="alert"><Info size={20} aria-hidden /><div><strong>{error}</strong><span>Verifique sua conexão ou tente novamente mais tarde.</span></div></S.Alert> : null}
      {message ? <S.SuccessText role="status">{message}</S.SuccessText> : null}

      <S.Panel>
        <S.PanelHeader>
          <div>
            <S.PanelTitle>Laboratórios cadastrados</S.PanelTitle>
            <S.PanelDescription>O laboratório mantém sua conta e seus valores no Asaas. A Nexor armazena o walletId, valida a conta e configura o split.</S.PanelDescription>
          </div>
          <S.Toolbar>
            <AdminFormButton type="button" variant="primary" leadingIcon={<Plus size={16} aria-hidden />} onClick={openCreate}>
              Cadastrar Laboratório
            </AdminFormButton>
            <AdminFormButton type="button" variant="secondary" leadingIcon={includeInactive ? <EyeOff size={16} aria-hidden /> : <Eye size={16} aria-hidden />} onClick={() => setIncludeInactive((value) => !value)}>
              {includeInactive ? 'Ocultar inativos' : 'Exibir inativos'}
            </AdminFormButton>
            <AdminFormButton type="button" variant="secondary" leadingIcon={<RefreshCw size={16} aria-hidden />} disabled={loading} onClick={() => void load()}>
              Atualizar
            </AdminFormButton>
          </S.Toolbar>
        </S.PanelHeader>
        <S.WeightSummary>Peso pronto: <strong>{percent(totalWeight)}</strong>.<br />Para distribuir corretamente, os laboratórios ativos e aprovados devem somar 100%.</S.WeightSummary>
        <S.TableScroller>
          {items.length === 0 && !loading ? (
            <S.EmptyState><S.EmptyIcon><Inbox size={24} aria-hidden /></S.EmptyIcon><S.EmptyTitle>Nenhum laboratório cadastrado.</S.EmptyTitle><S.EmptyText>Cadastre um novo laboratório para começar.</S.EmptyText></S.EmptyState>
          ) : (
            <S.Table>
              <thead>
                <tr><th>Laboratório</th><th>Asaas</th><th>Split fixo (R$)</th><th>Peso (%)</th><th>Status</th><th>Ações</th></tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const persistedSplitTest = getPersistedSplitTest(item);
                  const splitStatus = getSplitValidationStatus(item);
                  const splitDetails = splitTestDetails[item.id] ?? null;
                  const reconciliationError = splitReconciliationErrors[item.id] ?? null;
                  const failureReason = reconciliationError ?? getFailureReason(item, splitDetails);
                  const amountCents = getSplitDisplayAmount(persistedSplitTest, splitDetails);
                  const splitApproved = isSplitApproved(item);
                  const currentWalletPendingValidation = isCurrentWalletPendingValidation(item);
                  const integrationPendingValidation = isIntegrationPendingValidation(item);
                  const validatedWalletId = persistedSplitTest?.walletId ?? splitDetails?.walletId ?? null;
                  const actionDisabled = rowAction?.id === item.id;
                  const consultDisabled = persistedSplitTest === null || rowAction?.id === item.id;
                  const createDisabled = !item.active || !hasAsaasWallet(item) || isSplitPending(item) || rowAction?.id === item.id;
                  const createdAt = splitDetails?.createdAt ?? null;
                  const verificationDate = splitApproved ? persistedSplitTest?.verifiedAt ?? null : null;
                  const lastWebhookEventAt = splitDetails?.lastWebhookEventAt ?? persistedSplitTest?.lastWebhookEventAt ?? null;

                  return (
                    <tr key={item.id}>
                      <td><strong>{item.name}</strong><span>{item.email}</span></td>
                      <td>
                        Conta Asaas vinculada
                        <span>{item.asaasWalletId ?? 'Wallet pendente'}</span>
                        <span>{readinessAwareIntegrationStatusLabel(item)}</span>
                        {item.integrationErrorMessage ? <span>{item.integrationErrorMessage}</span> : null}
                      </td>
                      <td>{money(item.splitFixedValueCents)}</td>
                      <td>{percent(item.distributionWeightBasisPoints)}</td>
                      <td>
                        <S.StatusStack>
                          <S.Badge $tone={currentWalletPendingValidation || integrationPendingValidation ? 'warning' : getSplitStatusTone(splitStatus)} $ok={splitApproved}>{currentWalletPendingValidation ? 'Wallet atual pendente de validação' : integrationPendingValidation ? 'Integração Asaas pendente' : getSplitStatusLabel(splitStatus)}</S.Badge>
                          {createdAt ? <S.StatusMeta>Teste criado em {formatDateTime(createdAt)}</S.StatusMeta> : null}
                          {persistedSplitTest !== null ? <S.StatusMeta>Valor do teste: {amountCents !== null ? money(amountCents) : 'não disponível'}</S.StatusMeta> : null}
                          {persistedSplitTest !== null ? <S.StatusMeta>Wallet validado: {validatedWalletId ?? 'não disponível'}</S.StatusMeta> : null}
                          {persistedSplitTest?.paymentStatus ? <S.StatusMeta>Pagamento Asaas: {persistedSplitTest.paymentStatus}</S.StatusMeta> : null}
                          {persistedSplitTest?.splitStatus ? <S.StatusMeta>Split Asaas: {persistedSplitTest.splitStatus}</S.StatusMeta> : null}
                          {verificationDate ? <S.StatusMeta>Aprovado em {formatDateTime(verificationDate)}</S.StatusMeta> : null}
                          {!verificationDate && lastWebhookEventAt ? <S.StatusMeta>Último webhook em {formatDateTime(lastWebhookEventAt)}</S.StatusMeta> : null}
                          {failureReason ? <S.ErrorText>{failureReason}</S.ErrorText> : null}
                          {currentWalletPendingValidation ? <S.HelperText>O wallet atual precisa de um novo teste aprovado antes de operar em produção.</S.HelperText> : null}
                          {integrationPendingValidation ? <S.HelperText>A integração Asaas precisa estar pronta antes de operar em produção.</S.HelperText> : null}
                          {splitStatus === 'failed' ? <S.HelperText>Após corrigir o wallet ou a conta no Asaas, envie um novo teste.</S.HelperText> : null}
                          {!item.active ? <S.HelperText>Laboratório inativo; operação indisponível.</S.HelperText> : null}
                        </S.StatusStack>
                      </td>
                      <td>
                        <S.Actions>
                          <S.IconButton type="button" onClick={() => edit(item)} aria-label={`Editar ${item.name}`} title="Editar"><Pencil size={15} aria-hidden /></S.IconButton>
                          {item.active ? (
                            <S.IconButton type="button" disabled={actionDisabled} onClick={() => void action(item.id, 'deactivate', 'deactivate')} aria-label={`Excluir ${item.name}`} title="Excluir"><Trash2 size={15} aria-hidden /></S.IconButton>
                          ) : (
                            <S.IconButton type="button" disabled={actionDisabled} onClick={() => void action(item.id, 'activate', 'activate')} aria-label={`Ativar ${item.name}`} title="Ativar"><ToggleLeft size={15} aria-hidden /></S.IconButton>
                          )}
                          {item.active && hasAsaasWallet(item) ? (
                            <S.IconButton
                              type="button"
                              disabled={createDisabled}
                              onClick={() => void testSplit(item)}
                              aria-label={`${getCreateSplitLabel(item)} de ${item.name}`}
                              title={isSplitPending(item) ? 'Aguarde a conclusão do teste atual' : getCreateSplitLabel(item)}
                            ><FlaskConical size={15} aria-hidden /></S.IconButton>
                          ) : null}
                          {item.active && hasAsaasWallet(item) ? (
                            <S.IconButton
                              type="button"
                              disabled={consultDisabled}
                              onClick={() => void checkSplit(item)}
                              aria-label={`Consultar resultado do split de ${item.name}`}
                              title={persistedSplitTest === null ? 'Envie um teste de split primeiro' : 'Consultar resultado do split'}
                            ><RefreshCw size={15} aria-hidden /></S.IconButton>
                          ) : null}
                          {canGuaranteeAsaasIntegration(item) ? (
                            <S.IconButton
                              type="button"
                              disabled={actionDisabled}
                              onClick={() => void guaranteeAsaasIntegration(item)}
                              aria-label={`${asaasActionLabel()} de ${item.name}`}
                              title={asaasActionLabel()}
                            ><ShieldCheck size={15} aria-hidden /></S.IconButton>
                          ) : null}
                        </S.Actions>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </S.Table>
          )}
        </S.TableScroller>
      </S.Panel>

      <AdminModal
        open={isFormOpen}
        size="wide"
        title={editingId ? 'Editar laboratório' : 'Novo laboratório'}
        subtitle="O peso é a participação na fila de pedidos, não um percentual de split dentro da mesma cobrança."
        icon={<Factory size={24} aria-hidden />}
        onClose={reset}
      >
        <S.ModalForm onSubmit={save}>
          <S.FormGrid>
            <S.FieldWrap><span>Wallet Asaas</span><input required value={form.asaasWalletId} onChange={(event) => change('asaasWalletId', event.target.value)} placeholder="wallet_..." /></S.FieldWrap>
            <S.FieldWrap><span>Nome do laboratório</span><input required value={form.name} onChange={(event) => change('name', event.target.value)} /></S.FieldWrap>
            <S.FieldWrap><span>Split fixo (R$)</span><input required inputMode="decimal" value={form.splitFixedValue} onChange={(event) => change('splitFixedValue', formatMoneyInput(event.target.value))} placeholder="R$ 0,00" /></S.FieldWrap>
            <S.FieldWrap><span>Peso de distribuição (%)</span><input required inputMode="decimal" value={form.weight} onChange={(event) => change('weight', sanitizeDecimalInput(event.target.value))} onBlur={() => change('weight', formatPercentageInput(form.weight))} placeholder="50,00%" /></S.FieldWrap>
          </S.FormGrid>
          <S.Actions><AdminFormButton type="submit" variant="primary" leadingIcon={<Plus size={16} aria-hidden />} disabled={saving}>{saving ? 'Salvando...' : editingId ? 'Salvar alterações' : 'Cadastrar laboratório'}</AdminFormButton><AdminFormButton type="button" variant="secondary" leadingIcon={<Trash2 size={16} aria-hidden />} onClick={reset}>Cancelar</AdminFormButton></S.Actions>
        </S.ModalForm>
      </AdminModal>
    </PageStack>
  );
}