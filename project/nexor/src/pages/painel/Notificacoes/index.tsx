import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCircle2, Circle, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { api } from '../../../lib/api';
import { accountQueryKeys } from '../../../features/demo/biteplanerQueryKeys';
import { getNotificationAction } from '../../../features/account/notificationActions';
import * as S from './styles';

interface AccountNotificationResponse {
  id: string;
  title: string;
  message: string;
  type?: string | null;
  read: boolean;
  readAt?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

interface AccountNotificationsResponse {
  notifications: AccountNotificationResponse[];
  unreadCount: number;
}

const PAGE_SIZE = 10;

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
    minute: '2-digit',
  }).format(date);
}

export function Notificacoes() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { backendUser, session } = useAuth();
  const [page, setPage] = useState(1);
  const [selectedNotification, setSelectedNotification] = useState<AccountNotificationResponse | null>(null);
  const ownerId = backendUser?.id ?? session?.user.id ?? 'anonymous';
  const notificationsQueryKey = [...accountQueryKeys.notifications(ownerId), 'all', 100] as const;

  const notificationsQuery = useQuery<AccountNotificationsResponse>({
    queryKey: notificationsQueryKey,
    queryFn: () =>
      api.get<AccountNotificationsResponse>(
        '/v1/account/notifications?status=all&limit=100',
        session!.access_token
      ),
    enabled: Boolean(session),
    staleTime: 60_000,
  });

  const markNotificationReadMutation = useMutation({
    mutationFn: (notificationId: string) =>
      api.patch<{ notification: AccountNotificationResponse }>(
        `/v1/account/notifications/${notificationId}/read`,
        {},
        session!.access_token
      ),
    onSuccess: (_response, notificationId) => {
      const readAt = new Date().toISOString();

      queryClient.setQueryData<AccountNotificationsResponse>(notificationsQueryKey, (current) => {
        if (!current) {
          return current;
        }

        let changed = false;
        const notifications = current.notifications.map((notification) => {
          if (notification.id !== notificationId || notification.read) {
            return notification;
          }

          changed = true;
          return {
            ...notification,
            read: true,
            readAt: notification.readAt ?? readAt,
          };
        });

        return {
          ...current,
          notifications,
          unreadCount: changed ? Math.max(0, current.unreadCount - 1) : current.unreadCount,
        };
      });

      setSelectedNotification((current) =>
        current?.id === notificationId
          ? { ...current, read: true, readAt: current.readAt ?? readAt }
          : current
      );
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () =>
      api.patch<{ notifications?: AccountNotificationResponse[] }>(
        '/v1/account/notifications/read-all',
        {},
        session!.access_token
      ),
    onSuccess: () => {
      const readAt = new Date().toISOString();

      queryClient.setQueryData<AccountNotificationsResponse>(notificationsQueryKey, (current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          notifications: current.notifications.map((notification) => ({
            ...notification,
            read: true,
            readAt: notification.readAt ?? readAt,
          })),
          unreadCount: 0,
        };
      });

      setSelectedNotification((current) =>
        current ? { ...current, read: true, readAt: current.readAt ?? readAt } : current
      );
    },
  });

  function openNotification(notification: AccountNotificationResponse) {
    setSelectedNotification(notification);

    if (!notification.read && session) {
      markNotificationReadMutation.mutate(notification.id);
    }
  }

  const notifications = notificationsQuery.data?.notifications ?? [];
  const unreadCount = notificationsQuery.data?.unreadCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(notifications.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageNotifications = useMemo(
    () => notifications.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [currentPage, notifications]
  );

  return (
    <S.Page>
      <S.Header>
        <S.TitleGroup>
          <S.PageTitle>Notificações</S.PageTitle>
          <S.PageDescription>
            Acompanhe todas as notificações da sua conta em ordem cronológica.
          </S.PageDescription>
        </S.TitleGroup>
        <S.HeaderActions>
          <S.MarkAllReadButton
            type="button"
            disabled={unreadCount === 0 || markAllReadMutation.isPending || notificationsQuery.isLoading}
            onClick={() => {
              markAllReadMutation.mutate();
            }}
          >
            Marcar todas como lida
          </S.MarkAllReadButton>
          <S.UnreadSummary>
            <Bell size={16} aria-hidden />
            {unreadCount} não lida{unreadCount === 1 ? '' : 's'}
          </S.UnreadSummary>
        </S.HeaderActions>
      </S.Header>

      <S.ListPanel>
        {notificationsQuery.isLoading ? (
          <S.StateMessage>Carregando notificações...</S.StateMessage>
        ) : notificationsQuery.isError ? (
          <S.StateMessage>Não foi possível carregar suas notificações agora.</S.StateMessage>
        ) : pageNotifications.length === 0 ? (
          <S.StateMessage>Nenhuma notificação encontrada.</S.StateMessage>
        ) : (
          <S.NotificationList aria-label="Lista de notificações">
            {pageNotifications.map((notification) => {
              const notificationAction = getNotificationAction(notification);

              return (
                <S.NotificationItem
                  key={notification.id}
                  $unread={!notification.read}
                  role="button"
                  tabIndex={0}
                  aria-label={`Abrir notificação ${notification.title}`}
                  onClick={() => openNotification(notification)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      openNotification(notification);
                    }
                  }}
                >
                  <S.NotificationIcon $unread={!notification.read}>
                    {notification.read ? <CheckCircle2 size={18} aria-hidden /> : <Circle size={18} aria-hidden />}
                  </S.NotificationIcon>
                  <S.NotificationBody>
                    <S.NotificationRow>
                      <S.NotificationTitle>{notification.title}</S.NotificationTitle>
                      <S.NotificationStatus $unread={!notification.read}>
                        {notification.read ? 'Lida' : 'Não lida'}
                      </S.NotificationStatus>
                    </S.NotificationRow>
                    <S.NotificationMessage>{notification.message}</S.NotificationMessage>
                    <S.NotificationDate>{formatNotificationDate(notification.createdAt)}</S.NotificationDate>
                    {notificationAction ? (
                      <S.NotificationActionButton
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          void navigate(notificationAction.path);
                        }}
                      >
                        {notificationAction.label}
                      </S.NotificationActionButton>
                    ) : null}
                  </S.NotificationBody>
                </S.NotificationItem>
              );
            })}
          </S.NotificationList>
        )}
      </S.ListPanel>

      {selectedNotification ? (
        <S.ModalBackdrop>
          <S.NotificationModal role="dialog" aria-modal="true" aria-label={selectedNotification.title}>
            <S.ModalHeader>
              <S.ModalTitle>{selectedNotification.title}</S.ModalTitle>
              <S.ModalCloseButton
                type="button"
                aria-label="Fechar notificação"
                title="Fechar"
                onClick={() => setSelectedNotification(null)}
              >
                <X size={18} aria-hidden />
              </S.ModalCloseButton>
            </S.ModalHeader>
            <S.ModalDate>{formatNotificationDate(selectedNotification.createdAt)}</S.ModalDate>
            <S.ModalMessage>{selectedNotification.message}</S.ModalMessage>
          </S.NotificationModal>
        </S.ModalBackdrop>
      ) : null}

      <S.Pagination aria-label="Paginação de notificações">
        <S.PageButton
          type="button"
          aria-label="Página anterior"
          disabled={currentPage === 1}
          onClick={() => setPage((current) => Math.max(1, current - 1))}
        >
          <ChevronLeft size={16} aria-hidden />
        </S.PageButton>
        <S.PageIndicator>
          página {currentPage} de {totalPages}
        </S.PageIndicator>
        <S.PageButton
          type="button"
          aria-label="Próxima página"
          disabled={currentPage === totalPages}
          onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
        >
          <ChevronRight size={16} aria-hidden />
        </S.PageButton>
      </S.Pagination>
    </S.Page>
  );
}
