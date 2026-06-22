import { useEffect, useRef, useState } from 'react';
import { ArrowRight, CirclePlus, Database, Info, ShieldCheck, UserRound, UserRoundCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SkeletonCard } from '../../../components/Skeleton';
import { useAuth } from '../../../hooks/useAuth';
import {
  createBiteplanerOrder,
  fetchOrders,
  fetchWorkflowForms,
  getAthleteNextPath,
  getAuthToken,
  getEffectiveAthleteOrder,
  isCustomerOnboardingComplete,
  type DemoOrderSummary,
  type DemoWorkflowForm,
} from '../../../features/demo/biteplanerFlow';
import { WorkflowFormsPanel } from '../components/WorkflowFormsPanel';
import * as S from '../PreRequisito/styles';

const ONBOARDING_TEMPLATE_KEY = 'customer_new_user_onboarding';
const NEXT_STEP_POLL_INTERVAL_MS = 900;
const NEXT_STEP_MAX_ATTEMPTS = 12;

function onboardingIsSubmitted(form: DemoWorkflowForm) {
  return isCustomerOnboardingComplete(form);
}

function getNextPathAfterOnboarding(order: DemoOrderSummary | null, forms: DemoWorkflowForm[]) {
  return getAthleteNextPath(getEffectiveAthleteOrder(order, forms));
}

function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function getBlockerMessage(form: DemoWorkflowForm | undefined) {
  const blocker = form?.summary && 'blocker' in form.summary ? form.summary.blocker : null;

  if (blocker === 'minor_without_guardian') {
    return 'Cadastro bloqueado: usuário menor de idade precisa que um responsável maior assuma ou crie a conta para continuar.';
  }

  if (blocker === 'privacy_consent_required') {
    return 'Cadastro bloqueado: aceite a política de privacidade e LGPD para continuar.';
  }

  return '';
}

