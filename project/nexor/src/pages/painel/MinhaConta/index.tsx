import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { sanitizePersonName } from '@nexor/design-system';
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
  const [saveMsg, setSaveMsg] = useState('');
  const [saveError, setSaveError] = useState(false);
  const [passwordSending, setPasswordSending] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const email = backendUser?.email ?? session?.user.email ?? '—';
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

        if (nextName) {
          setFullName(nextName);
        }
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
    setSaveMsg('');
    try {
      await api.patch(
        '/v1/auth/profile',
        {
          fullName: sanitizePersonName(fullName).trim(),
        },
        session.access_token
      );
      setSaveMsg('Alteráções salvas.');
      setSaveError(false);
    } catch {
      setSaveMsg('Não foi possível salvar. Tente novamente.');
      setSaveError(true);
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordReset() {
    if (!email || email === '—') {
      return;
    }

    setPasswordMsg('');
    setPasswordError(false);

    if (isMockMode) {
      setPasswordMsg('Ambiente de demonstração: o envio real pelo Supabase não é executado.');
      return;
    }

    if (!hasConfiguredAuth) {
      setPasswordMsg('A autenticação Supabase não está configurada neste ambiente.');
      setPasswordError(true);
      return;
    }

    setPasswordSending(true);

    try {
      await sendPasswordReset(email);
      setPasswordMsg('Enviamos um link para troca de senha no e-mail da conta.');
      setPasswordError(false);
    } catch {
      setPasswordMsg('Não foi possível enviar o link de troca de senha.');
      setPasswordError(true);
    } finally {
      setPasswordSending(false);
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
              {saveMsg && (
                <S.SaveMsg role={saveError ? 'alert' : 'status'} $error={saveError}>
                  {saveMsg}
                </S.SaveMsg>
              )}
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
            {passwordMsg ? (
              <S.SaveMsg role={passwordError ? 'alert' : 'status'} $error={passwordError}>
                {passwordMsg}
              </S.SaveMsg>
            ) : null}
          </S.FormActions>
        </S.Card>
      </S.Section>
    </S.Page>
  );
}
