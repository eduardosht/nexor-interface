import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ClipboardList, CreditCard, RefreshCw, ShoppingCart, WalletCards } from 'lucide-react';
import {
  getFinancialOnboarding,
  type FinancialAccountStatus,
  type FinancialAccountStatusRecord
} from '../../../features/financialOnboarding/asaasFinancialAccount.api';
import { useAuth } from '../../../hooks/useAuth';
import * as S from './styles';

const statusLabels: Record<FinancialAccountStatus, string> = {
  not_started: 'Cadastro financeiro não iniciado',
  pending_onboarding: 'Cadastro financeiro pendente',
  creating: 'Criando conta Asaas',
  awaiting_approval: 'Aguardando aprovação Asaas',
  active: 'Conta Asaas ativa',
  creation_failed: 'Cadastro financeiro com pendência',
  disabled: 'Conta Asaas desativada',
  deletion_requested: 'Exclusão financeira solicitada',
  archived: 'Conta financeira arquivada'
};

function getStatusDescription(account: FinancialAccountStatusRecord | null) {
  if (account === null) {
    return 'Assim que seu cadastro de dentista estiver aprovado, a Parte 2 financeira aparecerá aqui.';
  }

  if (account.status === 'active') {
    return 'Sua conta financeira está apta para participar do split de pagamentos do Biteplaner.';
  }

  if (account.status === 'awaiting_approval') {
    return 'O cadastro foi enviado ao Asaas. Acompanhe a aprovação antes de receber splits.';
  }

  if (account.status === 'creation_failed') {
    return account.providerErrorMessage ?? 'Revise o cadastro financeiro para corrigir a pendência.';
  }

  return 'Complete a Parte 2 para criar e validar sua conta financeira no Asaas.';
}

export function BiteplanerHome() {
  const { session } = useAuth();
  const token = session?.access_token;
  const [accounts, setAccounts] = useState<FinancialAccountStatusRecord[]>([]);
  const [loading, setLoading] = useState(Boolean(token));
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    let active = true;

    async function loadFinancialStatus() {
      setLoading(true);
      setError('');

      try {
        const response = await getFinancialOnboarding(token);

        if (active) {
          setAccounts(Array.isArray(response.accounts) ? response.accounts : []);
        }
      } catch {
        if (active) {
          setError('Não foi possível carregar o status financeiro agora.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadFinancialStatus();

    return () => {
      active = false;
    };
  }, [token]);

  const dentistAccount = useMemo(
    () => accounts.find((account) => account.role === 'dentist') ?? null,
    [accounts]
  );
  const status = dentistAccount?.status ?? 'not_started';
  const statusTone = dentistAccount?.status === 'active'
    ? 'success'
    : dentistAccount?.status === 'creation_failed'
      ? 'error'
      : 'warning';

  return (
    <S.Page>
      <S.Header>
        <S.Eyebrow>Biteplaner</S.Eyebrow>
        <S.Title>Home Biteplaner</S.Title>
        <S.Description>
          Acompanhe seu cadastro financeiro Asaas, acesse suas ordens e inicie uma compra Biteplaner pelo mesmo ponto de entrada.
        </S.Description>
      </S.Header>

      <S.StatusPanel $tone={statusTone} role="status">
        <S.StatusIcon $tone={statusTone} aria-hidden>
          <WalletCards size={22} />
        </S.StatusIcon>
        <S.StatusContent>
          <span>Status Asaas</span>
          <strong>{loading ? 'Carregando status financeiro' : statusLabels[status]}</strong>
          <p>{error || getStatusDescription(dentistAccount)}</p>
        </S.StatusContent>
        <S.StatusAction to="/painel/biteplaner/financeiro?role=dentist">
          Ver status financeiro
          <ArrowRight size={16} aria-hidden />
        </S.StatusAction>
      </S.StatusPanel>

      <S.ActionsGrid aria-label="Atalhos Biteplaner">
        <S.ActionLink to="/painel/compra">
          <S.ActionIcon $tone="purchase" aria-hidden><ShoppingCart size={20} /></S.ActionIcon>
          <span>
            <strong>Comprar Biteplaner</strong>
            <small>Inicie ou continue o fluxo inicial de cadastro e compra.</small>
          </span>
        </S.ActionLink>
        <S.ActionLink to="/painel/biteplaner/financeiro?role=dentist">
          <S.ActionIcon $tone="finance" aria-hidden><CreditCard size={20} /></S.ActionIcon>
          <span>
            <strong>Abrir financeiro</strong>
            <small>Complete a Parte 2 e veja o status da conta Asaas.</small>
          </span>
        </S.ActionLink>
        <S.ActionLink to="/painel/biteplaner/ordens">
          <S.ActionIcon $tone="orders" aria-hidden><ClipboardList size={20} /></S.ActionIcon>
          <span>
            <strong>Ver ordens</strong>
            <small>Acompanhe pedidos e solicitações do dentista.</small>
          </span>
        </S.ActionLink>
      </S.ActionsGrid>

      <S.HelperPanel>
        <RefreshCw size={18} aria-hidden />
        <p>
          Se você acabou de concluir o cadastro no Asaas, abra o financeiro para sincronizar o status antes de testar o split.
        </p>
        <Link to="/painel/biteplaner/financeiro?role=dentist">Sincronizar no financeiro</Link>
      </S.HelperPanel>
    </S.Page>
  );
}