export function CadastroUsuarioBiteplaner() {
  const { session, backendUser } = useAuth();
  const navigate = useNavigate();
  const token = getAuthToken(session);
  const [order, setOrder] = useState<DemoOrderSummary | null>(null);
  const [workflowForms, setWorkflowForms] = useState<DemoWorkflowForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [formsLoading, setFormsLoading] = useState(false);
  const [formsError, setFormsError] = useState('');
  const [error, setError] = useState('');
  const [privacyGateChecked, setPrivacyGateChecked] = useState(false);
  const [privacyGateUnlocked, setPrivacyGateUnlocked] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const nextStepPollingRef = useRef(false);

  useEffect(() => {
    if (!token) {
      return;
    }

    let active = true;

    async function loadOrder() {
      try {
        const response = await fetchOrders('user', token);
        const existingOrder =
          response.orders.find((item) => item.status === 'registration_started') ?? response.orders[0] ?? null;
        const nextOrder = existingOrder ?? await createBiteplanerOrder(token);

        if (active) {
          setOrder(nextOrder);
        }
      } catch {
        if (active) {
          setOrder(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadOrder();

    return () => {
      active = false;
    };
  }, [token]);

  useEffect(() => {
    if (!token || !order?.id) {
      setWorkflowForms([]);
      return;
    }

    let active = true;
    const orderId = order.id;
    setFormsLoading(true);
    setFormsError('');

    async function loadForms() {
      try {
        const response = await fetchWorkflowForms(orderId, token);

        if (active) {
          setWorkflowForms(response.forms);
        }
      } catch {
        if (active) {
          setFormsError('Não foi possível carregar o cadastro inicial do Biteplaner.');
        }
      } finally {
        if (active) {
          setFormsLoading(false);
        }
      }
    }

    void loadForms();

    return () => {
      active = false;
    };
  }, [order?.id, token]);

  useEffect(() => {
    if (loading || formsLoading || onboardingCompleted || !order) {
      return;
    }

    const submittedOnboarding = workflowForms.find(
      (form) => form.templateKey === ONBOARDING_TEMPLATE_KEY && onboardingIsSubmitted(form)
    );

    if (!submittedOnboarding) {
      return;
    }

    const blockerMessage = getBlockerMessage(submittedOnboarding);

    if (blockerMessage) {
      setError(blockerMessage);
      return;
    }

    void prepareNextStepAfterOnboarding(workflowForms);
  }, [formsLoading, loading, onboardingCompleted, order, workflowForms]);

  async function prepareNextStepAfterOnboarding(initialForms: DemoWorkflowForm[]) {
    if (!order?.id || !token || nextStepPollingRef.current) {
      return;
    }

    nextStepPollingRef.current = true;
    setOnboardingCompleted(true);

    let nextOrder = order;
    let nextForms = initialForms;

    for (let attempt = 0; attempt < NEXT_STEP_MAX_ATTEMPTS; attempt += 1) {
      setWorkflowForms(nextForms);

      const nextPath = getNextPathAfterOnboarding(nextOrder, nextForms);
      const nextStepReady = nextPath !== '/painel/biteplaner/onboarding';

      if (nextStepReady) {
        navigate(nextPath, { replace: true });
        return;
      }

      await delay(NEXT_STEP_POLL_INTERVAL_MS);

      try {
        const [ordersResponse, formsResponse] = await Promise.all([
          fetchOrders('user', token),
          fetchWorkflowForms(order.id, token),
        ]);
        nextOrder = ordersResponse.orders.find((item) => item.id === order.id) ?? ordersResponse.orders[0] ?? nextOrder;
        nextForms = formsResponse.forms;
        setOrder(nextOrder);
      } catch {
        setError('Estamos preparando a próxima etapa. Aguarde alguns instantes e tente atualizar a página.');
        nextStepPollingRef.current = false;
        return;
      }
    }

    setError('Estamos preparando o pré-requisito Biteplaner. Aguarde alguns instantes antes de continuar.');
    nextStepPollingRef.current = false;
  }

  function handleWorkflowFormsChange(nextForms: DemoWorkflowForm[]) {
    setWorkflowForms(nextForms);
    const submittedOnboarding = nextForms.find(
      (form) => form.templateKey === ONBOARDING_TEMPLATE_KEY && onboardingIsSubmitted(form)
    );

    if (!submittedOnboarding) {
      return;
    }

    const blockerMessage = getBlockerMessage(submittedOnboarding);

    if (blockerMessage) {
      setError(blockerMessage);
      setOnboardingCompleted(false);
      return;
    }

    setError('');
    void prepareNextStepAfterOnboarding(nextForms);
  }

  const submittedOnboarding = workflowForms.find(
    (form) => form.templateKey === ONBOARDING_TEMPLATE_KEY && onboardingIsSubmitted(form)
  );
  const hasReleasedOnboardingForm = workflowForms.some(
    (form) =>
      form.templateKey === ONBOARDING_TEMPLATE_KEY &&
      form.status !== 'superseded' &&
      form.status !== 'cancelled'
  );
  const showUnavailableOnboardingForm = Boolean(
    privacyGateUnlocked &&
    !submittedOnboarding &&
    !formsError &&
    (!order || !hasReleasedOnboardingForm)
  );

  return (
    <S.Page>
      {loading ? (
        <S.Content aria-label="Carregando pedido Biteplaner">
          <SkeletonCard lines={5} blockHeight="96px" />
        </S.Content>
      ) : null}
      {error ? <S.Banner role="alert">{error}</S.Banner> : null}
      {!loading && formsLoading ? (
        <S.Content aria-label="Carregando cadastro inicial Biteplaner">
          <SkeletonCard lines={5} blockHeight="120px" />
        </S.Content>
      ) : null}
      {formsError ? <S.Banner role="alert">{formsError}</S.Banner> : null}
      {!loading && !formsLoading ? (
        <S.Content>
          {onboardingCompleted ? (
            <S.OnboardingCompletion role="status" aria-live="polite">
              <S.OnboardingCompletionIcon aria-hidden="true">✓</S.OnboardingCompletionIcon>
              <S.OnboardingCompletionTitle>Agradecemos sua disponibilidade e confiança.</S.OnboardingCompletionTitle>
              <S.OnboardingCompletionText>
                Conte conosco,
                <br />
                Equipe NEXOR
              </S.OnboardingCompletionText>
              <S.OnboardingCountdown>Preparando sua próxima etapa.</S.OnboardingCountdown>
            </S.OnboardingCompletion>
          ) : submittedOnboarding ? (
            <S.OnboardingCompletion role="status" aria-live="polite">
              <S.OnboardingCompletionIcon aria-hidden="true">✓</S.OnboardingCompletionIcon>
              <S.OnboardingCompletionTitle>Cadastro já enviado.</S.OnboardingCompletionTitle>
              <S.OnboardingCompletionText>Vamos abrir a próxima etapa da sua jornada.</S.OnboardingCompletionText>
            </S.OnboardingCompletion>
          ) : (
            <S.OnboardingCard>
              <S.OnboardingHero>
                <S.OnboardingHeroContent>
                  <S.OnboardingMainTitle>
                    <S.OnboardingHeroIcon aria-hidden="true">
                      <UserRound size={48} strokeWidth={1.9} />
                      <S.OnboardingHeroIconBadge>
                        <CirclePlus size={20} strokeWidth={2.5} />
                      </S.OnboardingHeroIconBadge>
                    </S.OnboardingHeroIcon>
                    <span>Cadastro de novos usuários</span>
                  </S.OnboardingMainTitle>
                  <S.OnboardingHeroLead>
                    Este cadastro é o primeiro passo para quem optou por adquirir o <strong>Biteplaner</strong>.
                    Depois dele, a jornada segue para a pré-consulta clínica compartilhada com o dentista.
                  </S.OnboardingHeroLead>
                  <S.OnboardingInfoCallout>
                    <Info size={24} strokeWidth={2.4} aria-hidden="true" />
                    <span>
                      A NEXOR é uma empresa de bioengenharia que desenvolve pesquisas científicas e dispositivos
                      técnicos personalizados para auxiliar atletas de elite e pessoas a treinar com mais Conforto,
                      Segurança, Performance, Consistência, Saúde e Longevidade.
                    </span>
                  </S.OnboardingInfoCallout>
                  <S.RequiredHint>* Indica uma pergunta obrigatória.</S.RequiredHint>
                </S.OnboardingHeroContent>
                <S.OnboardingHeroVisual aria-hidden="true">
                  <S.OnboardingHeroClipboard>
                    <S.ClipboardClip />
                    <S.ClipboardAvatar>
                      <UserRound size={48} strokeWidth={1.8} />
                    </S.ClipboardAvatar>
                    <S.ClipboardLines>
                      <span />
                      <span />
                      <span />
                      <span />
                    </S.ClipboardLines>
                    <S.ClipboardShield>
                      <ShieldCheck size={58} strokeWidth={2.2} />
                    </S.ClipboardShield>
                  </S.OnboardingHeroClipboard>
                </S.OnboardingHeroVisual>
              </S.OnboardingHero>

              {!privacyGateUnlocked ? (
                <>
                  <S.OnboardingDivider />
                  <S.PrivacyGate>
                    <S.PrivacyGateContent>
                      <S.PrivacyGateLabel>
                        <input
                          type="checkbox"
                          checked={privacyGateChecked}
                          onChange={(event) => setPrivacyGateChecked(event.target.checked)}
                        />
                        <span>
                          Declaro que li e entendi a{' '}
                          <S.PrivacyGateLink to="/privacidade" target="_blank" rel="noopener noreferrer">
                            Política de Privacidade da NEXOR
                          </S.PrivacyGateLink>{' '}
                          e concordo com o tratamento dos meus dados pessoais, incluindo dados de saúde quando
                          informados, para as seguintes finalidades principais:
                        </span>
                      </S.PrivacyGateLabel>
                      <S.PrivacyGateList>
                        <li>
                          <UserRoundCheck size={18} strokeWidth={2} aria-hidden="true" />
                          <span>Viabilizar meu cadastro, meu atendimento e o uso dos serviços e dispositivos da NEXOR</span>
                        </li>
                        <li>
                          <ShieldCheck size={18} strokeWidth={2} aria-hidden="true" />
                          <span>
                            Registrar informações necessárias para meu cuidado, minha segurança e meu acompanhamento ao
                            longo do tempo
                          </span>
                        </li>
                        <li>
                          <Database size={18} strokeWidth={2} aria-hidden="true" />
                          <span>
                            Formar bases de dados, preferencialmente anonimizadas, para análise, pesquisa e
                            desenvolvimento de produtos, sempre de acordo com a Lei Geral de Proteção de Dados (LGPD)
                          </span>
                        </li>
                      </S.PrivacyGateList>
                      <S.PrivacyGateText>
                        <Info size={18} strokeWidth={2} aria-hidden="true" />
                        <span>
                          Estou ciente de que posso solicitar acesso, correção ou exclusão de dados excessivos, bem como
                          revogar meu consentimento para comunicações não essenciais, nos canais indicados na{' '}
                          <S.PrivacyGateLink to="/privacidade" target="_blank" rel="noopener noreferrer">
                            Política de Privacidade
                          </S.PrivacyGateLink>
                          .
                        </span>
                      </S.PrivacyGateText>
                      <S.OnboardingDivider />
                      <S.PrivacyGateAction
                        type="button"
                        disabled={!privacyGateChecked}
                        onClick={() => setPrivacyGateUnlocked(true)}
                      >
                        Continuar
                        <ArrowRight size={18} strokeWidth={2.4} />
                      </S.PrivacyGateAction>
                    </S.PrivacyGateContent>
                  </S.PrivacyGate>
                </>
              ) : null}

              {showUnavailableOnboardingForm ? (
                <>
                  <S.OnboardingDivider />
                  <S.GuidanceBanner role="status" data-testid="onboarding-form-preparing">
                    <Info size={22} strokeWidth={2.4} aria-hidden="true" />
                    <div>
                      <p>
                        <strong>Preparando seu cadastro Biteplaner.</strong>
                      </p>
                      <p>
                        Estamos vinculando seu pedido ao formulário inicial. Atualize a página em alguns instantes se
                        o cadastro não aparecer automaticamente.
                      </p>
                    </div>
                  </S.GuidanceBanner>
                </>
              ) : (
                <WorkflowFormsPanel
                  orderId={order?.id ?? null}
                  token={token}
                  title="Cadastro Biteplaner"
                  description=""
                  formsLocked={!privacyGateUnlocked}
                  payloadExtras={privacyGateUnlocked ? { privacyConsent: ['accepted'] } : undefined}
                  templateFilter={[ONBOARDING_TEMPLATE_KEY]}
                  defaultValues={{
                    fullName: order?.customer?.full_name ?? '',
                    email: order?.customer?.email ?? backendUser?.email ?? '',
                    phone: order?.customer?.phone ?? '',
                  }}
                  forms={workflowForms}
                  onFormsChange={handleWorkflowFormsChange}
                  actorRole="user"
                  formPresentation="flat"
                  showFormHeader={false}
                  variant="embedded"
                />
              )}
            </S.OnboardingCard>
          )}

        </S.Content>
      ) : null}
    </S.Page>
  );
}
