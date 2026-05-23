import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  Field as DesignSystemField,
  Snackbar,
  SnackbarStack,
  sanitizePersonName,
  type SnackbarTone,
} from '@nexor/design-system';
import { SkeletonCard } from '../../../components/Skeleton';
import { useAuth } from '../../../hooks/useAuth';
import { api } from '../../../lib/api';
import * as S from './styles';


interface MeResponse {
  user?: {
    profileId?: string;
    email?: string;
    roles?: string[];
    fullName?: string | null;
    phone?: string | null;
  };
  profile?: {
    full_name: string;
    role: string;
  };
}

interface MockProduct {
  key: 'biteplaner';
  name: string;
  status: string;
  description: string;
  href: string;
}

const deletionReasonOptions = [
  { value: '', label: 'Prefiro não informar' },
  { value: 'privacy', label: 'Privacidade e LGPD' },
  { value: 'no_longer_uses', label: 'Não uso mais a Nexor' },
  { value: 'duplicate_account', label: 'Tenho outra conta' },
  { value: 'service_issue', label: 'Tive problema com o serviço' },
  { value: 'other', label: 'Outros' },
] as const;

type DeletionReason = (typeof deletionReasonOptions)[number]['value'];
type AccountSnackbar = {
  message: string;
  title: string;
  tone: SnackbarTone;
};

function getFirstName(name: string, fallbackEmail: string) {
  const fromName = name.trim().split(/\s+/).filter(Boolean)[0];

  if (fromName) {
    return fromName;
  }

  return fallbackEmail.split('@')[0] || 'confirmar';
}











const fadeSection = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
};

function getMockAcquiredProducts(email: string): MockProduct[] {
  if (email === 'sem-produto@nexor.dev' || email === '—') {
    return [];
  }

  return [
    {
      key: 'biteplaner',
      name: 'Biteplaner',
      status: 'Ativo',
      description: 'Produto ativo na sua conta Nexor.',
      href: '/painel/biteplaner?mode=user',
    },
  ];
}

