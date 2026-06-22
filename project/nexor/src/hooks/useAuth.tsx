import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren
} from 'react';
import { env } from '../config/env';
import { api, ApiError } from '../lib/api';
import { clearPendingRegistration, loadPendingRegistration } from '../lib/pending-registration';
import { supabase } from '../lib/supabase';
import {
  clearActiveDemoPersona,
  isMockModeEnabled,
  readActiveDemoPersona,
  type DemoPersona,
  writeActiveDemoPersona
} from '../features/demo/persona';

export interface BackendUser {
  id: string;
  authUserId: string;
  email?: string;
  profileId?: string;
  roles: string[];
  productRoles?: Array<{
    productKey: string;
    role: string;
    status: string;
    stage?: string | null;
    orderId?: string | null;
    orderStartedAt?: string | null;
    metadata?: Record<string, unknown> | null;
  }>;
  clinicIds: string[];
  dentistId?: string;
  partnerId?: string;
  labId?: string;
}

type AuthSession = {
  access_token: string;
  user: {
    id: string;
    email?: string | null;
  };
};

interface AuthContextValue {
  hasConfiguredAuth: boolean;
  isMockMode: boolean;
  loading: boolean;
  session: AuthSession | null;
  backendUser: BackendUser | null;
  backendUserResolved: boolean;
  authError: string;
  demoPersona: DemoPersona | null;
  signIn(email: string, password: string): Promise<void>;
  signInDemo(persona: DemoPersona): Promise<void>;
  signOut(): Promise<void>;
  sendPasswordReset(email: string): Promise<void>;
  refreshBackendUser(): Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  hasConfiguredAuth: false,
  isMockMode: false,
  loading: false,
  session: null,
  backendUser: null,
  backendUserResolved: true,
  authError: '',
  demoPersona: null,
  async signIn() {},
  async signInDemo() {},
  async signOut() {},
  async sendPasswordReset() {},
  async refreshBackendUser() {}
});

const unconfiguredError = new Error('Autenticação não configurada neste ambiente.');

function resolveAccountAuthErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message || 'Não foi possível acessar sua conta. Tente novamente ou entre em contato com a Nexor.';
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Não foi possível acessar sua conta. Tente novamente ou entre em contato com a Nexor.';
}

