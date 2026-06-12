import { useState, useEffect, useLayoutEffect, useMemo, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, LogOut, Bell, ChevronLeft, ChevronRight, User, ShieldCheck, FlaskConical, Stethoscope, Handshake, X, BriefcaseBusiness, ClipboardList, Settings2, UserRound, Home, FileText, Star, Link2, Menu } from 'lucide-react';
import { useAuth, type BackendUser } from '../../../hooks/useAuth';
import { api } from '../../../lib/api';
import { publicOptimizedImages } from '../../../assets/publicOptimizedImages';
import { hasAdministrativeRole } from '../../../features/auth/adminRoles';
import { accountQueryKeys } from '../../../features/demo/biteplanerQueryKeys';
import * as S from './styles';
import { usePortalUiStore } from './portalUiStore';

const DESKTOP_MEDIA_QUERY = '(min-width: 769px)';
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

interface MockNotification {
  id: string;
  title: string;
  datetime: string;
  message: string;
  read: boolean;
}

interface AccountNotificationResponse {
  id: string;
  title: string;
  message: string;
  read: boolean;
  readAt?: string | null;
  createdAt: string;
}

interface AccountNotificationsResponse {
  notifications: AccountNotificationResponse[];
  unreadCount: number;
}

const MOCK_NOTIFICATIONS: MockNotification[] = [
  {
    id: 'ops-update',
    title: 'Nova atualização operacional',
    datetime: '12/05/2026, 09:30',
    read: false,
    message:
      'Mensagem completa da notificação operacional para orientar a equipe sobre novas etapas do painel. ' +
      'Ela ultrapassa o resumo do cartão para validar que o modal exibe o conteúdo completo sem truncar a leitura.',
  },
  {
    id: 'weekly-summary',
    title: 'Resumo semanal disponível',
    datetime: '11/05/2026, 17:10',
    read: true,
    message:
      'O resumo semanal de ordens, usuários e pendências administrativas já está disponível para consulta no painel.',
  },
];

function formatNotificationDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

function mapAccountNotification(notification: AccountNotificationResponse): MockNotification {
  return {
    id: notification.id,
    title: notification.title,
    datetime: formatNotificationDate(notification.createdAt),
    message: notification.message,
    read: notification.read
  };
}


















/* ─── Layout Shell ─── */


/* ─── Sidebar ─── */

















/* ─── Sidebar Footer ─── */



/* ─── Content area ─── */


/* ─── Top bar ─── */






/* ─── Scrollable content ─── */



/* ─── Nav items ─── */