export function MinhaConta() {
  const { session, backendUser, sendPasswordReset, hasConfiguredAuth, isMockMode } = useAuth();
  const [fullName, setFullName] = useState('');
  const [saving, setSaving] = useState(false);
  const [passwordSending, setPasswordSending] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadedRoles, setLoadedRoles] = useState<string[]>([]);
  const [deletionModalOpen, setDeletionModalOpen] = useState(false);
  const [deletionReason, setDeletionReason] = useState<DeletionReason>('');
  const [deletionReasonDetails, setDeletionReasonDetails] = useState('');
  const [deletionConfirmation, setDeletionConfirmation] = useState('');
  const [deletionSubmitting, setDeletionSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState<AccountSnackbar | null>(null);

  const email = backendUser?.email ?? session?.user.email ?? '—';
  const roles = loadedRoles.length > 0 ? loadedRoles : (backendUser?.roles ?? []);
  const isAdmin = roles.includes('admin');
  const firstName = getFirstName(fullName, email);
  const canConfirmDeletion = deletionConfirmation.trim() === firstName;
  const acquiredProducts = useMemo(() => getMockAcquiredProducts(email), [email]);

  useEffect(() => {
    if (!session) return;
    let active = true;

    async function load() {
      setLoadingProfile(true);
      try {
        const resp = await api.get<MeResponse>('/v1/auth/me', session!.access_token);
        if (!active) {
          return;
        }

        const nextName = resp.user?.fullName ?? resp.profile?.full_name ?? '';
        const nextRoles = resp.user?.roles ?? [];

        if (nextName) {
          setFullName(nextName);
        }

        setLoadedRoles(nextRoles);
      } catch {
        /* silently skip — name stays empty */
      } finally {
        if (active) {
          setLoadingProfile(false);
        }
      }
    }

    void load();
    return () => { active = false; };
  }, [session]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!session) return;
    setSaving(true);
    setSnackbar(null);
    try {
      await api.patch(
        '/v1/auth/profile',
        {
          fullName: sanitizePersonName(fullName).trim(),
        },
        session.access_token
      );
      setSnackbar({
        tone: 'success',
        title: 'Alterações salvas',
        message: 'Os dados da sua conta foram atualizados.',
      });
    } catch {
      setSnackbar({
        tone: 'error',
        title: 'Falha ao salvar',
        message: 'Não foi possível salvar. Tente novamente.',
      });
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordReset() {
    if (!email || email === '—') {
      return;
    }

    setSnackbar(null);

    if (isMockMode) {
      setSnackbar({
        tone: 'info',
        title: 'Ambiente de demonstração',
        message: 'Ambiente de demonstração: o envio real pelo Supabase não é executado.',
      });
      return;
    }

    if (!hasConfiguredAuth) {
      setSnackbar({
        tone: 'error',
        title: 'Autenticação indisponível',
        message: 'A autenticação Supabase não está configurada neste ambiente.',
      });
      return;
    }

    setPasswordSending(true);

    try {
      await sendPasswordReset(email);
      setSnackbar({
        tone: 'success',
        title: 'Link enviado',
        message: 'Enviamos um link para troca de senha no e-mail da conta.',
      });
    } catch {
      setSnackbar({
        tone: 'error',
        title: 'Falha ao enviar',
        message: 'Não foi possível enviar o link de troca de senha.',
      });
    } finally {
      setPasswordSending(false);
    }
  }

  function closeDeletionModal() {
    if (deletionSubmitting) {
      return;
    }

    setDeletionModalOpen(false);
    setDeletionReason('');
    setDeletionReasonDetails('');
    setDeletionConfirmation('');
  }

  async function handleDeletionRequest() {
    if (!session || !canConfirmDeletion) {
      return;
    }

    setDeletionSubmitting(true);
    setSnackbar(null);

    try {
      const response = await api.post<{ message?: string }>(
        '/v1/account/deletion-request',
        {
          confirmationFirstName: deletionConfirmation.trim(),
          reason: deletionReason,
          reasonDetails: deletionReasonDetails.trim(),
        },
        session.access_token
      );

      setSnackbar({
        tone: 'success',
        title: 'Solicitação registrada',
        message: response.message ?? 'Solicitação de exclusão registrada.',
      });
    } catch {
      setSnackbar({
        tone: 'error',
        title: 'Falha ao solicitar exclusão',
        message: 'Não foi possível registrar a solicitação de exclusão.',
      });
    } finally {
      setDeletionModalOpen(false);
      setDeletionReason('');
      setDeletionReasonDetails('');
      setDeletionConfirmation('');
      setDeletionSubmitting(false);
    }
  }

  return (
    <S.Page>
      <S.PageTitle>Minha Conta</S.PageTitle>
      <S.PageSubtitle>Gerencie os dados cadastrais e a segurança da sua conta Nexor.</S.PageSubtitle>

      <S.TopGrid>
        <S.Section
          variants={fadeSection}
          initial="hidden"
          animate="visible"
        >
          <S.SectionTitle>Dados da conta</S.SectionTitle>
          {loadingProfile ? (
            <SkeletonCard lines={4} blockHeight="44px" />
          ) : (
          <S.Card as="form" onSubmit={handleSave}>
            <S.CardRow>
              <S.Field as="label">
                <S.FieldLabel>Nome completo</S.FieldLabel>
                <S.FieldInput
                  type="text"
                  aria-label="Nome completo"
                  value={fullName}
                  onChange={(e) => { setFullName(sanitizePersonName(e.target.value)); }}
                  placeholder="Seu nome"
                />
              </S.Field>
              <S.Field>
                <S.FieldLabel>E-mail <S.FieldLocked>(não editável)</S.FieldLocked></S.FieldLabel>
                <S.FieldValue>{email}</S.FieldValue>
              </S.Field>
              <S.Field>
                <S.FieldLabel>Status</S.FieldLabel>
                <S.FieldValue>Ativo</S.FieldValue>
              </S.Field>
            </S.CardRow>
            <S.FormActions>
              <S.SaveBtn type="submit" disabled={saving}>{saving ? 'Salvando…' : 'Salvar alteráções'}</S.SaveBtn>
            </S.FormActions>
          </S.Card>
          )}
        </S.Section>

        <S.Section
          variants={fadeSection}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.04 } as never}
        >
          <S.SectionTitle>Produtos adquiridos</S.SectionTitle>
          <S.Card>
            {acquiredProducts.length > 0 ? (
              acquiredProducts.map((product) => (
                <S.ProductContent key={product.key}>
                  <S.ProductHeader>
                    <S.ProductTitle>{product.name}</S.ProductTitle>
                    <S.ProductBadge>{product.status}</S.ProductBadge>
                  </S.ProductHeader>
                  <S.ProductText>{product.description}</S.ProductText>
                  <S.ProductLink as={Link} to={product.href}>Abrir Biteplaner</S.ProductLink>
                </S.ProductContent>
              ))
            ) : (
              <S.ProductContent>
                <S.ProductTitle>Biteplaner</S.ProductTitle>
                <S.ProductText>Você ainda não possui produtos ativos na plataforma Nexor.</S.ProductText>
                <S.ProductLink as={Link} to="/painel/biteplaner">Pedir Biteplaner</S.ProductLink>
              </S.ProductContent>
            )}
          </S.Card>
        </S.Section>
      </S.TopGrid>

      <S.Section
        variants={fadeSection}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.08 } as never}
      >
        <S.SectionTitle>Segurança</S.SectionTitle>
        <S.Card>
          <S.SecurityContent>
            <S.SecurityTitle>Trocar senha</S.SecurityTitle>
            <S.SecurityText>
              Envie um link seguro para o e-mail cadastrado e defina uma nova senha.
            </S.SecurityText>
          </S.SecurityContent>
          <S.FormActions>
            <S.SaveBtn type="button" disabled={passwordSending} onClick={handlePasswordReset}>
              {passwordSending ? 'Enviando…' : 'Enviar link para trocar senha'}
            </S.SaveBtn>
          </S.FormActions>
        </S.Card>
      </S.Section>

      {!isAdmin ? (
        <S.Section
          variants={fadeSection}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.12 } as never}
        >
          <S.SectionTitle>Excluir conta</S.SectionTitle>
          <S.DangerCard>
            <S.SecurityContent>
              <S.SecurityTitle>Solicitar exclusão da conta</S.SecurityTitle>
              <S.SecurityText>
                Por segurança, a exclusão pode ficar pendente quando houver ordens em andamento vinculadas à conta.
              </S.SecurityText>
            </S.SecurityContent>
            <S.FormActions>
              <S.DangerButton type="button" onClick={() => setDeletionModalOpen(true)}>
                Excluir conta
              </S.DangerButton>
            </S.FormActions>
          </S.DangerCard>
        </S.Section>
      ) : null}

      {deletionModalOpen ? (
        <S.ModalOverlay role="presentation">
          <S.Modal role="dialog" aria-modal="true" aria-labelledby="delete-account-title">
            <S.ModalHeader>
              <div>
                <S.ModalTitle id="delete-account-title">Confirmar exclusão da conta</S.ModalTitle>
                <S.SecurityText>
                  Para continuar, digite <strong>{firstName}</strong>. O motivo é opcional.
                </S.SecurityText>
              </div>
            </S.ModalHeader>
            <S.ModalBody>
              <S.Field>
                <S.FieldLabel id="account-deletion-reason-label">Motivo da exclusão</S.FieldLabel>
                <S.ReasonChips role="group" aria-labelledby="account-deletion-reason-label">
                  {deletionReasonOptions.map((option) => (
                    <S.ReasonChip
                      key={option.value || 'empty'}
                      type="button"
                      $active={deletionReason === option.value}
                      aria-pressed={deletionReason === option.value}
                      onClick={() => setDeletionReason(option.value)}
                    >
                      {option.label}
                    </S.ReasonChip>
                  ))}
                </S.ReasonChips>
              </S.Field>
              {deletionReason === 'other' ? (
                <S.Field as="label">
                  <S.FieldLabel>Descreva o motivo</S.FieldLabel>
                  <S.TextArea
                    aria-label="Descreva o motivo"
                    value={deletionReasonDetails}
                    maxLength={500}
                    onChange={(event) => setDeletionReasonDetails(event.target.value)}
                  />
                </S.Field>
              ) : null}
              <DesignSystemField
                type="text"
                label={<>Digite <strong>{firstName}</strong> para confirmar</>}
                aria-label={`Digite ${firstName} para confirmar`}
                value={deletionConfirmation}
                onChange={(event) => setDeletionConfirmation(sanitizePersonName(event.target.value))}
              />
            </S.ModalBody>
            <S.ModalActions>
              <S.CancelButton type="button" onClick={closeDeletionModal}>
                Cancelar
              </S.CancelButton>
              <S.DangerButton type="button" disabled={!canConfirmDeletion || deletionSubmitting} onClick={handleDeletionRequest}>
                {deletionSubmitting ? 'Enviando...' : 'Confirmar exclusão'}
              </S.DangerButton>
            </S.ModalActions>
          </S.Modal>
        </S.ModalOverlay>
      ) : null}
      {snackbar ? (
        <SnackbarStack>
          <Snackbar
            tone={snackbar.tone}
            title={snackbar.title}
            message={snackbar.message}
            onClose={() => {
              setSnackbar(null);
            }}
          />
        </SnackbarStack>
      ) : null}
    </S.Page>
  );
}
