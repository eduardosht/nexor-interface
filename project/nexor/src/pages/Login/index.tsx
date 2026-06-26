import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { writeStorageValue } from '../../lib/browser-storage';
import { redirectToExternal, resolvePostLoginPath } from '../../lib/navigation';
import {
  Alert,
  AuthBackLink,
  AuthVisualBrandLogo,
  AuthCard,
  AuthFormSide,
  AuthPage,
  AuthVisualContent,
  AuthVisualDivider,
  AuthVisualSide,
  AuthVisualTagline,
  Button,
  Description,
  Field,
  Form,
  Input,
  PasswordInput,
  Title
} from '../auth-shared';
import { DEMO_PERSONA_LABELS, type DemoPersona } from '../../features/demo/persona';
import * as S from './styles';








const DEMO_SHORTCUTS: Array<{ persona: DemoPersona; testId: string }> = [
  { persona: 'partner', testId: 'demo-login-partner' },
  { persona: 'athleteRegistered', testId: 'demo-login-athlete-registered' },
  { persona: 'athlete', testId: 'demo-login-athlete' },
  { persona: 'athletePrerequisite', testId: 'demo-login-athlete-prerequisite' },
  { persona: 'athleteScheduling', testId: 'demo-login-athlete-scheduling' },
  { persona: 'athletePreConsultation', testId: 'demo-login-athlete-pre-consultation' },
  { persona: 'athleteClinicalDecision', testId: 'demo-login-athlete-clinical-decision' },
  { persona: 'athleteDentistForms', testId: 'demo-login-athlete-dentist-forms' },
  { persona: 'athletePayment', testId: 'demo-login-athlete-payment' },
  { persona: 'athleteTreatmentRequired', testId: 'demo-login-athlete-treatment-required' },
  { persona: 'athleteLabProduction', testId: 'demo-login-athlete-lab-production' },
  { persona: 'athleteAdaptation', testId: 'demo-login-athlete-adaptation' },
  { persona: 'athleteFollowUp', testId: 'demo-login-athlete-follow-up' },
  { persona: 'athleteIneligible', testId: 'demo-login-athlete-ineligible' },
  { persona: 'athleteCancelled', testId: 'demo-login-athlete-cancelled' },
  { persona: 'dentist', testId: 'demo-login-dentist' },
  { persona: 'dentistApproved', testId: 'demo-login-dentist-approved' },
  { persona: 'dentistProgress', testId: 'demo-login-dentist-progress' },
  { persona: 'dentistLicensed', testId: 'demo-login-dentist-licensed' },
  { persona: 'lab', testId: 'demo-login-lab' },
  { persona: 'labApproved', testId: 'demo-login-lab-approved' },
  { persona: 'labProgress', testId: 'demo-login-lab-progress' },
  { persona: 'labLicensed', testId: 'demo-login-lab-licensed' },
  { persona: 'admin', testId: 'demo-login-admin' }
];

const DEMO_TABS = [
  {
    key: 'cliente',
    label: 'Cliente',
    personas: [
      'athleteRegistered',
      'athlete',
      'athletePrerequisite',
      'athleteScheduling',
      'athletePreConsultation',
      'athleteClinicalDecision',
      'athleteDentistForms',
      'athletePayment',
      'athleteTreatmentRequired',
      'athleteLabProduction',
      'athleteAdaptation',
      'athleteFollowUp',
      'athleteIneligible',
      'athleteCancelled'
    ]
  },
  { key: 'parceiros', label: 'Parceiros', personas: ['partner'] },
  { key: 'dentista', label: 'Dentista', personas: ['dentist', 'dentistApproved', 'dentistProgress', 'dentistLicensed'] },
  { key: 'lab', label: 'Lab', personas: ['lab', 'labApproved', 'labProgress', 'labLicensed'] },
  { key: 'admin', label: 'Admin', personas: ['admin'] },
] as const;

type DemoTabKey = (typeof DEMO_TABS)[number]['key'];

const FRIENDLY_SERVER_ERROR_MESSAGE =
  'Não foi possível acessar sua conta agora. Aguarde alguns instantes e tente novamente.';

