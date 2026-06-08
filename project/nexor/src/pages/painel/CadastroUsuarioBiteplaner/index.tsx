import { useEffect, useState } from 'react';
import { ArrowRight, CirclePlus, Database, Info, ShieldCheck, UserRound, UserRoundCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SkeletonCard } from '../../../components/Skeleton';
import { useAuth } from '../../../hooks/useAuth';
import {
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

function onboardingIsSubmitted(form: DemoWorkflowForm) {
  return isCustomerOnboardingComplete(form);
}

function getNextPathAfterOnboarding(order: DemoOrderSummary | null, forms: DemoWorkflowForm[]) {
  return getAthleteNextPath(getEffectiveAthleteOrder(order, forms));
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

  useEffect(() => {
    if (!token) {
      return;
    }

    let active = true;

    async function loadOrder() {
      try {
        const response = await fetchOrders('user', token);
        const nextOrder = response.orders.find((item) => item.status === 'registration_started') ?? response.orders[0] ?? null;

        if (active) {
          setOrder(nextOrder);
        }
      } catch {
        if (active) {
          setError('Não foi possível carregar o pedido Biteplaner.');
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

    navigate(getNextPathAfterOnboarding(order, workflowForms), { replace: true });
  }, [formsLoading, loading, navigate, onboardingCompleted, order, workflowForms]);

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
    setOnboardingCompleted(true);
    navigate(getNextPathAfterOnboarding(order, nextForms), { replace: true });
  }

  const submittedOnboarding = workflowForms.find(
    (form) => form.templateKey === ONBOARDING_TEMPLATE_KEY && onboardingIsSubmitted(form)
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
              <S.OnboardingCountdown>Redirecionando para a próxima etapa.</S.OnboardingCountdown>
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
            </S.OnboardingCard>
          )}

        </S.Content>
      ) : null}
    </S.Page>
  );
}
