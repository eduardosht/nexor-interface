import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { AdminFormButton, Field, Select } from '@nexor/design-system';
import { useAuth } from '../../../../hooks/useAuth';
import { api, ApiError } from '../../../../lib/api';
import {
  PageHeader,
  PageStack,
  PageSubtitle,
  PageTitle,
  SectionDescription,
  SectionTitle,
  StatCard,
  StatGrid,
  StatLabel,
  StatValue,
} from '../styles';
import * as S from './styles';

type CompanyType = 'MEI' | 'LIMITED' | 'INDIVIDUAL' | 'ASSOCIATION';

type Laboratory = {
  id: string;
  profileId: string;
  legalName: string;
  tradeName: string | null;
  cnpj: string;
  email: string;
  phoneNumber: string;
  incomeValue: number;
  companyType: CompanyType;
  address: {
    postalCode: string;
    address: string;
    addressNumber: string;
    province: string;
  };
  financialAccount: { status: string; asaasWalletId: string | null } | null;
};

type SplitSettings = {
  laboratoryProfileId: string;
  laboratoryFixedValueCents: number;
  nexorFixedValueCents: number;
  nexorWalletId: string;
};

type FormValues = {
  legalName: string;
  tradeName: string;
  cnpj: string;
  email: string;
  phoneNumber: string;
  incomeValue: string;
  companyType: CompanyType;
  postalCode: string;
  address: string;
  addressNumber: string;
  province: string;
};

const COMPANY_TYPE_OPTIONS = [
  { value: 'MEI', label: 'MEI' },
  { value: 'LIMITED', label: 'LTDA' },
  { value: 'INDIVIDUAL', label: 'Empresário individual' },
  { value: 'ASSOCIATION', label: 'Associação' },
];

const emptyForm: FormValues = {
  legalName: '',
  tradeName: '',
  cnpj: '',
  email: '',
  phoneNumber: '',
  incomeValue: '',
  companyType: 'LIMITED',
  postalCode: '',
  address: '',
  addressNumber: '',
  province: '',
};