const NAV_ITEMS = [
  { to: '/painel/home', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/painel/conta', label: 'Minha Conta', Icon: User },
];

const ADMIN_NAV_ITEMS = [
  { to: '/painel/admin/home', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/painel/admin/ordens', label: 'Ordens', Icon: ClipboardList },
  { to: '/painel/admin/relatorios', label: 'Relatórios', Icon: FileText },
  { to: '/painel/admin/parceiros', label: 'Parceiros', Icon: Handshake },
  { to: '/painel/admin/dentistas', label: 'Dentistas', Icon: Stethoscope },
  { to: '/painel/admin/laboratorios', label: 'Laboratórios', Icon: FlaskConical },
  { to: '/painel/admin/usuarios', label: 'Usuários', Icon: UserRound },
  { to: '/painel/admin/configuracoes/negocio', label: 'Config. Negócio', Icon: BriefcaseBusiness },
  { to: '/painel/admin/configuracoes/sistema', label: 'Config. Sistema', Icon: Settings2 },
];

const ADMIN_OVERVIEW_NAV_ITEMS = ADMIN_NAV_ITEMS.filter((item) => item.to === '/painel/admin/home');
const ADMIN_BITEPLANER_NAV_ITEMS = ADMIN_NAV_ITEMS.filter((item) => (
  item.to === '/painel/admin/ordens' ||
  item.to === '/painel/admin/relatorios' ||
  item.to === '/painel/admin/parceiros' ||
  item.to === '/painel/admin/dentistas' ||
  item.to === '/painel/admin/laboratorios'
));
const ADMIN_SYSTEM_NAV_ITEMS = ADMIN_NAV_ITEMS.filter((item) => (
  item.to === '/painel/admin/usuarios' ||
  item.to === '/painel/admin/configuracoes/negocio' ||
  item.to === '/painel/admin/configuracoes/sistema'
));

const ADMIN_MOBILE_PRIMARY_NAV_ITEMS = [
  { to: '/painel/admin/home', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/painel/admin/ordens', label: 'Ordens', Icon: ClipboardList },
  { to: '/painel/admin/relatorios', label: 'Relatórios', Icon: FileText },
  { to: '/painel/admin/usuarios', label: 'Usuários', Icon: UserRound },
  { to: '/painel/admin/configuracoes/negocio', label: 'Configurações', Icon: Settings2 },
];

type BiteplanerMenuMode = 'customer' | 'partner' | 'dentist' | 'lab';

const BITEPLANER_MENU_ROLES = new Set<BiteplanerMenuMode>(['customer', 'partner', 'dentist', 'lab']);
const BITEPLANER_MENU_STATUSES = new Set(['active']);

function isBiteplanerMenuMode(value: string | null): value is BiteplanerMenuMode {
  return value !== null && BITEPLANER_MENU_ROLES.has(value as BiteplanerMenuMode);
}

function canSeeBiteplanerProductMenu(user?: BackendUser | null) {
  return (user?.productRoles ?? []).some((productRole) => (
    productRole.productKey === 'biteplaner' &&
    isBiteplanerMenuMode(productRole.role) &&
    BITEPLANER_MENU_STATUSES.has(productRole.status)
  ));
}

function getActiveBiteplanerMenuMode(user?: BackendUser | null, preferredMode?: string | null): BiteplanerMenuMode | null {
  const requestedMode = preferredMode ?? null;
  const activeRoles = (user?.productRoles ?? []).filter((productRole) => (
    productRole.productKey === 'biteplaner' &&
    isBiteplanerMenuMode(productRole.role) &&
    BITEPLANER_MENU_STATUSES.has(productRole.status)
  ));

  if (
    isBiteplanerMenuMode(requestedMode) &&
    activeRoles.some((productRole) => productRole.role === requestedMode)
  ) {
    return requestedMode;
  }

  return (activeRoles[0]?.role as BiteplanerMenuMode | undefined) ?? null;
}

function hasStartedBiteplanerCustomerOrder(user?: BackendUser | null) {
  return (user?.productRoles ?? []).some((productRole) => {
    if (
      productRole.productKey !== 'biteplaner' ||
      productRole.role !== 'customer' ||
      productRole.status !== 'active'
    ) {
      return false;
    }

    const metadata = productRole.metadata ?? {};
    const hasOrderFlag =
      metadata.orderStarted === true ||
      metadata.hasOrder === true ||
      metadata.orderStartedAt ||
      metadata.orderId ||
      productRole.orderStartedAt ||
      productRole.orderId;

    if (hasOrderFlag) {
      return true;
    }

    return Boolean(productRole.stage && productRole.stage !== 'new_user_onboarding');
  });
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

export function PortalLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, backendUser, session } = useAuth();
  const queryClient = useQueryClient();
  const contentScrollRef = useRef<HTMLDivElement>(null);
  const mobileDrawerRef = useRef<HTMLElement>(null);
  const mobileMenuTriggerRef = useRef<HTMLButtonElement>(null);
  const previousMobileFocusRef = useRef<HTMLElement | null>(null);
  const collapsed = usePortalUiStore((state) => state.sidebarCollapsed);
  const hydrateSidebarCollapsed = usePortalUiStore((state) => state.hydrateSidebarCollapsed);
  const toggleSidebarCollapsed = usePortalUiStore((state) => state.toggleSidebarCollapsed);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<MockNotification | null>(null);
  const [mobileAdminMenuOpen, setMobileAdminMenuOpen] = useState(false);

  const email = backendUser?.email ?? '';
  const displayName = email.split('@')[0];
  const initials = displayName.slice(0, 2).toUpperCase() || 'NX';

  const isBiteplanerActive = location.pathname.startsWith('/painel/biteplaner');
  const requestedBiteplanerMode = new URLSearchParams(location.search).get('mode');
  const biteplanerMode = getActiveBiteplanerMenuMode(backendUser, requestedBiteplanerMode);
  const biteplanerModeQuery = biteplanerMode && biteplanerMode !== 'customer' ? `?mode=${biteplanerMode}` : '';
  const biteplanerHomePath = `/painel/biteplaner${biteplanerModeQuery}`;
  const isPartnerBiteplanerMode = biteplanerMode === 'partner';
  const isDentistBiteplanerMode = biteplanerMode === 'dentist';
  const isLabBiteplanerMode = biteplanerMode === 'lab';
  const isCustomerBiteplanerMode = biteplanerMode === 'customer';
  const isLicensingBiteplanerMode = isDentistBiteplanerMode || isLabBiteplanerMode;
  const showEvaluationsSubmenu = isPartnerBiteplanerMode || isDentistBiteplanerMode || isLabBiteplanerMode;
  const showBiteplanerMvpMenus = import.meta.env.VITE_MOCK === 'true';
  const isAdmin = hasAdministrativeRole(backendUser?.roles);
  const showBiteplanerProductMenu = canSeeBiteplanerProductMenu(backendUser);
  const showCustomerOrderSubmenu = hasStartedBiteplanerCustomerOrder(backendUser);
  const notificationsOwnerId = backendUser?.id ?? session?.user.id ?? 'anonymous';
  const notificationsQueryKey = accountQueryKeys.notifications(notificationsOwnerId);
  const notificationsQuery = useQuery<AccountNotificationsResponse>({
    queryKey: notificationsQueryKey,
    queryFn: () => api.get<AccountNotificationsResponse>('/v1/account/notifications', session!.access_token),
    enabled: Boolean(session),
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    refetchOnWindowFocus: false,
  });
  const notifications = useMemo(
    () =>
      notificationsQuery.data?.notifications
        ? notificationsQuery.data.notifications.map(mapAccountNotification)
        : MOCK_NOTIFICATIONS,
    [notificationsQuery.data?.notifications]
  );
  const hasUnreadNotifications = notifications.some((notification) => !notification.read);
  const markNotificationRead = useMutation({
    mutationFn: (notification: MockNotification) =>
      api.patch<{ notification: AccountNotificationResponse }>(
        `/v1/account/notifications/${notification.id}/read`,
        {},
        session!.access_token
      ),
    onMutate: async (notification) => {
      await queryClient.cancelQueries({ queryKey: notificationsQueryKey });
      queryClient.setQueryData<AccountNotificationsResponse>(notificationsQueryKey, (current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          notifications: current.notifications.map((item) =>
            item.id === notification.id ? { ...item, read: true, readAt: new Date().toISOString() } : item
          ),
        };
      });
      setSelectedNotification((current) =>
        current?.id === notification.id ? { ...current, read: true } : current
      );
    },
    onSuccess: (response) => {
      if (!response.notification) {
        return;
      }

      const updatedNotification = response.notification;
      queryClient.setQueryData<AccountNotificationsResponse>(notificationsQueryKey, (current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          notifications: current.notifications.map((item) =>
            item.id === updatedNotification.id ? updatedNotification : item
          ),
        };
      });
      setSelectedNotification((current) =>
        current?.id === updatedNotification.id ? mapAccountNotification(updatedNotification) : current
      );
    },
  });

  useLayoutEffect(() => {
    hydrateSidebarCollapsed();
  }, [hydrateSidebarCollapsed]);

  useEffect(() => {
    contentScrollRef.current?.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname, location.search]);

  useEffect(() => {
    setMobileAdminMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileAdminMenuOpen) return undefined;

    previousMobileFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    mobileDrawerRef.current
      ?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)
      ?.focus();

    return () => {
      previousMobileFocusRef.current?.focus();
    };
  }, [mobileAdminMenuOpen]);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return undefined;

    const mediaQuery = window.matchMedia(DESKTOP_MEDIA_QUERY);
    const handleChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setMobileAdminMenuOpen(false);
      }
    };

    mediaQuery.addEventListener('change', handleChange);

    if (mediaQuery.matches) {
      setMobileAdminMenuOpen(false);
    }

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  function toggle() {
    toggleSidebarCollapsed();
  }

  function handleNotificationClick(notification: MockNotification) {
    setSelectedNotification(notification);
    setNotificationsOpen(false);

    if (notification.read || !session) {
      return;
    }

    markNotificationRead.mutate(notification);
  }

  function handleMobileDrawerKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === 'Escape') {
      setMobileAdminMenuOpen(false);
      return;
    }

    if (event.key !== 'Tab') return;

    const focusable = Array.from(
      mobileDrawerRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? []
    ).filter((element) => !element.hasAttribute('disabled'));

    if (focusable.length === 0) {
      event.preventDefault();
      mobileDrawerRef.current?.focus();
      return;
    }

    const firstElement = focusable[0];
    const lastElement = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
      return;
    }

    if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }

  return (
    <S.Shell>
      {selectedNotification ? (
        <S.Overlay
          role="dialog"
          aria-modal="true"
          aria-labelledby="notification-detail-title"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedNotification(null);
            }
          }}
        >
          <S.NotificationModalBox>
            <S.ModalTitle id="notification-detail-title">{selectedNotification.title}</S.ModalTitle>
            <S.NotificationModalDate>{selectedNotification.datetime}</S.NotificationModalDate>
            <S.CloseBtn onClick={() => setSelectedNotification(null)} aria-label="Fechar notificação">
              <X size={16} />
            </S.CloseBtn>
            <S.NotificationModalMessage>{selectedNotification.message}</S.NotificationModalMessage>
          </S.NotificationModalBox>
        </S.Overlay>
      ) : null}

      {isAdmin && mobileAdminMenuOpen ? (
        <S.MobileDrawerOverlay
          role="presentation"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setMobileAdminMenuOpen(false);
            }
          }}
        >
          <S.MobileDrawer
            ref={mobileDrawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menu administrativo"
            tabIndex={-1}
            onKeyDown={handleMobileDrawerKeyDown}
          >
            <S.MobileDrawerHeader>
              <S.MobileDrawerTitle>Menu administrativo</S.MobileDrawerTitle>
              <S.MobileMenuBtn
                type="button"
                onClick={() => setMobileAdminMenuOpen(false)}
                aria-label="Fechar menu mobile"
              >
                <X size={18} aria-hidden />
              </S.MobileMenuBtn>
            </S.MobileDrawerHeader>
            <S.MobileDrawerNav>
              {ADMIN_NAV_ITEMS.map(({ to, label, Icon }) => (
                <S.MobileDrawerLink key={to} to={to} onClick={() => setMobileAdminMenuOpen(false)}>
                  <Icon size={17} aria-hidden />
                  {label}
                </S.MobileDrawerLink>
              ))}
            </S.MobileDrawerNav>
          </S.MobileDrawer>
        </S.MobileDrawerOverlay>
      ) : null}

      <S.Sidebar $collapsed={collapsed}>
        <S.SidebarTop $collapsed={collapsed}>
          <S.Logo src={publicOptimizedImages.shared.nexorLogo.webp} alt="Nexor" width={260} height={83} $collapsed={collapsed} />
          <S.ToggleBtn onClick={toggle} aria-label={collapsed ? 'Expandir menu' : 'Colapsar menu'}>
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </S.ToggleBtn>
        </S.SidebarTop>

        <S.NavSection>
          {!isAdmin ? (
            <>
              {NAV_ITEMS.map(({ to, label, Icon }) => (
                <S.StyledNavLink
                  key={to}
                  to={to}
                  $collapsed={collapsed}
                  title={collapsed ? label : undefined}
                >
                  <Icon size={16} />
                  <S.NavLabel $collapsed={collapsed}>{label}</S.NavLabel>
                </S.StyledNavLink>
              ))}

              {showBiteplanerProductMenu ? (
                <>
                  <S.NavSectionDivider />
                  <S.NavSectionLabel $collapsed={collapsed}>Produtos</S.NavSectionLabel>
                  <S.NavButton
                    $collapsed={collapsed}
                    $active={isBiteplanerActive}
                    onClick={() => {
                      void navigate(biteplanerHomePath);
                    }}
                    title={collapsed ? 'Biteplaner' : undefined}
                    style={{ marginTop: 4 }}
                  >
                    <ShieldCheck size={16} />
                    <S.NavLabel $collapsed={collapsed}>Biteplaner</S.NavLabel>
                  </S.NavButton>
                <>
                  <S.SubNavLink
                    to={biteplanerHomePath}
                    end
                    $collapsed={collapsed}
                    title={collapsed ? 'Home' : undefined}
                  >
                    <Home size={13} />
                    Home
                  </S.SubNavLink>
                  {isLicensingBiteplanerMode && showBiteplanerMvpMenus ? (
                    <S.SubNavLink
                      to={`/painel/biteplaner/licenciamento${biteplanerModeQuery}`}
                      $collapsed={collapsed}
                      title={collapsed ? 'Licenciamento' : undefined}
                    >
                      {isLabBiteplanerMode ? <FlaskConical size={13} /> : <Stethoscope size={13} />}
                      <S.SubNavText>Licenciamento</S.SubNavText>
                      <S.MvpBadge>MVP1</S.MvpBadge>
                    </S.SubNavLink>
                  ) : isCustomerBiteplanerMode && showCustomerOrderSubmenu ? (
                    <S.SubNavLink
                      to="/painel/biteplaner/jornada"
                      $collapsed={collapsed}
                      title={collapsed ? 'Ordem' : undefined}
                    >
                      <FileText size={13} />
                      Ordem
                    </S.SubNavLink>
                  ) : null}
                  {isPartnerBiteplanerMode ? (
                    <S.SubNavLink
                      to="/painel/biteplaner/indicar?mode=partner"
                      $collapsed={collapsed}
                      title={collapsed ? 'Indicar' : undefined}
                    >
                      <Link2 size={13} />
                      Indicar
                    </S.SubNavLink>
                  ) : null}
                  {showEvaluationsSubmenu ? (
                    <S.SubNavLink
                      to={`/painel/biteplaner/avaliacoes${biteplanerModeQuery}`}
                      $collapsed={collapsed}
                      title={collapsed ? 'Avaliações' : undefined}
                    >
                      <Star size={13} />
                      Avaliações
                    </S.SubNavLink>
                  ) : null}
                </>
                </>
              ) : null}
            </>
          ) : null}

          {isAdmin ? (
            <>
              {ADMIN_OVERVIEW_NAV_ITEMS.map(({ to, label, Icon }) => (
                <S.StyledNavLink
                  key={to}
                  to={to}
                  $collapsed={collapsed}
                  title={collapsed ? label : undefined}
                >
                  <Icon size={16} />
                  <S.NavLabel $collapsed={collapsed}>{label}</S.NavLabel>
                </S.StyledNavLink>
              ))}
              <S.NavSectionDivider style={{ marginTop: 8 }} />
              <S.NavSectionLabel $collapsed={collapsed}>Biteplaner</S.NavSectionLabel>
              {ADMIN_BITEPLANER_NAV_ITEMS.map(({ to, label, Icon }) => (
                <S.StyledNavLink
                  key={to}
                  to={to}
                  $collapsed={collapsed}
                  title={collapsed ? label : undefined}
                >
                  <Icon size={16} />
                  <S.NavLabel $collapsed={collapsed}>{label}</S.NavLabel>
                </S.StyledNavLink>
              ))}
              <S.NavSectionDivider />
              <S.NavSectionLabel $collapsed={collapsed}>Sistema</S.NavSectionLabel>
              {ADMIN_SYSTEM_NAV_ITEMS.map(({ to, label, Icon }) => (
                <S.StyledNavLink
                  key={to}
                  to={to}
                  $collapsed={collapsed}
                  title={collapsed ? label : undefined}
                >
                  <Icon size={16} />
                  <S.NavLabel $collapsed={collapsed}>{label}</S.NavLabel>
                </S.StyledNavLink>
              ))}
            </>
          ) : null}
        </S.NavSection>

        <S.SidebarFooter>
          {collapsed ? (
            <S.SidebarAvatarCollapsed $collapsed={collapsed} title={displayName}>
              <S.Avatar>{initials}</S.Avatar>
            </S.SidebarAvatarCollapsed>
          ) : (
            <S.SidebarProfileBlock $collapsed={collapsed}>
              <S.Avatar>{initials}</S.Avatar>
              <S.SidebarProfileInfo>
                <S.SidebarProfileName>{displayName}</S.SidebarProfileName>
                {email ? <S.SidebarProfileEmail>{email}</S.SidebarProfileEmail> : null}
              </S.SidebarProfileInfo>
            </S.SidebarProfileBlock>
          )}
          <S.LogoutBtn
            $collapsed={collapsed}
            onClick={() => { void signOut(); void navigate('/entrar'); }}
            title={collapsed ? 'Sair' : undefined}
          >
            <LogOut size={16} />
            <S.NavLabel $collapsed={collapsed}>Sair</S.NavLabel>
          </S.LogoutBtn>
        </S.SidebarFooter>
      </S.Sidebar>

      <S.ContentArea>
        <S.Topbar>
          {isAdmin ? (
            <S.MobileMenuBtn
              ref={mobileMenuTriggerRef}
              type="button"
              onClick={() => setMobileAdminMenuOpen(true)}
              aria-label="Abrir menu mobile"
            >
              <Menu size={18} aria-hidden />
            </S.MobileMenuBtn>
          ) : null}
          <S.TopbarGreeting>{getGreeting()}, {displayName}.</S.TopbarGreeting>
          <S.TopbarRight>
            <S.NotificationArea>
              <S.NotifBtn
                aria-label="Notificações"
                aria-expanded={notificationsOpen}
                data-has-unread={hasUnreadNotifications ? 'true' : 'false'}
                $hasUnread={hasUnreadNotifications}
                onClick={() => setNotificationsOpen((current) => !current)}
              >
                <Bell size={16} />
              </S.NotifBtn>
              {notificationsOpen ? (
                <S.NotificationsPanel role="dialog" aria-label="Notificações">
                  <S.NotificationsPanelHeader>
                    <S.NotificationsPanelTitle>Notificações</S.NotificationsPanelTitle>
                    <S.NotificationsPanelMeta>{notifications.length} itens</S.NotificationsPanelMeta>
                  </S.NotificationsPanelHeader>
                  <S.NotificationsList>
                    {notifications.length === 0 ? (
                      <S.NotificationsEmpty>Nenhuma notificação encontrada.</S.NotificationsEmpty>
                    ) : (
                      notifications.map((notification) => (
                        <S.NotificationItem
                          key={notification.id}
                          type="button"
                          $unread={!notification.read}
                          aria-label={`Abrir notificação ${notification.title}`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <S.NotificationItemHeader>
                            <S.NotificationTitle>{notification.title}</S.NotificationTitle>
                            <S.NotificationStatus $unread={!notification.read}>
                              {notification.read ? 'Lida' : 'Não lida'}
                            </S.NotificationStatus>
                          </S.NotificationItemHeader>
                          <S.NotificationDate>{notification.datetime}</S.NotificationDate>
                          <S.NotificationPreview>{notification.message}</S.NotificationPreview>
                        </S.NotificationItem>
                      ))
                    )}
                  </S.NotificationsList>
                </S.NotificationsPanel>
              ) : null}
            </S.NotificationArea>
          </S.TopbarRight>
        </S.Topbar>

        <S.ContentScroll ref={contentScrollRef} data-testid="portal-content-scroll">
          <S.ContentInner
            data-testid="portal-content-inner"
            key="portal-content"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            {children}
          </S.ContentInner>
        </S.ContentScroll>
        {isAdmin ? (
          <S.MobileBottomNav aria-label="Navegação principal mobile">
            {ADMIN_MOBILE_PRIMARY_NAV_ITEMS.map(({ to, label, Icon }) => (
              <S.MobileBottomNavLink key={to} to={to}>
                <Icon size={18} aria-hidden />
                <span>{label}</span>
              </S.MobileBottomNavLink>
            ))}
          </S.MobileBottomNav>
        ) : null}
      </S.ContentArea>
    </S.Shell>
  );
}
