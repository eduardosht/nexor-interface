import { useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import {
  Alert,
  AuthBackLink,
  AuthCard,
  AuthFormSide,
  AuthPage,
  AuthVisualContent,
  AuthVisualDivider,
  AuthVisualLogo,
  AuthVisualSide,
  AuthVisualTagline,
  Button,
  Description,
  Field,
  Form,
  InlineLinks,
  Input,
  PasswordInput,
  Success,
  Title
} from '../auth-shared';

function readRecoveryState() {
  const hash = window.location.hash;

  if (!hash) {
    return false;
  }

  const params = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash);
  return params.get('type') === 'recovery' && params.has('access_token');
}

export function RecuperarSenha() {
  const navigate = useNavigate();
  const { sendPasswordReset } = useAuth();
  const isRecoveryFlow = useMemo(readRecoveryState, []);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resetCompleted, setResetCompleted] = useState(false);

  async function handleRequestReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!email.trim()) {
      setError('Informe o e-mail da sua conta para continuar.');
      return;
    }

    setSubmitting(true);

    try {
      await sendPasswordReset(email.trim());
      setMessage('Enviamos um link de recuperação para o seu e-mail.');
    } catch {
      setError('Não foi possível solicitar a recuperação de senha agora. Tente novamente em instantes.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!password || password.length < 8) {
      setError('A nova senha deve ter pelo menos 8 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas informadas não conferem.');
      return;
    }

    if (!supabase) {
      setError('A autenticação não está disponível neste ambiente.');
      return;
    }

    setSubmitting(true);

    const auth = supabase.auth as {
      updateUser(attributes: { password: string }): Promise<{ error: { message?: string } | null }>;
      signOut(): Promise<{ error?: { message?: string } | null } | unknown>;
    };

    try {
      const { error: updateError } = await auth.updateUser({ password });

      if (updateError) {
        throw updateError;
      }

      await auth.signOut();
      window.history.replaceState({}, '', '/recuperar-senha');
      setResetCompleted(true);
      setMessage('Senha redefinida com sucesso. Você já pode entrar novamente.');
    } catch {
      setError(
        'Não foi possível redefinir sua senha agora. Solicite um novo link e tente novamente.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthPage>
      <AuthFormSide>
        <AuthBackLink href="/">← Início</AuthBackLink>
        <AuthCard>
          <div>
            <Title>{isRecoveryFlow ? 'Redefinir senha' : 'Recuperar senha'}</Title>
            <Description>
              {isRecoveryFlow
                ? 'Defina uma nova senha para concluir a recuperação da sua conta Nexor.'
                : 'Enviaremos um link seguro para você recuperar o acesso da sua conta Nexor.'}
            </Description>
          </div>

          {isRecoveryFlow ? (
            <Form onSubmit={handleUpdatePassword}>
              <Field>
                Nova senha
                <PasswordInput
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={resetCompleted}
                />
              </Field>
              <Field>
                Confirmar nova senha
                <PasswordInput
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  disabled={resetCompleted}
                />
              </Field>
              {error ? <Alert role="alert">{error}</Alert> : null}
              {message ? <Success role="status">{message}</Success> : null}
              {resetCompleted ? (
                <Button type="button" onClick={() => navigate('/entrar')}>
                  Voltar para entrar
                </Button>
              ) : (
                <Button type="submit" disabled={submitting} aria-busy={submitting}>
                  {submitting ? 'Salvando...' : 'Salvar nova senha'}
                </Button>
              )}
            </Form>
          ) : (
            <Form onSubmit={handleRequestReset}>
              <Field>
                E-mail
                <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
              </Field>
              {error ? <Alert role="alert">{error}</Alert> : null}
              {message ? <Success role="status">{message}</Success> : null}
              <Button type="submit" disabled={submitting} aria-busy={submitting}>
                {submitting ? 'Enviando...' : 'Enviar link de recuperação'}
              </Button>
            </Form>
          )}

          <InlineLinks>
            <Link to="/entrar">Voltar para entrar</Link>
          </InlineLinks>
        </AuthCard>
      </AuthFormSide>
      <AuthVisualSide>
        <AuthVisualContent>
          <AuthVisualLogo>Nexor</AuthVisualLogo>
          <AuthVisualDivider />
          <AuthVisualTagline>
            {isRecoveryFlow
              ? 'Atualize sua senha com segurança e volte para a plataforma.'
              : 'Recupere o acesso da sua conta de forma segura.'}
          </AuthVisualTagline>
        </AuthVisualContent>
      </AuthVisualSide>
    </AuthPage>
  );
}