const onlyDigits = (value: string) => value.replace(/\D/g, '');
const centsFromCurrency = (value: string) => Number(onlyDigits(value));
const currencyFromCents = (value: number) => (value / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const formatCnpj = (value: string) => {
  const digits = onlyDigits(value).slice(0, 14);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
};
const formatPhone = (value: string) => {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};
const formatCep = (value: string) => {
  const digits = onlyDigits(value).slice(0, 8);
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
};
const formatCurrency = (value: string) => {
  const cents = centsFromCurrency(value);
  return cents === 0 ? '' : currencyFromCents(cents);
};

export function AdminLaboratories() {
  const { session } = useAuth();
  const token = session?.access_token;
  const [laboratories, setLaboratories] = useState<Laboratory[]>([]);
  const [settings, setSettings] = useState<SplitSettings | null>(null);
  const [form, setForm] = useState<FormValues>(emptyForm);
  const [splitForm, setSplitForm] = useState({ laboratoryProfileId: '', laboratoryFixedValue: '', nexorFixedValue: '', nexorWalletId: '' });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function load() {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const [labsResponse, settingsResponse] = await Promise.all([
        api.get<{ laboratories: Laboratory[] }>('/v1/admin/biteplaner/laboratories', token),
        api.get<{ settings: SplitSettings | null }>('/v1/admin/biteplaner/split-settings', token),
      ]);
      setLaboratories(labsResponse.laboratories);
      setSettings(settingsResponse.settings);
      if (settingsResponse.settings) {
        setSplitForm({
          laboratoryProfileId: settingsResponse.settings.laboratoryProfileId,
          laboratoryFixedValue: currencyFromCents(settingsResponse.settings.laboratoryFixedValueCents),
          nexorFixedValue: currencyFromCents(settingsResponse.settings.nexorFixedValueCents),
          nexorWalletId: settingsResponse.settings.nexorWalletId,
        });
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível carregar laboratórios.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [token]);

  const activeLaboratory = useMemo(
    () => laboratories.find((lab) => lab.profileId === splitForm.laboratoryProfileId),
    [laboratories, splitForm.laboratoryProfileId]
  );

  async function submitLaboratory(event: FormEvent) {
    event.preventDefault();
    if (!token) return;
    setSaving(true);
    setError('');
    setMessage('');
    try {
      await api.post('/v1/admin/biteplaner/laboratories', {
        legalName: form.legalName,
        tradeName: form.tradeName || undefined,
        cnpj: form.cnpj,
        email: form.email,
        phoneNumber: form.phoneNumber,
        incomeValue: centsFromCurrency(form.incomeValue),
        companyType: form.companyType,
        address: {
          postalCode: form.postalCode,
          address: form.address,
          addressNumber: form.addressNumber,
          province: form.province,
        },
      }, token);
      setForm(emptyForm);
      setMessage('Laboratório cadastrado.');
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível cadastrar o laboratório.');
    } finally {
      setSaving(false);
    }
  }

  async function createAsaasAccount(laboratoryId: string) {
    if (!token) return;
    setSaving(true);
    setError('');
    setMessage('');
    try {
      await api.post(`/v1/admin/biteplaner/laboratories/${laboratoryId}/asaas-account`, {}, token);
      setMessage('Conta Asaas do laboratório criada ou atualizada.');
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível criar a conta Asaas do laboratório.');
    } finally {
      setSaving(false);
    }
  }

  async function saveSplit(event: FormEvent) {
    event.preventDefault();
    if (!token) return;
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const response = await api.put<{ settings: SplitSettings }>('/v1/admin/biteplaner/split-settings', {
        laboratoryProfileId: splitForm.laboratoryProfileId,
        laboratoryFixedValueCents: centsFromCurrency(splitForm.laboratoryFixedValue),
        nexorFixedValueCents: centsFromCurrency(splitForm.nexorFixedValue),
        nexorWalletId: splitForm.nexorWalletId,
      }, token);
      setSettings(response.settings);
      setMessage('Configuração de split salva.');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível salvar a configuração de split.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageStack>
      <PageHeader>
        <PageTitle>Laboratórios</PageTitle>
        <PageSubtitle>Cadastre recebedores de laboratório, crie subcontas Asaas e configure o split do Biteplaner.</PageSubtitle>
      </PageHeader>

      {error ? <S.Alert role="alert">{error}</S.Alert> : null}
      {message ? <S.Success role="status">{message}</S.Success> : null}

      <StatGrid>
        <StatCard padding="lg">
          <StatValue>{laboratories.length}</StatValue>
          <StatLabel>Laboratórios cadastrados</StatLabel>
        </StatCard>
        <StatCard padding="lg">
          <StatValue>{laboratories.filter((lab) => lab.financialAccount?.asaasWalletId).length}</StatValue>
          <StatLabel>Com wallet Asaas</StatLabel>
        </StatCard>
        <StatCard padding="lg">
          <StatValue>{settings ? 'Ativo' : 'Pendente'}</StatValue>
          <StatLabel>Split configurado</StatLabel>
        </StatCard>
      </StatGrid>

      <S.AdminGrid>
        <S.Panel as="form" onSubmit={submitLaboratory}>
          <SectionTitle>Novo laboratório</SectionTitle>
          <SectionDescription>Dados usados para cadastro operacional e criação da subconta Asaas do recebedor.</SectionDescription>
          <S.FieldsGrid>
            <Field label="Razão social" value={form.legalName} required onChange={(event) => setForm((current) => ({ ...current, legalName: event.target.value }))} />
            <Field label="Nome fantasia" value={form.tradeName} onChange={(event) => setForm((current) => ({ ...current, tradeName: event.target.value }))} />
            <Field label="CNPJ" value={form.cnpj} required inputMode="numeric" maxLength={18} onChange={(event) => setForm((current) => ({ ...current, cnpj: formatCnpj(event.target.value) }))} />
            <Field label="E-mail" value={form.email} required inputMode="email" onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
            <Field label="Celular" value={form.phoneNumber} required inputMode="tel" maxLength={15} onChange={(event) => setForm((current) => ({ ...current, phoneNumber: formatPhone(event.target.value) }))} />
            <Field label="Faturamento aproximado" value={form.incomeValue} required inputMode="numeric" onChange={(event) => setForm((current) => ({ ...current, incomeValue: formatCurrency(event.target.value) }))} />
            <Select label="Tipo de empresa" value={form.companyType} options={COMPANY_TYPE_OPTIONS} onChange={(value) => setForm((current) => ({ ...current, companyType: value as CompanyType }))} />
            <Field label="CEP" value={form.postalCode} required inputMode="numeric" maxLength={9} onChange={(event) => setForm((current) => ({ ...current, postalCode: formatCep(event.target.value) }))} />
            <Field label="Endereço" value={form.address} required onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))} />
            <Field label="Número" value={form.addressNumber} required onChange={(event) => setForm((current) => ({ ...current, addressNumber: event.target.value }))} />
            <Field label="Bairro" value={form.province} required onChange={(event) => setForm((current) => ({ ...current, province: event.target.value }))} />
          </S.FieldsGrid>
          <AdminFormButton type="submit" disabled={saving}>Cadastrar laboratório</AdminFormButton>
        </S.Panel>

        <S.Panel as="form" onSubmit={saveSplit}>
          <SectionTitle>Split da compra</SectionTitle>
          <SectionDescription>O checkout é emitido pela subconta do dentista. Laboratório e Nexor recebem valores fixos; o restante fica com o dentista.</SectionDescription>
          <S.FieldsGrid>
            <Select
              label="Laboratório padrão"
              value={splitForm.laboratoryProfileId}
              placeholder="Selecione um laboratório"
              options={laboratories.map((lab) => ({ value: lab.profileId, label: lab.tradeName || lab.legalName }))}
              onChange={(value) => setSplitForm((current) => ({ ...current, laboratoryProfileId: value }))}
            />
            <Field label="Valor fixo laboratório" value={splitForm.laboratoryFixedValue} required inputMode="numeric" onChange={(event) => setSplitForm((current) => ({ ...current, laboratoryFixedValue: formatCurrency(event.target.value) }))} />
            <Field label="Valor fixo Nexor" value={splitForm.nexorFixedValue} required inputMode="numeric" onChange={(event) => setSplitForm((current) => ({ ...current, nexorFixedValue: formatCurrency(event.target.value) }))} />
            <Field label="WalletId Nexor" value={splitForm.nexorWalletId} required onChange={(event) => setSplitForm((current) => ({ ...current, nexorWalletId: event.target.value }))} />
          </S.FieldsGrid>
          {activeLaboratory ? <S.SplitHint>Laboratório selecionado: {activeLaboratory.legalName}</S.SplitHint> : null}
          <AdminFormButton type="submit" disabled={saving || !splitForm.laboratoryProfileId}>Salvar split</AdminFormButton>
        </S.Panel>
      </S.AdminGrid>

      <S.Panel>
        <SectionTitle>Laboratórios cadastrados</SectionTitle>
        {loading ? <p>Carregando laboratórios...</p> : null}
        <S.Table>
          <thead>
            <tr>
              <th>Laboratório</th>
              <th>CNPJ</th>
              <th>Contato</th>
              <th>Asaas</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {laboratories.map((lab) => (
              <tr key={lab.id}>
                <td>{lab.tradeName || lab.legalName}</td>
                <td>{formatCnpj(lab.cnpj)}</td>
                <td>{lab.email}</td>
                <td>{lab.financialAccount?.asaasWalletId ? 'Wallet configurada' : 'Pendente'}</td>
                <td><button type="button" onClick={() => void createAsaasAccount(lab.id)} disabled={saving}>Criar conta Asaas</button></td>
              </tr>
            ))}
          </tbody>
        </S.Table>
      </S.Panel>
    </PageStack>
  );
}