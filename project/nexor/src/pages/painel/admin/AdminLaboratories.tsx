import { AdminFormButton, Select, formatPhoneValue } from '@nexor/design-system';
import { Eye, EyeOff, Factory, Info, Pencil, Plus, RefreshCw, ShieldCheck, ToggleLeft, ToggleRight, Trash2, Inbox } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { api } from '../../../lib/api';
import * as S from './AdminLaboratories.styles';
import { PageHeader, PageStack, PageSubtitle, PageTitle } from './styles';

type Laboratory = {
  id: string; name: string; legalName: string; cnpj: string; email: string; phone: string | null;
  asaasMode: 'linked_account' | 'created_subaccount'; asaasAccountId: string | null; asaasWalletId: string | null;
  integrationStatus: 'pending' | 'ready' | 'error' | 'disabled'; integrationErrorMessage: string | null;
  splitFixedValueCents: number; distributionWeightBasisPoints: number; active: boolean;
};
type Response = { laboratories: Laboratory[] };
type Form = { name: string; legalName: string; cnpj: string; email: string; phone: string; asaasMode: Laboratory['asaasMode']; asaasWalletId: string; splitFixedValue: string; weight: string };
const emptyForm: Form = { name: '', legalName: '', cnpj: '', email: '', phone: '', asaasMode: 'linked_account', asaasWalletId: '', splitFixedValue: '', weight: '' };
const money = (cents: number) => (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const percent = (basis: number) => `${(basis / 100).toFixed(2).replace('.', ',')}%`;
const toCents = (value: string) => Math.round(Number(value.replace(',', '.')) * 100);

export function AdminLaboratories() {
  const { session } = useAuth();
  const token = session?.access_token;
  const [items, setItems] = useState<Laboratory[]>([]);
  const [form, setForm] = useState<Form>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [includeInactive, setIncludeInactive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true); setError('');
    try {
      const query = includeInactive ? '?includeInactive=true' : '';
      const response = await api.get<Response>(`/v1/admin/commerce/laboratories${query}`, token);
      setItems(response.laboratories);
    } catch {
      setError('Não foi possível carregar os laboratórios.');
    } finally { setLoading(false); }
  }, [includeInactive, token]);

  useEffect(() => { void load(); }, [load]);

  const totalWeight = useMemo(
    () => items.filter((item) => item.active && item.integrationStatus === 'ready').reduce((sum, item) => sum + item.distributionWeightBasisPoints, 0),
    [items]
  );

  function change<K extends keyof Form>(key: K, value: Form[K]) { setForm((current) => ({ ...current, [key]: value })); }
  function reset() { setEditingId(null); setForm(emptyForm); }
  function edit(item: Laboratory) {
    setEditingId(item.id);
    setForm({ name: item.name, legalName: item.legalName, cnpj: item.cnpj, email: item.email, phone: item.phone ?? '', asaasMode: item.asaasMode, asaasWalletId: item.asaasWalletId ?? '', splitFixedValue: (item.splitFixedValueCents / 100).toFixed(2), weight: (item.distributionWeightBasisPoints / 100).toFixed(2) });
    setMessage('');
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!token) return;
    setSaving(true); setError(''); setMessage('');
    try {
      const base = { name: form.name, legalName: form.legalName, cnpj: form.cnpj, email: form.email, phone: form.phone || undefined, splitFixedValueCents: toCents(form.splitFixedValue), distributionWeightBasisPoints: Math.round(Number(form.weight.replace(',', '.')) * 100) };
      const payload = form.asaasMode === 'linked_account'
        ? { ...base, asaasMode: 'linked_account' as const, asaasWalletId: form.asaasWalletId }
        : { ...base, asaasMode: 'created_subaccount' as const, cep: '00000000', addressLine: 'A preencher', addressNumber: 's/n', neighborhood: 'A preencher', city: 'A preencher', state: 'SP' };
      if (editingId) await api.patch(`/v1/admin/commerce/laboratories/${editingId}`, payload, token);
      else await api.post('/v1/admin/commerce/laboratories', payload, token);
      reset(); setMessage('Laboratório salvo com sucesso.'); await load();
    } catch { setError('Não foi possível salvar. Verifique os dados e a integração Asaas.'); }
    finally { setSaving(false); }
  }

  async function action(id: string, path: string, body: Record<string, unknown> = {}) {
    if (!token) return;
    setError('');
    try { await api.post(`/v1/admin/commerce/laboratories/${id}/${path}`, body, token); await load(); }
    catch { setError('Não foi possível concluir a ação do laboratório.'); }
  }

  return (
    <PageStack>
      <PageHeader>
        <PageTitle><Factory size={28} aria-hidden /> Laboratórios</PageTitle>
        <PageSubtitle>Cadastre os recebedores Asaas e configure como os pedidos Biteplaner serão distribuídos.</PageSubtitle>
      </PageHeader>

      {error ? <S.Alert role="alert"><Info size={20} aria-hidden /><div><strong>{error}</strong><span>Verifique sua conexão ou tente novamente mais tarde.</span></div></S.Alert> : null}
      {message ? <S.SuccessText role="status">{message}</S.SuccessText> : null}

      <S.Grid>
        <S.Panel>
          <S.Toolbar>
            <AdminFormButton type="button" variant="secondary" leadingIcon={includeInactive ? <EyeOff size={16} aria-hidden /> : <Eye size={16} aria-hidden />} onClick={() => setIncludeInactive((value) => !value)}>
              {includeInactive ? 'Ocultar inativos' : 'Exibir inativos'}
            </AdminFormButton>
            <AdminFormButton type="button" variant="secondary" leadingIcon={<RefreshCw size={16} aria-hidden />} disabled={loading} onClick={() => void load()}>
              Atualizar
            </AdminFormButton>
          </S.Toolbar>
          <S.WeightSummary>Peso pronto: <strong>{percent(totalWeight)}</strong>.<br />Para distribuir corretamente, os laboratórios ativos e prontos devem somar 100%.</S.WeightSummary>
          <S.TableScroller>
            {items.length === 0 && !loading ? (
              <S.EmptyState><S.EmptyIcon><Inbox size={24} aria-hidden /></S.EmptyIcon><S.EmptyTitle>Nenhum laboratório cadastrado.</S.EmptyTitle><S.EmptyText>Cadastre um novo laboratório para começar.</S.EmptyText></S.EmptyState>
            ) : (
              <S.Table><thead><tr><th>Laboratório</th><th>Asaas</th><th>Split fixo (R$)</th><th>Peso (%)</th><th>Status</th><th>Ações</th></tr></thead><tbody>
                {items.map((item) => <tr key={item.id}><td><strong>{item.name}</strong><span>{item.email}</span></td><td>{item.asaasMode === 'linked_account' ? 'Conta vinculada' : 'Subconta Nexor'}<span>{item.asaasWalletId ?? 'Wallet pendente'}</span></td><td>{money(item.splitFixedValueCents)}</td><td>{percent(item.distributionWeightBasisPoints)}</td><td><S.Badge $ok={item.active && item.integrationStatus === 'ready'}>{item.active ? item.integrationStatus : 'inativo'}</S.Badge></td><td><S.Actions><S.IconButton type="button" onClick={() => edit(item)} aria-label={`Editar ${item.name}`} title="Editar"><Pencil size={15} aria-hidden /></S.IconButton><S.IconButton type="button" onClick={() => void action(item.id, item.active ? 'deactivate' : 'activate')} aria-label={item.active ? `Desativar ${item.name}` : `Ativar ${item.name}`} title={item.active ? 'Desativar' : 'Ativar'}>{item.active ? <ToggleRight size={15} aria-hidden /> : <ToggleLeft size={15} aria-hidden />}</S.IconButton>{item.asaasMode === 'linked_account' && item.asaasWalletId ? <S.IconButton type="button" onClick={() => void action(item.id, 'validate-asaas')} aria-label="Validar Asaas" title="Validar Asaas"><ShieldCheck size={15} aria-hidden /></S.IconButton> : null}</S.Actions></td></tr>)}
              </tbody></S.Table>
            )}
          </S.TableScroller>
        </S.Panel>

        <S.Panel as="form" onSubmit={save}>
          <S.PanelHeader><div><S.PanelTitle>{editingId ? 'Editar laboratório' : 'Novo laboratório'}</S.PanelTitle><S.PanelDescription>O peso é a participação da fila de pedidos, não um percentual de split dentro da mesma cobrança.</S.PanelDescription></div></S.PanelHeader>
          <S.FormGrid>
            <Select label="Modo Asaas" required options={[{ value: 'linked_account', label: 'Vincular conta existente' }, { value: 'created_subaccount', label: 'Criar subconta Nexor' }]} value={form.asaasMode} onChange={(value) => change('asaasMode', value as Form['asaasMode'])} />
            {form.asaasMode === 'linked_account' ? <S.FieldWrap><span>Wallet Asaas</span><input required value={form.asaasWalletId} onChange={(event) => change('asaasWalletId', event.target.value)} placeholder="wallet_..." /></S.FieldWrap> : null}
            <S.FieldWrap><span>Nome fantasia</span><input required value={form.name} onChange={(event) => change('name', event.target.value)} /></S.FieldWrap>
            <S.FieldWrap><span>Razão social</span><input required value={form.legalName} onChange={(event) => change('legalName', event.target.value)} /></S.FieldWrap>
            <S.FieldWrap><span>CNPJ</span><input required value={form.cnpj} onChange={(event) => change('cnpj', event.target.value)} /></S.FieldWrap>
            <S.FieldWrap><span>E-mail</span><input required type="email" value={form.email} onChange={(event) => change('email', event.target.value)} /></S.FieldWrap>
            <S.FieldWrap><span>Telefone</span><input inputMode="tel" value={form.phone} onChange={(event) => change('phone', formatPhoneValue(event.target.value))} placeholder="(11) 99999-9999" /></S.FieldWrap>
            <S.FieldWrap><span>Split fixo (R$)</span><input required inputMode="decimal" value={form.splitFixedValue} onChange={(event) => change('splitFixedValue', event.target.value)} placeholder="0,00" /></S.FieldWrap>
            <S.FieldWrap><span>Peso de distribuição (%)</span><input required inputMode="decimal" value={form.weight} onChange={(event) => change('weight', event.target.value)} placeholder="50,00" /></S.FieldWrap>
          </S.FormGrid>
          <S.Actions><AdminFormButton type="submit" variant="primary" leadingIcon={<Plus size={16} aria-hidden />} disabled={saving}>{saving ? 'Salvando...' : editingId ? 'Salvar alterações' : 'Cadastrar laboratório'}</AdminFormButton>{editingId ? <AdminFormButton type="button" variant="secondary" leadingIcon={<Trash2 size={16} aria-hidden />} onClick={reset}>Cancelar</AdminFormButton> : null}</S.Actions>
        </S.Panel>
      </S.Grid>
    </PageStack>
  );
}