function resolveLoginErrorMessage(message: string) {
  const normalized = message.trim().toLowerCase();

  if (
    normalized === 'unexpected server error.' ||
    normalized === 'unexpected server error' ||
    normalized.includes('server error') ||
    normalized.includes('internal server error') ||
    /\b500\b/.test(normalized)
  ) {
    return FRIENDLY_SERVER_ERROR_MESSAGE;
  }

  return message;
}

export function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    session,
    backendUser,
    backendUserResolved,
    authError,
    loading,
    signIn,
    signInDemo,
    isMockMode
  } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeDemoTab, setActiveDemoTab] = useState<DemoTabKey>('cliente');
  const visibleError = error || (authError ? resolveLoginErrorMessage(authError) : '');

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      writeStorageValue('nexor_referral_ref', ref, 'session');
    }
  }, [searchParams]);

  useEffect(() => {
    if (!session || loading || !backendUserResolved) {
      return;
    }

    const destination = resolvePostLoginPath(backendUser?.roles ?? [], searchParams.get('next'));

    if (destination.startsWith('/')) {
      navigate(destination, { replace: true });
      return;
    }

    redirectToExternal(destination);
  }, [backendUser, backendUserResolved, loading, navigate, searchParams, session]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Informe seu e-mail para entrar.');
      return;
    }

    if (!password) {
      setError('Informe sua senha para entrar.');
      return;
    }

    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
    } catch {
      setError('Não foi possível entrar com essas credenciais. Verifique os dados e tente novamente.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDemoLogin(persona: DemoPersona) {
    setError('');

    try {
      await signInDemo(persona);
    } catch {
      setError('Não foi possível iniciar esse perfil de demonstração agora.');
    }
  }

  return (
    <AuthPage>
      <AuthFormSide>
        <AuthBackLink href="/">← Início</AuthBackLink>
        <AuthCard>
          <div>
            <Title>Entrar na conta Nexor</Title>
            <Description>Use sua conta central para acessar a plataforma.</Description>
          </div>
          <Form onSubmit={handleSubmit}>
            <Field>
              E-mail
              <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
            </Field>
            <Field>
              Senha
              <PasswordInput
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </Field>
            {visibleError ? <Alert role="alert">{visibleError}</Alert> : null}
            <Button type="submit" disabled={submitting} aria-busy={submitting}>
              {submitting ? 'Entrando...' : 'Entrar'}
            </Button>
          </Form>
          {isMockMode ? (
            <S.DemoSection>
              <div>
                <S.DemoTitle>Modo demonstração</S.DemoTitle>
                <S.DemoDescription>
                  Acesse rapidamente os perfis da demo compartilhada para apresentar o fluxo completo.
                </S.DemoDescription>
              </div>
              <S.DemoGrid>
                <S.DemoTabs role="tablist" aria-label="Perfis de demonstração">
                  {DEMO_TABS.map((tab) => (
                    <S.DemoTab
                      key={tab.key}
                      type="button"
                      role="tab"
                      aria-selected={activeDemoTab === tab.key}
                      onClick={() => setActiveDemoTab(tab.key)}
                    >
                      {tab.label}
                    </S.DemoTab>
                  ))}
                </S.DemoTabs>
                {DEMO_SHORTCUTS.filter(({ persona }) => {
                  const activePersonas = DEMO_TABS.find((tab) => tab.key === activeDemoTab)?.personas as readonly DemoPersona[] | undefined;
                  return activePersonas?.includes(persona) ?? false;
                }).map(({ persona, testId }) => (
                  <S.DemoButton
                    key={persona}
                    type="button"
                    data-testid={testId}
                    onClick={() => {
                      void handleDemoLogin(persona);
                    }}
                  >
                    Entrar como {DEMO_PERSONA_LABELS[persona]}
                  </S.DemoButton>
                ))}
              </S.DemoGrid>
            </S.DemoSection>
          ) : null}
          <S.FooterDivider />
          <S.FooterLinks>
            <Link to="/cadastro">Criar conta</Link>
            {' · '}
            <Link to="/recuperar-senha">Recuperar senha</Link>
          </S.FooterLinks>
        </AuthCard>
      </AuthFormSide>
      <AuthVisualSide>
        <AuthVisualContent>
          <AuthVisualBrandLogo />
          <AuthVisualDivider />
          <AuthVisualTagline>Sua conta central para o ecossistema de performance.</AuthVisualTagline>
        </AuthVisualContent>
      </AuthVisualSide>
    </AuthPage>
  );
}
