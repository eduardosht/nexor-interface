import { useState, useEffect, useRef, type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, LogOut, Bell, ChevronLeft, ChevronRight, User, ShieldCheck, FlaskConical, Stethoscope, Handshake, X, Boxes, BriefcaseBusiness, ClipboardList, Settings2, UserRound, Home, FileText, Star, Link2 } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { api } from '../../../lib/api';
import logoNexor from '../../../assets/logo-nexor.png';
import * as S from './styles';

const STORAGE_KEY = 'nexor-sidebar-collapsed';

/* ─── Access Mode Modal ─── */

type AccessMode = 'user' | 'partner' | 'dentist' | 'lab' | 'admin';

interface AccessOption {
  key: AccessMode;
  label: string;
  description: string;
  allowed: boolean;
  reason: string | null;
  status?: 'available' | 'missing' | 'pending' | 'active' | 'rejected' | 'suspended';
}

interface AccessResponse {
  modes: AccessOption[];
}

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


















const MODE_ICONS: Record<AccessMode, typeof User> = {
  user: User,
  dentist: Stethoscope,
  partner: Handshake,
  lab: FlaskConical,
  admin: Boxes,
};

interface AccessModeModalProps {
  onClose: () => void;
  onConfirm: (mode: AccessMode) => void;
}