function resolveAuthRedirectUrl(path: string) {
  const baseUrl = env.appUrl ?? window.location.origin;
  return new URL(path, `${baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`}`).toString();
}

class ProfileNotFoundError extends Error {
  readonly type = 'profile_not_found' as const;
}

function createDemoSession(persona: DemoPersona): AuthSession {
  return {
    access_token: `demo-${persona}-token`,
    user: {
      id: `demo-auth-${persona}`,
      email: `${persona}.demo@nexor.dev`
    }
  };
}

async function fetchBackendUser(accessToken: string): Promise<BackendUser> {
  try {
    const response = await api.get<{ user: BackendUser }>('/v1/auth/me', accessToken);
    return response.user;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      throw new ProfileNotFoundError('Backend profile not found');
    }

    throw err;
  }
}

async function reconcilePendingRegistration(session: AuthSession) {
  const pending = loadPendingRegistration();

  if (!pending) {
    return;
  }

  if (pending.email.toLowerCase() !== (session.user.email ?? '').toLowerCase()) {
    return;
  }

  try {
    await api.post(
      '/v1/auth/profile',
      {
        fullName: pending.fullName,
        role: pending.role,
        documentType: pending.documentType,
        documentNumber: pending.documentNumber,
        companyName: pending.companyName
      },
      session.access_token
    );
  } catch (error) {
    if (!(error instanceof ApiError) || (error.status !== 403 && error.status !== 409)) {
      throw error;
    }
  }

  try {
    await api.post('/v1/account/consents', { consents: pending.consents }, session.access_token);
  } catch (error) {
    if (!(error instanceof ApiError) || (error.status !== 403 && error.status !== 409)) {
      throw error;
    }
  }

  clearPendingRegistration();
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [backendUser, setBackendUser] = useState<BackendUser | null>(null);
  const [backendUserResolved, setBackendUserResolved] = useState(true);
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(true);
  const [demoPersona, setDemoPersona] = useState<DemoPersona | null>(null);
  const backendUserResolvedRef = useRef(backendUserResolved);
  const backendUserRef = useRef(backendUser);
  const isMockMode = isMockModeEnabled();
  const [hasConfiguredAuth, setHasConfiguredAuth] = useState(Boolean(supabase) || isMockMode);
  const isPasswordRecoveryRoute =
    typeof window !== 'undefined' && window.location.pathname === '/recuperar-senha';

  useEffect(() => {
    backendUserResolvedRef.current = backendUserResolved;
  }, [backendUserResolved]);

  useEffect(() => {
    backendUserRef.current = backendUser;
  }, [backendUser]);

  const syncBackendUser = useCallback(
    async (nextSession: AuthSession | null) => {
      if (!nextSession) {
        setBackendUser(null);
        setBackendUserResolved(true);
        return;
      }

      await reconcilePendingRegistration(nextSession);

      try {
        const nextUser = await fetchBackendUser(nextSession.access_token);
        setBackendUser(nextUser);
        setAuthError('');
      } catch (err) {
        if (err instanceof ProfileNotFoundError) {
          setBackendUser(null);
          setAuthError('');
        } else {
          setAuthError(resolveAccountAuthErrorMessage(err));
          throw err;
        }
      } finally {
        setBackendUserResolved(true);
      }
    },
    []
  );

  useEffect(() => {
    if (isMockMode) {
      const persona = readActiveDemoPersona();
      setHasConfiguredAuth(true);
      setDemoPersona(persona);

      if (!persona) {
        setSession(null);
        setBackendUser(null);
        setBackendUserResolved(true);
        setLoading(false);
        return;
      }

      const demoSession = createDemoSession(persona);
      setSession(demoSession);
      setBackendUserResolved(false);

      void syncBackendUser(demoSession)
        .catch(() => {
          setSession(null);
          setBackendUser(null);
          setDemoPersona(null);
          clearActiveDemoPersona();
        })
        .finally(() => {
          setBackendUserResolved(true);
          setLoading(false);
        });

      return;
    }

    if (!supabase) {
      setHasConfiguredAuth(false);
      setLoading(false);
      setBackendUserResolved(true);
      return;
    }

    setHasConfiguredAuth(true);

    const auth = supabase.auth as {
      getSession(): Promise<{ data: { session: AuthSession | null } }>;
      onAuthStateChange(
        callback: (_event: string, nextSession: AuthSession | null) => void
      ): { data: { subscription: { unsubscribe(): void } } };
      signOut(): Promise<unknown>;
      signInWithPassword(credentials: {
        email: string;
        password: string;
      }): Promise<{ error: { message?: string } | null }>;
      resetPasswordForEmail(
        email: string,
        options: { redirectTo: string }
      ): Promise<{ error: { message?: string } | null }>;
    };

    let active = true;

    async function bootstrap() {
      setLoading(true);

      const {
        data: { session: activeSession }
      } = await auth.getSession();

      if (!active) {
        return;
      }

      setSession(activeSession);
      setBackendUserResolved(activeSession === null);

      if (isPasswordRecoveryRoute) {
        setBackendUser(null);
        setBackendUserResolved(true);
        setLoading(false);
        return;
      }

      try {
        await syncBackendUser(activeSession);
      } catch (err) {
        if (err instanceof ProfileNotFoundError) {
          setBackendUser(null);
        } else if (activeSession) {
          await auth.signOut();
          setSession(null);
          setBackendUser(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void bootstrap();

      const {
      data: { subscription }
    } = auth.onAuthStateChange((event, nextSession) => {
      if ((event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') && nextSession) {
        setSession(nextSession);
        if (
          backendUserResolvedRef.current &&
          backendUserRef.current &&
          backendUserRef.current.authUserId === nextSession.user.id
        ) {
          setLoading(false);
          return;
        }

        if (backendUserResolvedRef.current) {
          setLoading(true);
          setBackendUserResolved(false);

          void syncBackendUser(nextSession)
            .catch(async (err: unknown) => {
              if (err instanceof ProfileNotFoundError) {
                setBackendUser(null);
              } else {
                await auth.signOut();
                setSession(null);
                setBackendUser(null);
              }
            })
            .finally(() => {
              if (active) {
                setLoading(false);
              }
            });
          return;
        }
      }

      setBackendUser(null);
      setSession(nextSession);
      setLoading(true);
      setBackendUserResolved(nextSession === null);

      if (isPasswordRecoveryRoute || event === 'PASSWORD_RECOVERY') {
        setBackendUser(null);
        setBackendUserResolved(true);
        if (active) {
          setLoading(false);
        }
        return;
      }

      void syncBackendUser(nextSession)
        .catch(async (err: unknown) => {
          if (err instanceof ProfileNotFoundError) {
            setBackendUser(null);
          } else if (nextSession) {
            await auth.signOut();
            setSession(null);
            setBackendUser(null);
          }
        })
        .finally(() => {
          if (active) {
            setLoading(false);
          }
        });
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [isMockMode, isPasswordRecoveryRoute, syncBackendUser]);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) {
      throw unconfiguredError;
    }

    setAuthError('');

    const auth = supabase.auth as {
      signInWithPassword(credentials: {
        email: string;
        password: string;
      }): Promise<{ error: { message?: string } | null }>;
    };

    const { error } = await auth.signInWithPassword({ email, password });

    if (error) {
      throw error;
    }
  }, []);

  const signInDemo = useCallback(async (persona: DemoPersona) => {
    setAuthError('');
    writeActiveDemoPersona(persona);
    setDemoPersona(persona);
    setLoading(true);

    const nextSession = createDemoSession(persona);
    setSession(nextSession);
    setBackendUserResolved(false);

    try {
      await syncBackendUser(nextSession);
    } catch (error) {
      clearActiveDemoPersona();
      setDemoPersona(null);
      setSession(null);
      setBackendUser(null);
      throw error;
    } finally {
      setBackendUserResolved(true);
      setLoading(false);
    }
  }, [syncBackendUser]);

  const signOut = useCallback(async () => {
    setAuthError('');

    if (isMockMode) {
      clearActiveDemoPersona();
      setDemoPersona(null);
      setSession(null);
      setBackendUser(null);
      setBackendUserResolved(true);
      return;
    }

    if (!supabase) {
      throw unconfiguredError;
    }

    const auth = supabase.auth as { signOut(): Promise<{ error?: { message?: string } | null } | unknown> };
    const result = await auth.signOut();

    if (typeof result === 'object' && result !== null && 'error' in result && result.error) {
      throw result.error;
    }
  }, [isMockMode]);

  const sendPasswordReset = useCallback(async (email: string) => {
    if (!supabase) {
      throw unconfiguredError;
    }

    const auth = supabase.auth as {
      resetPasswordForEmail(
        value: string,
        options: { redirectTo: string }
      ): Promise<{ error: { message?: string } | null }>;
    };

    const { error } = await auth.resetPasswordForEmail(email, {
      redirectTo: resolveAuthRedirectUrl('/recuperar-senha')
    });

    if (error) {
      throw error;
    }
  }, []);

  const refreshBackendUser = useCallback(async () => {
    if (!session) {
      setBackendUser(null);
      return;
    }

    try {
      const nextUser = await fetchBackendUser(session.access_token);
      setBackendUser(nextUser);
      setAuthError('');
    } catch (err) {
      if (err instanceof ProfileNotFoundError) {
        setBackendUser(null);
        setAuthError('');
      } else {
        setAuthError(resolveAccountAuthErrorMessage(err));
        throw err;
      }
    }
  }, [session]);

  const value = useMemo<AuthContextValue>(
    () => ({
      hasConfiguredAuth,
      isMockMode,
      loading,
      session,
      backendUser,
      backendUserResolved,
      authError,
      demoPersona,
      signIn,
      signInDemo,
      signOut,
      sendPasswordReset,
      refreshBackendUser
    }),
    [
      backendUser,
      backendUserResolved,
      authError,
      demoPersona,
      hasConfiguredAuth,
      isMockMode,
      loading,
      refreshBackendUser,
      sendPasswordReset,
      session,
      signIn,
      signInDemo,
      signOut
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
