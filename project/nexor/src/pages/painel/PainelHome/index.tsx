import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Briefcase,
  CalendarDays,
  ClipboardList,
  Clock3,
  FlaskConical,
  Info,
  ShieldCheck,
  ShoppingCart,
  UserRound,
} from 'lucide-react';
import { SkeletonGrid } from '../../../components/Skeleton';
import { useAuth } from '../../../hooks/useAuth';
import { api } from '../../../lib/api';
import { DEMO_PERSONA_LABELS } from '../../../features/demo/persona';
import { parseEnv } from '../../../config/env';
import biteplanerComingSoonProduct from '../../../assets/biteplaner-coming-soon-product.png';
import biteplanerAdministrationBackground from '../../../assets/backgrounds/background-biteplaner-administration-dash.png';
import * as S from './styles';

type ProductRoleKey = 'customer' | 'partner' | 'dentist' | 'lab';
type ProductRoleStatus = 'pending' | 'active' | 'rejected' | 'suspended';

type ProductRole = {
  productKey: string;
  role: ProductRoleKey;
  status: ProductRoleStatus;
};

type BiteplanerOrder = {
  id: string;
  status: string;
  stage?: string | null;
};

const CLOSED_ORDER_STATUSES = new Set(['cancelled']);
const EXCLUSIVE_OPERATIONAL_ROLES: ProductRoleKey[] = ['partner', 'dentist', 'lab'];

const ROLE_ACTIONS: Array<{
  role: ProductRoleKey;
  title: string;
  description: string;
  buttonLabel: string;
  requestPath?: string;
}> = [
    {
      role: 'partner',
      title: 'Solicitar cadastro de coach/academia',
      description: 'Cadastre coach ou academia para indicar atletas e acompanhar oportunidades no Biteplaner.',
      buttonLabel: 'Solicitar cadastro',
      requestPath: '/painel/biteplaner/cadastro/parceiro',
    },
    {
      role: 'dentist',
      title: 'Solicitar cadastro de dentista',
      description: 'Enviar dados profissionais para análise.',
      buttonLabel: 'Solicitar cadastro',
      requestPath: '/painel/biteplaner/cadastro/dentista',
    },
    {
      role: 'lab',
      title: 'Solicitar cadastro de laboratório',
      description: 'Cadastrar laboratório para avaliação.',
      buttonLabel: 'Solicitar cadastro',
      requestPath: '/painel/biteplaner/cadastro/laboratório',
    },
  ];

function getRoleStatusLabel(status?: ProductRoleStatus) {
  if (status === 'active') {
    return 'Ativo';
  }

  if (status === 'pending') {
    return 'Em análise';
  }

  if (status === 'rejected') {
    return 'Não aprovado';
  }

  if (status === 'suspended') {
    return 'Suspenso';
  }

  return 'Disponível';
}

function getActionIcon(role: ProductRoleKey) {
  if (role === 'partner') {
    return <Briefcase size={28} strokeWidth={2} />;
  }

  if (role === 'dentist') {
    return <UserRound size={28} strokeWidth={2} />;
  }

  return <FlaskConical size={28} strokeWidth={2} />;
}

function getOperationalRoleLabel(role: ProductRoleKey) {
  if (role === 'partner') {
    return 'parceiro';
  }

  if (role === 'dentist') {
    return 'dentista';
  }

  if (role === 'lab') {
    return 'laboratório';
  }

  return 'cliente';
}

function isTrackableBiteplanerOrder(order: BiteplanerOrder) {
  return !CLOSED_ORDER_STATUSES.has(order.status) && order.status !== 'registration_started';
}

function isNewUserOnboardingOrder(order: BiteplanerOrder) {
  return !CLOSED_ORDER_STATUSES.has(order.status) && order.status === 'registration_started';
}

