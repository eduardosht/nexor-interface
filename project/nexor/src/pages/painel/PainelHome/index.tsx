import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Briefcase,
  CalendarDays,
  Clock3,
  Info,
  ShieldCheck,
  ShoppingCart,
  UserRound,
} from 'lucide-react';
import { SkeletonGrid } from '../../../components/Skeleton';
import { useAuth } from '../../../hooks/useAuth';
import { DEMO_PERSONA_LABELS } from '../../../features/demo/persona';
import { parseEnv } from '../../../config/env';
import biteplanerComingSoonProduct from '../../../assets/biteplaner-coming-soon-product.png';
import biteplanerAdministrationBackground from '../../../assets/backgrounds/background-biteplaner-administration-dash.png';
import * as S from './styles';

type ProductRoleKey = 'customer' | 'partner' | 'dentist';
type ProductRoleStatus = 'pending' | 'active' | 'rejected' | 'suspended';

type ProductRole = {
  productKey: string;
  role: ProductRoleKey;
  status: ProductRoleStatus;
};

const EXCLUSIVE_OPERATIONAL_ROLES: ProductRoleKey[] = ['partner', 'dentist'];

const ROLE_ACTIONS: Array<{
  role: ProductRoleKey;
  title: string;
  description: string;
  buttonLabel: string;
  requestPath?: string;
}> = [
    {
      role: 'partner',
      title: 'Parceria comercial Biteplaner',
      description: 'Indique dentistas para o Biteplaner e acompanhe oportunidades comerciais aprovadas pela Nexor.',
      buttonLabel: 'Solicitar parceria comercial',
      requestPath: '/painel/biteplaner/cadastro/parceiro',
    },
    {
      role: 'dentist',
      title: 'Licença de dentista Biteplaner',
      description: 'Envie seus dados profissionais para solicitar acesso de compra do produto Biteplaner.',
      buttonLabel: 'Solicitar licença de dentista',
      requestPath: '/painel/biteplaner/cadastro/dentista',
    },
  ];

function getRoleStatusLabel(status?: ProductRoleStatus) {
  if (status === 'active') {
    return 'Ativo';
  }

  if (status === 'pending') {
    return 'Pendente';
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

  return <UserRound size={28} strokeWidth={2} />;
}

function getOperationalRoleLabel(role: ProductRoleKey) {
  if (role === 'partner') {
    return 'parceiro';
  }

  if (role === 'dentist') {
    return 'dentista';
  }

  return 'conta';
}

export function PainelHome() {
  const navigate = useNavigate();
  const { backendUser, backendUserResolved, demoPersona, isMockMode, session } = useAuth();
  const { disableBiteplaner } = parseEnv(import.meta.env);
  const [roleError, setRoleError] = useState('');
  const token = session?.access_token;
  const loadingRoles = Boolean(token && !backendUserResolved);
  const productRoles = useMemo(
    () =>
      (backendUser?.productRoles ?? [])
        .filter((role): role is ProductRole =>
          role.productKey === 'biteplaner' &&
          ['customer', 'partner', 'dentist'].includes(role.role) &&
          ['pending', 'active', 'rejected', 'suspended'].includes(role.status)
        ),
    [backendUser?.productRoles]
  );
  const rolesByKey = useMemo(
    () => new Map(productRoles.map((role) => [role.role, role])),
    [productRoles]
  );
  const activeOrPendingOperationalRole = EXCLUSIVE_OPERATIONAL_ROLES.find((role) => {
    const status = rolesByKey.get(role)?.status;
    return status === 'active' || status === 'pending';
  });

  useEffect(() => {
    if (!token) {
      setRoleError('');
      return;
    }

    setRoleError(backendUserResolved && !backendUser ? 'Não foi possível carregar sua conta Nexor.' : '');
  }, [backendUser, backendUserResolved, token]);

  function openBiteplanerPurchase() {
    navigate('/painel/compra');
  }

  function openRoleDashboard(_role: ProductRoleKey) {
    navigate('/painel/biteplaner');
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
              Produto Nexor para dentistas licenciados comprarem unidades do Biteplaner com tecnologia, segurança e suporte especializado.
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
                    aria-label="O valor é referente a uma unidade do Biteplaner comprada pelo dentista licenciado."
                  >
                    <Info size={13} strokeWidth={2.4} aria-hidden="true" />
                    <S.BpTooltipBubble role="tooltip">
                      O valor é referente a uma unidade do Biteplaner comprada pelo dentista licenciado.
                    </S.BpTooltipBubble>
                  </S.BpTooltipTrigger>
                </S.BpLabelWithTooltip>
                <S.BpPrice>R$ 1.370,00</S.BpPrice>
              </S.ProductStat>
            </S.ProductStats>
            <S.HeroButton
              type="button"
              disabled={loadingRoles}
              onClick={() => {
                openBiteplanerPurchase();
              }}
            >
              <ShoppingCart size={22} strokeWidth={2.2} />
              Comprar Biteplaner
              <ArrowRight size={22} strokeWidth={2.2} />
            </S.HeroButton>
            <S.HeroTrustLine aria-label="Compra segura, suporte especializado e atualizações inclusas">
              <ShieldCheck size={20} strokeWidth={2.2} aria-hidden="true" />
              <span>Compra segura</span>
              <S.HeroTrustSeparator aria-hidden="true" />
              <span>Suporte especializado</span>
              <S.HeroTrustSeparator aria-hidden="true" />
              <span>Atualizações inclusas</span>
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
            Solicite licenciamento profissional para vender e operar o Biteplaner como dentista ou parceiro autorizado.
          </S.SectionSubtitle>
        </S.QuickActionsHeader>
        {loadingRoles ? (
          <SkeletonGrid cards={2} minCardWidth="260px" />
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
                isPending ||
                isOperationalRoleBlocked ||
                isActive;
              const actionTitle = action.title;
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
                  {isPending ? (
                    <S.PendingLicensingNotice role="status">
                      <Clock3 size={18} aria-hidden="true" />
                      <span>Cadastro enviado. Aguarde a Nexor verificar seus dados para seguir para aprovação.</span>
                    </S.PendingLicensingNotice>
                  ) : null}
                  {shouldShowActionButton ? (
                    <S.RoleActionButton
                      type="button"
                      aria-label={actionButtonLabel}
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
