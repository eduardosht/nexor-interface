import { Eye, EyeOff } from 'lucide-react';
import { useEffect, useState, type ChangeEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { CheckboxField, Field, sanitizePersonName } from '@nexor/design-system';
import { api } from '../../lib/api';
import {
  clearReferralInviteToken,
  readReferralInviteToken,
  saveReferralInviteToken,
} from '../../lib/referral-cookie';
import { writeStorageValue } from '../../lib/browser-storage';
import { supabase } from '../../lib/supabase';
import { validatePartnerInviteToken } from '../../features/demo/biteplanerFlow';
import {
  Alert,
  AuthBackLink,
  AuthVisualBrandLogo,
  AuthVisualTagline,
  Description,
  Success,
  Title
} from '../auth-shared';
import {
  Actions,
  Button,
  Card,
  EyeToggleButton,
  Fields,
  FooterDivider,
  FooterLinks,
  FormSide,
  Page,
  StepBadge,
  StepConnector,
  StepItem,
  StepLabel,
  StepList,
  StepNumber,
  StepSectionDesc,
  StepSectionTitle,
  VisualContent,
  VisualSide
} from './Cadastro.styles';

const ONBOARDING_ROUTES_BY_TYPE: Record<string, string> = {
  parceiro: '/painel/biteplaner/cadastro/parceiro',
  dentista: '/painel/biteplaner/cadastro/dentista',
  laboratório: '/painel/biteplaner/cadastro/laboratório',
};

export function Cadastro() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [terms, setTerms] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const selectedOnboardingPath = ONBOARDING_ROUTES_BY_TYPE[searchParams.get('tipo') ?? ''];
  const loginPath = selectedOnboardingPath
    ? `/entrar?next=${encodeURIComponent(selectedOnboardingPath)}`
    : '/entrar';
  const readInputValue = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    event.target.value;

  function clearFieldError(field: string) {
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      writeStorageValue('nexor_referral_ref', ref, 'session');
    }

    const invite = searchParams.get('invite') ?? ref ?? '';
    if (!invite) {
      return;
    }
    const inviteToken = invite;

    let cancelled = false;

    async function persistInvite() {
      try {
        const response = await validatePartnerInviteToken(inviteToken);
        if (!cancelled && response.inviteLink.status === 'valid') {
          saveReferralInviteToken(inviteToken);
        }
        if (!cancelled && response.inviteLink.status !== 'valid') {
          clearReferralInviteToken();
        }
      } catch {
        if (!cancelled) {
          clearReferralInviteToken();
        }
      }
    }

    void persistInvite();

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  function validateStepOne() {
    const errors: Record<string, string> = {};

    if (!fullName.trim()) {
      errors.fullName = 'Informe seu nome completo.';
    }

    if (!email.trim()) {
      errors.email = 'Informe seu e-mail.';
    }

    if (password.length < 8) {
      errors.password = 'A senha deve ter pelo menos 8 caracteres.';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Confirme sua senha.';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'As senhas informadas não conferem.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function goNext() {
    setError('');
    setSuccessMessage('');

    if (!validateStepOne()) {
      return;
    }

    setStep(2);
  }

  async function submitCadastro() {
    setError('');
    setSuccessMessage('');

    if (!validateStepOne()) {
      setStep(1);
      return;
    }

    if (!terms || !privacy) {
      setError('Para continuar, aceite os Termos de Uso e a Política de Privacidade.');
      return;
    }

    if (!supabase) {
      setError('A autenticação não está disponível neste ambiente.');
      return;
    }

    setSubmitting(true);

    const auth = supabase.auth as {
      signUp(input: {
        email: string;
        password: string;
        options: {
          data: {
            fullName: string;
          };
        };
      }): Promise<{ error: { message?: string } | null; data: { session: { access_token: string } | null } }>;
    };

    const signUpResult = await auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          fullName: fullName.trim()
        }
      }
    });

    if (signUpResult.error) {
      setSubmitting(false);
      setError('Não foi possível criar sua conta agora. Revise os dados e tente novamente.');
      return;
    }

    const token = signUpResult.data.session?.access_token;

    if (!token) {
      setSubmitting(false);
      setSuccessMessage(
        'Conta criada com sucesso. Enviamos um link de confirmação para o seu e-mail.'
      );
      return;
    }

    try {
      const referralInviteToken = readReferralInviteToken();

      await api.post(
        '/v1/account/profile',
        referralInviteToken
          ? {
              fullName: fullName.trim(),
              referralInviteToken
            }
          : {
              fullName: fullName.trim()
            },
        token
      );

      await api.post(
        '/v1/account/consents',
        {
          consents: [
            { type: 'terms', accepted: true },
            { type: 'privacy', accepted: true },
            { type: 'marketing', accepted: marketing }
          ]
        },
        token
      );
    } catch {
      setSubmitting(false);
      setError('Sua conta foi criada, mas não conseguimos registrar os consentimentos. Entre e revise sua conta.');
      return;
    }

    setSubmitting(false);
    navigate('/conta', {
      replace: true,
      state: {
        notice: 'Conta criada com sucesso. Agora você já pode continuar na plataforma.'
      }
    });
  }

  return (
    <Page>
      <FormSide>
        <AuthBackLink href="/">← Início</AuthBackLink>
        <Card>
          <div>
            <Title>Criar conta Nexor</Title>
            <Description>
              Cadastre sua conta base para entrar no ecossistema Nexor.
            </Description>
          </div>

          <StepList>
            <StepItem>
              <StepBadge $active={step === 1}>
                <StepNumber $active={step === 1}>1</StepNumber>
                <StepLabel $active={step === 1}>Dados da conta</StepLabel>
              </StepBadge>
            </StepItem>
            <StepConnector />
            <StepItem>
              <StepBadge $active={step === 2}>
                <StepNumber $active={step === 2}>2</StepNumber>
                <StepLabel $active={step === 2}>Consentimentos</StepLabel>
              </StepBadge>
            </StepItem>
          </StepList>

          {step === 1 ? (
            <>
              <div>
                <StepSectionTitle>Preencha os dados principais</StepSectionTitle>
                <StepSectionDesc>
                  Vamos criar sua conta base com nome, e-mail e uma senha confirmada.
                </StepSectionDesc>
              </div>
              <Fields>
                <Field
                  label="Nome completo"
                  value={fullName}
                  error={fieldErrors.fullName}
                  style={{ gridColumn: '1 / -1' }}
                  onChange={(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                    setFullName(sanitizePersonName(readInputValue(event)));
                    clearFieldError('fullName');
                  }}
                />
                <Field
                  label="E-mail"
                  type="email"
                  value={email}
                  error={fieldErrors.email}
                  onChange={(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                    setEmail(readInputValue(event));
                    clearFieldError('email');
                  }}
                />
                <Field
                  label="Senha"
                  type={passwordVisible ? 'text' : 'password'}
                  value={password}
                  error={fieldErrors.password}
                  onChange={(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                    setPassword(readInputValue(event));
                    clearFieldError('password');
                  }}
                  trailingIcon={
                    <EyeToggleButton
                      type="button"
                      aria-label={passwordVisible ? 'Ocultar senha' : 'Exibir senha'}
                      tabIndex={-1}
                      onClick={() => setPasswordVisible((value) => !value)}
                    >
                      {passwordVisible ? (
                        <EyeOff width={18} height={18} aria-hidden />
                      ) : (
                        <Eye width={18} height={18} aria-hidden />
                      )}
                    </EyeToggleButton>
                  }
                />
                <Field
                  label="Confirmar sua senha"
                  type={passwordVisible ? 'text' : 'password'}
                  value={confirmPassword}
                  error={fieldErrors.confirmPassword}
                  onChange={(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                    setConfirmPassword(readInputValue(event));
                    clearFieldError('confirmPassword');
                  }}
                  trailingIcon={
                    <EyeToggleButton
                      type="button"
                      aria-label={passwordVisible ? 'Ocultar senha' : 'Exibir senha'}
                      tabIndex={-1}
                      onClick={() => setPasswordVisible((value) => !value)}
                    >
                      {passwordVisible ? (
                        <EyeOff width={18} height={18} aria-hidden />
                      ) : (
                        <Eye width={18} height={18} aria-hidden />
                      )}
                    </EyeToggleButton>
                  }
                />
              </Fields>
            </>
          ) : null}

          {step === 2 ? (
            <div style={{ display: 'grid', gap: '12px' }}>
              <Description>
                Esta etapa registra apenas consentimentos gerais da conta Nexor. Dados clínicos,
                documentos, elegibilidade odontológica e formulários do Biteplaner são tratados
                depois, dentro do produto, com finalidade e acesso próprios.
              </Description>
              <CheckboxField
                checked={terms}
                onChange={setTerms}
                label={
                  <>
                    Li e aceito os{' '}
                    <Link to="/termos" target="_blank" rel="noopener noreferrer">
                      <strong>Termos de Uso</strong>
                    </Link>
                    .
                  </>
                }
              />
              <CheckboxField
                checked={privacy}
                onChange={setPrivacy}
                label={
                  <>
                    Li e aceito a{' '}
                    <Link to="/privacidade" target="_blank" rel="noopener noreferrer">
                      <strong>Política de Privacidade</strong>
                    </Link>
                    , incluindo o tratamento necessário para cadastro, autenticação, segurança,
                    comunicações essenciais e gestão da conta conforme a LGPD.
                  </>
                }
              />
              <CheckboxField
                checked={marketing}
                onChange={setMarketing}
                label={
                  <>
                    Aceito receber novidades, conteúdos educativos, lançamentos e comunicações
                    promocionais da Nexor e de seus produtos. Posso revogar essa autorização a qualquer
                    momento, sem prejuízo à minha conta ou atendimento.
                  </>
                }
              />
            </div>
          ) : null}

          {error ? <Alert role="alert">{error}</Alert> : null}
          {successMessage ? <Success role="status">{successMessage}</Success> : null}

          <Actions>
            {step > 1 ? (
              <Button type="button" $secondary onClick={() => setStep(step - 1)}>
                Voltar
              </Button>
            ) : null}
            {step < 2 ? (
              <Button type="button" onClick={goNext}>
                Próximo <span aria-hidden>→</span>
              </Button>
            ) : (
              <Button type="button" onClick={() => void submitCadastro()} disabled={submitting} aria-busy={submitting}>
                {submitting ? 'Criando conta...' : 'Criar conta'}
              </Button>
            )}
          </Actions>

          <FooterDivider />
          <FooterLinks>
            Já tenho conta <Link to={loginPath}>Fazer login</Link>
          </FooterLinks>
        </Card>
      </FormSide>
      <VisualSide>
        <VisualContent>
          <AuthVisualBrandLogo />
          <AuthVisualTagline>Uma conta central para todo o ecossistema de performance.</AuthVisualTagline>
        </VisualContent>
      </VisualSide>
    </Page>
  );
}