function AccessModeModal({ onClose, onConfirm }: AccessModeModalProps) {
  const { session } = useAuth();
  const [options, setOptions] = useState<AccessOption[]>([]);
  const [selected, setSelected] = useState<AccessMode | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!session) return;
    let active = true;
    api.get<AccessResponse>('/v1/products/biteplaner/access-options', session.access_token)
      .then((res) => {
        if (!active) return;
        const modes = Array.isArray(res.modes) ? res.modes : [];
        setOptions(modes);
        const defaultAllowed = modes.find((m) => m.allowed && m.key === 'user') ?? modes.find((m) => m.allowed);
        if (defaultAllowed) setSelected(defaultAllowed.key);
      })
      .catch(() => {
        if (!active) return;
        setOptions([
          { key: 'user', label: 'Continuar como Usuário', description: 'Acesse sua jornada pessoal do Biteplaner, acompanhe o status do seu produto, gerencie consultas e acesse suporte.', allowed: true, reason: null },
          { key: 'dentist', label: 'Dentista', description: 'Portal para dentistas em licenciamento ou ja licenciados. Acompanhe o onboarding e opere pacientes quando liberado.', allowed: false, reason: null },
          { key: 'partner', label: 'Parceiro Licenciado', description: 'Área para parceiros comerciais da Nexor. Gerencie indicações, acompanhe comissões e acesse materiais de divulgação.', allowed: false, reason: null },
          { key: 'lab', label: 'Laboratório', description: 'Sistema de gestão de produção e licenciamento laboratorial. Receba moldagens, gerencie fabricacao, controle de qualidade e rastreamento de envios.', allowed: false, reason: null },
        ]);
        setSelected('user');
      });
    return () => { active = false; };
  }, [session]);

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === overlayRef.current) onClose();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') onClose();
  }

  return (
    <S.Overlay ref={overlayRef} onClick={handleOverlayClick} onKeyDown={handleKeyDown} role="dialog" aria-modal="true" aria-label="Selecionar acesso ao Biteplaner">
      <S.ModalBox>
        <S.ModalTitle>Como deseja acessar?</S.ModalTitle>
        <S.ModalSubtitle>Selecione o tipo de acesso ao Biteplaner</S.ModalSubtitle>
        <S.CloseBtn onClick={onClose} aria-label="Fechar"><X size={16} /></S.CloseBtn>

        <S.AccessCardsGrid>
          {options.map((opt) => {
            const Icon = MODE_ICONS[opt.key];
            const isSelected = selected === opt.key;
            return (
              <S.AccessCard
                key={opt.key}
                $selected={isSelected}
                $allowed={opt.allowed}
                onClick={() => { if (opt.allowed) setSelected(opt.key); }}
                aria-pressed={isSelected}
                aria-disabled={!opt.allowed}
              >
                <S.AccessCardRadio $selected={isSelected} />
                {!opt.allowed ? (
                  <S.AccessCardBadge>
                    {opt.status === 'pending' ? 'Em análise' : 'Sem acesso'}
                  </S.AccessCardBadge>
                ) : null}
                <S.AccessCardIconWrap $selected={isSelected} $allowed={opt.allowed}>
                  <Icon size={20} />
                </S.AccessCardIconWrap>
                <S.AccessCardTitle $allowed={opt.allowed}>{opt.label}</S.AccessCardTitle>
                <S.AccessCardDesc $allowed={opt.allowed}>{opt.description}</S.AccessCardDesc>
                {!opt.allowed && opt.reason ? (
                  <S.AccessCardDesc $allowed={opt.allowed}>{opt.reason}</S.AccessCardDesc>
                ) : null}
              </S.AccessCard>
            );
          })}
        </S.AccessCardsGrid>

        <S.ModalNote>
          <strong>Nota:</strong> Para acessar como Dentista, Parceiro ou Laboratório Licenciado, é necessário ter credenciais específicas fornecidas pela Nexor. Entre em contato conosco para solicitar acesso.
        </S.ModalNote>

        <S.ModalActions>
          <S.ModalBtnSecondary onClick={onClose}>Cancelar</S.ModalBtnSecondary>
          <S.ModalBtnPrimary disabled={selected === null} onClick={() => { if (selected) onConfirm(selected); }}>
            Continuar
          </S.ModalBtnPrimary>
        </S.ModalActions>
      </S.ModalBox>
    </S.Overlay>
  );
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
  { to: '/painel/admin/parceiros', label: 'Parceiros', Icon: Handshake },
  { to: '/painel/admin/dentistas', label: 'Dentistas', Icon: Stethoscope },
  { to: '/painel/admin/laboratorios', label: 'Laboratórios', Icon: FlaskConical },
  { to: '/painel/admin/usuarios', label: 'Usuários', Icon: UserRound },
  { to: '/painel/admin/configuracoes/negocio', label: 'Config. Negócio', Icon: BriefcaseBusiness },
  { to: '/painel/admin/configuracoes/sistema', label: 'Config. Sistema', Icon: Settings2 },
];

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
  const contentScrollRef = useRef<HTMLDivElement>(null);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(STORAGE_KEY) === 'true');
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [notifications, setNotifications] = useState<MockNotification[]>(MOCK_NOTIFICATIONS);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<MockNotification | null>(null);

  const email = backendUser?.email ?? '';
  const displayName = email.split('@')[0];
  const initials = displayName.slice(0, 2).toUpperCase() || 'NX';

  const isBiteplanerActive = location.pathname.startsWith('/painel/biteplaner');
  const biteplanerMode = new URLSearchParams(location.search).get('mode');
  const isPartnerBiteplanerMode = biteplanerMode === 'partner';
  const isDentistBiteplanerMode = biteplanerMode === 'dentist';
  const isLabBiteplanerMode = biteplanerMode === 'lab';
  const isLicensingBiteplanerMode = isDentistBiteplanerMode || isLabBiteplanerMode;
  const showEvaluationsSubmenu = biteplanerMode === 'partner' || biteplanerMode === 'dentist' || biteplanerMode === 'lab';
  const showBiteplanerMvpMenus = import.meta.env.VITE_MOCK === 'true';
  const isAdmin = backendUser?.roles.includes('admin') ?? false;
  const hasUnreadNotifications = notifications.some((notification) => !notification.read);

  useEffect(() => {
    if (!session) return;

    let active = true;

    Promise.resolve(api.get<AccountNotificationsResponse>('/v1/account/notifications', session.access_token))
      .then((response) => {
        if (!active || !Array.isArray(response?.notifications)) return;
        setNotifications(response.notifications.map(mapAccountNotification));
      })
      .catch(() => {
        if (!active) return;
        setNotifications(MOCK_NOTIFICATIONS);
      });

    return () => {
      active = false;
    };
  }, [session]);

  useEffect(() => {
    contentScrollRef.current?.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname, location.search]);

  function toggle() {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem(STORAGE_KEY, String(next));
  }

  function handleAccessConfirm(mode: AccessMode) {
    setShowAccessModal(false);
    if (mode === 'admin') {
      void navigate('/painel/admin/ordens');
      return;
    }

    void navigate(`/painel/biteplaner?mode=${mode}`);
  }

  function handleNotificationClick(notification: MockNotification) {
    setSelectedNotification(notification);
    setNotificationsOpen(false);

    if (notification.read || !session) {
      return;
    }

    void api.patch<{ notification: AccountNotificationResponse }>(
      `/v1/account/notifications/${notification.id}/read`,
      {},
      session.access_token
    )
      .then((response) => {
        const updatedNotification = response.notification
          ? mapAccountNotification(response.notification)
          : { ...notification, read: true };

        setNotifications((current) =>
          current.map((item) => (item.id === notification.id ? updatedNotification : item))
        );
        setSelectedNotification((current) =>
          current?.id === notification.id ? { ...current, read: true } : current
        );
      })
      .catch(() => {
        setNotifications((current) =>
          current.map((item) => (item.id === notification.id ? { ...item, read: true } : item))
        );
      });
  }

  return (
    <S.Shell>
      {showAccessModal && (
        <AccessModeModal
          onClose={() => setShowAccessModal(false)}
          onConfirm={handleAccessConfirm}
        />
      )}
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

      <S.Sidebar $collapsed={collapsed}>
        <S.SidebarTop $collapsed={collapsed}>
          <S.Logo src={logoNexor} alt="Nexor" $collapsed={collapsed} />
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

              <S.NavSectionDivider />
              <S.NavSectionLabel $collapsed={collapsed}>Produtos</S.NavSectionLabel>
              <S.NavButton
                $collapsed={collapsed}
                $active={isBiteplanerActive}
                onClick={() => {
                  setShowAccessModal(true);
                }}
                title={collapsed ? 'Biteplaner' : undefined}
                style={{ marginTop: 4 }}
              >
                <ShieldCheck size={16} />
                <S.NavLabel $collapsed={collapsed}>Biteplaner</S.NavLabel>
              </S.NavButton>
              {isBiteplanerActive && (
                <>
                  <S.SubNavLink
                    to={
                      isPartnerBiteplanerMode || isDentistBiteplanerMode || isLabBiteplanerMode
                        ? `/painel/biteplaner?mode=${biteplanerMode}`
                        : '/painel/biteplaner'
                    }
                    end
                    $collapsed={collapsed}
                    title={collapsed ? 'Home' : undefined}
                  >
                    <Home size={13} />
                    Home
                  </S.SubNavLink>
                  {isLicensingBiteplanerMode && showBiteplanerMvpMenus ? (
                    <S.SubNavLink
                      to={`/painel/biteplaner/licenciamento?mode=${biteplanerMode}`}
                      $collapsed={collapsed}
                      title={collapsed ? 'Licenciamento' : undefined}
                    >
                      {isLabBiteplanerMode ? <FlaskConical size={13} /> : <Stethoscope size={13} />}
                      <S.SubNavText>Licenciamento</S.SubNavText>
                      <S.MvpBadge>MVP1</S.MvpBadge>
                    </S.SubNavLink>
                  ) : !isPartnerBiteplanerMode && !isDentistBiteplanerMode ? (
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
                      to={`/painel/biteplaner/avaliacoes?mode=${biteplanerMode}`}
                      $collapsed={collapsed}
                      title={collapsed ? 'Avaliações' : undefined}
                    >
                      <Star size={13} />
                      Avaliações
                    </S.SubNavLink>
                  ) : null}
                </>
              )}
            </>
          ) : null}

          {isAdmin ? (
            <>
              <S.NavSectionDivider style={{ marginTop: 8 }} />
              <S.NavSectionLabel $collapsed={collapsed}>Biteplaner</S.NavSectionLabel>
              {ADMIN_NAV_ITEMS.map(({ to, label, Icon }) => (
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
            onClick={() => { void signOut(); void navigate('/'); }}
            title={collapsed ? 'Sair' : undefined}
          >
            <LogOut size={16} />
            <S.NavLabel $collapsed={collapsed}>Sair</S.NavLabel>
          </S.LogoutBtn>
        </S.SidebarFooter>
      </S.Sidebar>

      <S.ContentArea>
        <S.Topbar>
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
                    {notifications.map((notification) => (
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
                    ))}
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
      </S.ContentArea>
    </S.Shell>
  );
}