export function PainelHome() {
  const navigate = useNavigate();
  const { demoPersona, isMockMode, session } = useAuth();
  const { disableBiteplaner } = parseEnv(import.meta.env);
  const [productRoles, setProductRoles] = useState<ProductRole[]>([]);
  const [orders, setOrders] = useState<BiteplanerOrder[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [submittingRole, setSubmittingRole] = useState(false);
  const [roleError, setRoleError] = useState('');
  const token = session?.access_token;
  const rolesByKey = useMemo(
    () => new Map(productRoles.map((role) => [role.role, role])),
    [productRoles]
  );
  const hasActiveOrder = orders.some(isTrackableBiteplanerOrder);
  const hasNewUserOnboardingOrder = orders.some(isNewUserOnboardingOrder);
  const shouldTrackOrder = hasActiveOrder;
  const activeOrPendingOperationalRole = EXCLUSIVE_OPERATIONAL_ROLES.find((role) => {
    const status = rolesByKey.get(role)?.status;
    return status === 'active' || status === 'pending';
  });

  useEffect(() => {
    if (!token) {
      setProductRoles([]);
      setOrders([]);
      return;
    }

    let active = true;
    setLoadingRoles(true);
    Promise.all([
      api.get<{ productRoles: ProductRole[] }>('/v1/account/product-roles', token),
      api.get<{ orders?: BiteplanerOrder[] }>('/v1/orders?as=user', token)
    ])
      .then(([rolesResponse, ordersResponse]) => {
        if (active) {
          setProductRoles(rolesResponse.productRoles.filter((role) => role.productKey === 'biteplaner'));
          setOrders(ordersResponse.orders ?? []);
        }
      })
      .catch(() => {
        if (active) {
          setRoleError('Não foi possível carregar seus perfis do Biteplaner.');
        }
      })
      .finally(() => {
        if (active) {
          setLoadingRoles(false);
        }
      });

    return () => {
      active = false;
    };
  }, [token]);

  function mergeProductRole(productRole: ProductRole) {
    setProductRoles((current) => {
      const withoutCurrent = current.filter((role) => role.role !== productRole.role);
      return [...withoutCurrent, productRole];
    });
  }

  async function activateCustomer() {
    if (!token) {
      setRoleError('Sessão expirada. Entre novamente para continuar.');
      return;
    }

    setRoleError('');
    setSubmittingRole(true);

    try {
      const response = await api.post<{ productRole: ProductRole }>(
        '/v1/account/products/biteplaner/roles/customer',
        {},
        token
      );
      mergeProductRole(response.productRole);
      navigate('/painel/biteplaner/onboarding');
    } catch {
      setRoleError('Não foi possível iniciar o Biteplaner agora.');
    } finally {
      setSubmittingRole(false);
    }
  }

  function trackOrder() {
    navigate('/painel/biteplaner/jornada');
  }

  function openNewUserOnboarding() {
    navigate('/painel/biteplaner/onboarding');
  }

  function openRoleDashboard(role: ProductRoleKey) {
    navigate(`/painel/biteplaner?mode=${role}`);
  }

  return (
    <S.Page>
      {disableBiteplaner ? (
        <S.ComingSoonHero data-testid="biteplaner-coming-soon-hero">
          <S.HeroCopy>
            <S.HeroBadge>
              <Clock3 size={22} strokeWidth={2.4} />
              EM BREVE
            </S.HeroBadge>
            <S.HeroTitle>
              Em breve
              <br />
              no nosso <span>site.</span>
            </S.HeroTitle>
            <S.HeroDescription>A compra do Biteplaner estará disponível em breve.</S.HeroDescription>
            <S.HeroAccentLine aria-hidden="true" />
            <S.HeroNotice>
              <S.HeroNoticeIcon aria-hidden="true">
                <CalendarDays size={30} strokeWidth={2.2} />
              </S.HeroNoticeIcon>
              <div>
                <S.HeroNoticeTitle>Fique ligado.</S.HeroNoticeTitle>
                <S.HeroNoticeText>Novidades chegando para elevar sua performance.</S.HeroNoticeText>
              </div>
            </S.HeroNotice>
          </S.HeroCopy>

          <S.HeroProductImage
            src={biteplanerComingSoonProduct}
            alt=""
            aria-hidden="true"
            data-testid="biteplaner-coming-soon-product"
          />
          <S.HeroSignature>TECNOLOGIA • PERFORMANCE • PROTEÇÃO</S.HeroSignature>
        </S.ComingSoonHero>
      ) : (
        <S.ProductHero $backgroundImage={biteplanerAdministrationBackground} data-testid="biteplaner-product-banner">
          <S.ProductHeroContent>
            <S.ProductTitle>Biteplaner</S.ProductTitle>
            <S.ProductDescription>
              Plataforma completa para triagem odontológica, planejamento e acompanhamento de atletas com tecnologia e segurança.
            </S.ProductDescription>
            <S.ProductStats>
              <S.ProductStat>
                <S.BpRowLabel>Status</S.BpRowLabel>
                <S.BpStatusBadge>Disponível</S.BpStatusBadge>
              </S.ProductStat>
              <S.ProductStat>
                <S.BpLabelWithTooltip>
                  <S.BpRowLabel>Valor</S.BpRowLabel>
                  <S.BpTooltipTrigger
                    type="button"
                    aria-label="O valor é referente a uma unidade do Biteplaner. Valores de consultas são acertados à parte com o dentista licenciado."
                  >
                    <Info size={13} strokeWidth={2.4} aria-hidden="true" />
                    <S.BpTooltipBubble role="tooltip">
                      O valor é referente a uma unidade do Biteplaner. Valores de consultas são acertados à parte
                      com o dentista licenciado.
                    </S.BpTooltipBubble>
                  </S.BpTooltipTrigger>
                </S.BpLabelWithTooltip>
                <S.BpPrice>R$ 1.370,00</S.BpPrice>
              </S.ProductStat>
            </S.ProductStats>
            <S.HeroButton
              type="button"
              disabled={loadingRoles || submittingRole}
              onClick={() => {
                if (shouldTrackOrder) {
                  trackOrder();
                  return;
                }

                if (hasNewUserOnboardingOrder) {
                  openNewUserOnboarding();
                  return;
                }

                void activateCustomer();
              }}
            >
              {shouldTrackOrder ? (
                <ClipboardList size={22} strokeWidth={2.2} />
              ) : (
                <ShoppingCart size={22} strokeWidth={2.2} />
              )}
              {shouldTrackOrder ? 'Acompanhar sua ordem' : 'Adquira seu Biteplaner'}
              <ArrowRight size={22} strokeWidth={2.2} />
            </S.HeroButton>
            <S.HeroTrustLine aria-label="Compra segura, suporte especializado e atualizações inclusas">
              <ShieldCheck size={20} strokeWidth={2.2} aria-hidden="true" />
              <span>Compra segura</span>
              <S.HeroTrustSeparator aria-hidden="true" />
              <span>Suporte especializado</span>
            </S.HeroTrustLine>
          </S.ProductHeroContent>
        </S.ProductHero>
      )}

      {isMockMode && demoPersona ? (
        <S.DemoBanner data-testid="demo-banner-active-profile">
          <S.DemoBannerTitle>Modo demo ativo</S.DemoBannerTitle>
          <S.DemoBannerText>
            Você está simulando o perfil <strong>{DEMO_PERSONA_LABELS[demoPersona]}</strong> nesta sessão.
          </S.DemoBannerText>
        </S.DemoBanner>
      ) : null}

      {roleError ? (
        <S.DemoBanner role="alert">
          <S.DemoBannerText>{roleError}</S.DemoBannerText>
        </S.DemoBanner>
      ) : null}

      <S.QuickActionsSection>
        <S.QuickActionsHeader>
          <S.SectionTitle>Licenciamentos</S.SectionTitle>
          <S.SectionSubtitle>
            Inicie os licenciamentos das categorias de laboratório, dentista ou parceiro.
          </S.SectionSubtitle>
        </S.QuickActionsHeader>
        {loadingRoles ? (
          <SkeletonGrid cards={3} minCardWidth="260px" />
        ) : (
          <S.RoleActionsGrid aria-label="Perfis Biteplaner">
            {ROLE_ACTIONS.map((action) => {
              const currentRole = rolesByKey.get(action.role);
              const isPending = currentRole?.status === 'pending';
              const isActive = currentRole?.status === 'active';
              const isOperationalRoleBlocked =
                activeOrPendingOperationalRole !== undefined && activeOrPendingOperationalRole !== action.role;
              const operationalBlockerLabel = activeOrPendingOperationalRole
                ? getOperationalRoleLabel(activeOrPendingOperationalRole)
                : '';
              const disabled =
                loadingRoles ||
                submittingRole ||
                isPending ||
                isOperationalRoleBlocked ||
                isActive;
              const actionTitle = isPending
                ? `Cadastro de ${getOperationalRoleLabel(action.role)} em análise`
                : action.title;
              const actionDescription = isOperationalRoleBlocked
                ? `Sua conta já possui solicitação ou perfil de ${operationalBlockerLabel} no Biteplaner.`
                : action.description;
              const actionButtonLabel = isOperationalRoleBlocked
                ? 'Indisponível'
                : action.buttonLabel;
              const statusLabel = isOperationalRoleBlocked ? 'Indisponível' : getRoleStatusLabel(currentRole?.status);
              const shouldShowActionButton = !isPending && !isActive;
              const statusTone = isActive
                ? 'success'
                : isPending
                  ? 'warning'
                  : statusLabel === 'Disponível'
                    ? 'available'
                    : 'neutral';

              return (
                <S.RoleActionCard
                  key={action.role}
                  $disabled={isOperationalRoleBlocked}
                  aria-disabled={isOperationalRoleBlocked}
                >
                  <S.RoleCardIcon aria-hidden="true">
                    {getActionIcon(action.role)}
                  </S.RoleCardIcon>
                  <S.RoleStatusPill $tone={statusTone}>
                    {statusLabel}
                  </S.RoleStatusPill>
                  <S.RoleActionTitle>{actionTitle}</S.RoleActionTitle>
                  <S.RoleCardRule aria-hidden="true" />
                  <S.RoleActionMeta>{actionDescription}</S.RoleActionMeta>
                  {shouldShowActionButton ? (
                    <S.RoleActionButton
                      type="button"
                      aria-label={actionTitle}
                      disabled={disabled}
                      onClick={() => {
                        if (action.requestPath) {
                          navigate(action.requestPath);
                        }
                      }}
                    >
                      <span>{actionButtonLabel}</span>
                      <ArrowRight size={18} strokeWidth={2.2} />
                    </S.RoleActionButton>
                  ) : isActive ? (
                    <S.RoleActionButton
                      type="button"
                      aria-label={`Ir para Dashboard ${getOperationalRoleLabel(action.role)}`}
                      onClick={() => openRoleDashboard(action.role)}
                    >
                      <span>Ir para Dashboard</span>
                      <ArrowRight size={18} strokeWidth={2.2} />
                    </S.RoleActionButton>
                  ) : null}
                </S.RoleActionCard>
              );
            })}
          </S.RoleActionsGrid>
        )}
      </S.QuickActionsSection>
    </S.Page>
  );
}
