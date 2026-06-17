import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Briefcase,
  CalendarDays,
  ChartNoAxesCombined,
  ClipboardList,
  Clock3,
  FlaskConical,
  Info,
  ShoppingBag,
  ShoppingCart,
  UserRound,
} from 'lucide-react';
import { SkeletonGrid } from '../../../components/Skeleton';
import { useAuth } from '../../../hooks/useAuth';
import { api } from '../../../lib/api';
import { DEMO_PERSONA_LABELS } from '../../../features/demo/persona';
import { parseEnv } from '../../../config/env';
import biteplanerComingSoonProduct from '../../../assets/biteplaner-coming-soon-product.png';
import biteplanerMoldera from '../../../assets/biteplaner-transparent-2.png';
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
};

const CLOSED_ORDER_STATUSES = new Set(['completed', 'cancelled']);
const EXCLUSIVE_OPERATIONAL_ROLES: ProductRoleKey[] = ['partner', 'dentist', 'lab'];

const ROLE_ACTIONS: Array<{
  role: ProductRoleKey;
  title: string;
  description: string;
  buttonLabel: string;
  requestPath?: string;
}> = [
    {
      role: 'customer',
      title: 'Adquirir Biteplaner',
      description: 'Inicie a compra e libere todos os recursos da plataforma.',
      buttonLabel: 'Iniciar compra',
    },
    {
      role: 'partner',
      title: 'Solicitar parceria',
      description: 'Entrar como parceiro indicador.',
      buttonLabel: 'Solicitar parceria',
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
  if (role === 'customer') {
    return <ShoppingBag size={28} strokeWidth={2} />;
  }

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
  const hasActiveOrder = orders.some((order) => !CLOSED_ORDER_STATUSES.has(order.status));
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
      await api.post('/v1/orders', {}, token);
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
        <S.ProductHero $backgroundImage={biteplanerMoldera} data-testid="biteplaner-product-banner">
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
                <S.BpRowLabel>Valor</S.BpRowLabel>
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

                void activateCustomer();
              }}
            >
              {shouldTrackOrder ? (
                <ClipboardList size={22} strokeWidth={2.2} />
              ) : (
                <ShoppingCart size={22} strokeWidth={2.2} />
              )}
              {shouldTrackOrder ? 'Acompanhar sua ordem' : 'Adquirir Biteplaner'}
              <ArrowRight size={22} strokeWidth={2.2} />
            </S.HeroButton>
            <S.BpSecondaryLinks>
              <S.BpLink to="/painel/biteplaner/jornada">
                <ChartNoAxesCombined size={18} strokeWidth={2} />
                Ver jornada
              </S.BpLink>
              <S.BpLink to="/biteplaner">
                <Info size={18} strokeWidth={2} />
                Ver detalhes
              </S.BpLink>
            </S.BpSecondaryLinks>
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
          <S.SectionTitle>Ações rápidas</S.SectionTitle>
          <S.SectionSubtitle>Atalhos para otimizar sua rotina no Biteplaner.</S.SectionSubtitle>
        </S.QuickActionsHeader>
        {loadingRoles ? (
          <SkeletonGrid cards={4} minCardWidth="260px" />
        ) : (
          <S.RoleActionsGrid aria-label="Perfis Biteplaner">
            {ROLE_ACTIONS.map((action) => {
              const currentRole = rolesByKey.get(action.role);
              const isPending = currentRole?.status === 'pending';
              const isActive = currentRole?.status === 'active';
              const isCustomer = action.role === 'customer';
              const isCustomerTrackingAction = isCustomer && shouldTrackOrder;
              const isOperationalRoleBlocked =
                !isCustomer && activeOrPendingOperationalRole !== undefined && activeOrPendingOperationalRole !== action.role;
              const operationalBlockerLabel = activeOrPendingOperationalRole
                ? getOperationalRoleLabel(activeOrPendingOperationalRole)
                : '';
              const disabled =
                loadingRoles ||
                submittingRole ||
                isPending ||
                isOperationalRoleBlocked ||
                (!isCustomer && isActive && !isCustomerTrackingAction);
              const actionTitle = isPending
                ? `Cadastro de ${getOperationalRoleLabel(action.role)} em análise`
                : isPending
                  ? `Sua solicitação de ${getOperationalRoleLabel(action.role)} está em análise pela equipe Nexor.`
                  : isCustomerTrackingAction
                  ? 'Acompanhar sua ordem'
                  : action.title;
              const actionDescription = isOperationalRoleBlocked
                ? `Sua conta já possui solicitação ou perfil de ${operationalBlockerLabel} no Biteplaner.`
                : isCustomerTrackingAction
                  ? 'Continue pelo acompanhamento da sua jornada Biteplaner.'
                  : action.description;
              const actionButtonLabel = isOperationalRoleBlocked
                ? 'Indisponível'
                : isCustomerTrackingAction
                  ? 'Acompanhar ordem'
                  : action.buttonLabel;
              const statusLabel = isOperationalRoleBlocked ? 'Indisponível' : getRoleStatusLabel(currentRole?.status);
              const shouldShowActionButton = !isPending && !(isActive && !isCustomer);

              return (
                <S.RoleActionCard
                  key={action.role}
                  $disabled={isOperationalRoleBlocked}
                  aria-disabled={isOperationalRoleBlocked}
                >
                  <S.RoleCardIcon aria-hidden="true">
                    {isCustomerTrackingAction ? <ClipboardList size={28} strokeWidth={2} /> : getActionIcon(action.role)}
                  </S.RoleCardIcon>
                  <S.RoleStatusPill $tone={isActive ? 'success' : isPending ? 'warning' : 'neutral'}>
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
                        if (isCustomerTrackingAction) {
                          trackOrder();
                          return;
                        }

                        if (isCustomer) {
                          void activateCustomer();
                          return;
                        }

                        if (action.requestPath) {
                          navigate(action.requestPath);
                        }
                      }}
                    >
                      <span>{actionButtonLabel}</span>
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
