import { AdminFormButton, Field } from '@nexor/design-system';
import { ChevronLeft, ChevronRight, Send } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SkeletonTable } from '../../../components/Skeleton';
import { useAuth } from '../../../hooks/useAuth';
import { api } from '../../../lib/api';
import * as S from './AdminOrders.styles';
import {
  FilterBar,
  PageHeader,
  PageStack,
  PageSubtitle,
  PageTitle,
  TableSection,
} from './styles';

type CommerceOrder = {
  id: string;
  buyerName: string;
  buyerEmail: string;
  status: string;
  paymentStatus: string;
  shipmentStatus: string | null;
  quantity: number;
  model: string;
  color: string;
  totalFormatted: string;
  createdAt: string;
  canStartExternalProduction: boolean;
};

type OrdersResponse = {
  orders: CommerceOrder[];
  pagination?: {
    page: number;
    pageSize: number;
    hasNextPage: boolean;
  };
};

type ExternalProductionEmailResponse = {
  email: {
    to: string;
    subject: string;
    body: string;
    attachments: Array<{
      id: string;
      fileName: string;
      technicalFileName: string;
      mimeType: string;
      sizeBytes: number;
      downloadUrl: string | null;
      expiresAt: string | null;
    }>;
  };
};

type StatusTone = 'success' | 'warning' | 'danger' | 'neutral';

const PAGE_SIZE = 25;

const STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'awaiting_payment', label: 'Aguardando pagamento' },
  { value: 'paid', label: 'Pago' },
  { value: 'ready_for_production', label: 'Pronto para produção' },
  { value: 'correction_requested', label: 'Correção solicitada' },
  { value: 'in_production', label: 'Em produção' },
  { value: 'shipped', label: 'Enviado' },
  { value: 'completed', label: 'Concluído' },
  { value: 'cancelled', label: 'Cancelado' },
  { value: 'refunded', label: 'Reembolsado' },
];

const statusLabels: Record<string, string> = {
  draft: 'Rascunho',
  awaiting_payment: 'Aguardando pagamento',
  payment_failed: 'Pagamento falhou',
  paid: 'Pago',
  technical_review: 'Revisão técnica',
  correction_requested: 'Correção solicitada',
  ready_for_production: 'Pronto para produção',
  in_production: 'Em produção',
  shipped: 'Enviado',
  delivered: 'Entregue',
  completed: 'Concluído',
  refunded: 'Reembolsado',
  cancelled: 'Cancelado',
};

const paymentStatusLabels: Record<string, string> = {
  pending: 'Pendente',
  awaiting_payment: 'Aguardando pagamento',
  not_created: 'Não iniciado',
  paid: 'Pago',
  confirmed: 'Confirmado',
  received: 'Recebido',
  overdue: 'Vencido',
  refunded: 'Reembolsado',
  cancelled: 'Cancelado',
  failed: 'Falhou',
  payment_failed: 'Pagamento falhou',
};

function formatDate(value: string) {
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

function getStatusTone(status: string): StatusTone {
  if (['paid', 'ready_for_production', 'completed', 'delivered'].includes(status)) return 'success';
  if (['awaiting_payment', 'technical_review', 'correction_requested', 'in_production', 'shipped', 'pending'].includes(status)) return 'warning';
  if (['payment_failed', 'cancelled', 'failed', 'refunded'].includes(status)) return 'danger';
  return 'neutral';
}

function getPaymentStatusLabel(status: string) {
  return paymentStatusLabels[status] ?? statusLabels[status] ?? status;
}

function buildMailtoUrl(email: ExternalProductionEmailResponse['email']) {
  const params = new URLSearchParams({
    subject: email.subject,
    body: email.body,
  });

  return `mailto:${email.to ?? ''}?${params.toString()}`;
}

export function AdminOrders() {
  const { session } = useAuth();
  const token = session?.access_token;
  const [orders, setOrders] = useState<CommerceOrder[]>([]);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [composingOrderId, setComposingOrderId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const requestSequence = useRef(0);

  const loadOrders = useCallback(async () => {
    const requestId = ++requestSequence.current;

    if (!token) {
      setOrders([]);
      setHasNextPage(false);
      setLoading(false);
      setError('');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      params.set('limit', String(PAGE_SIZE));
      params.set('page', String(page));
      const response = await api.get<OrdersResponse>(`/v1/admin/commerce/biteplaner/orders?${params.toString()}`, token);

      if (requestSequence.current === requestId) {
        setOrders(response.orders);
        setHasNextPage(Boolean(response.pagination?.hasNextPage));
      }
    } catch {
      if (requestSequence.current !== requestId) return;

      setError('Não foi possível carregar os pedidos Biteplaner.');
      setOrders([]);
      setHasNextPage(false);
    } finally {
      if (requestSequence.current === requestId) {
        setLoading(false);
      }
    }
  }, [page, status, token]);

  useEffect(() => {
    void loadOrders();
    return () => {
      requestSequence.current += 1;
    };
  }, [loadOrders]);

  const filteredOrders = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return orders;

    return orders.filter((order) =>
      `${order.id} ${order.buyerName} ${order.buyerEmail} ${order.model} ${order.color}`
        .toLowerCase()
        .includes(term)
    );
  }, [orders, search]);

  async function composeExternalProductionEmail(orderId: string) {
    if (!token || composingOrderId) {
      return;
    }

    setComposingOrderId(orderId);
    setError('');

    try {
      const response = await api.post<ExternalProductionEmailResponse>(
        `/v1/admin/commerce/biteplaner/orders/${orderId}/compose-external-production-email`,
        {},
        token
      );
      const openedWindow = window.open(buildMailtoUrl(response.email), '_blank', 'noopener,noreferrer');

      if (openedWindow === null) {
        window.location.href = buildMailtoUrl(response.email);
      }
    } catch {
      setError('Não foi possível criar o e-mail para produção externa.');
    } finally {
      setComposingOrderId(null);
    }
  }

  function handleStatusChange(value: string) {
    setStatus(value);
    setPage(1);
  }

  return (
    <PageStack>
      <PageHeader>
        <PageTitle>Ordens Biteplaner</PageTitle>
        <PageSubtitle>
          Pedidos commerce feitos por dentistas licenciados. Use esta fila para acompanhar pagamento e preparar o contato externo de produção conduzido pela Nexor.
        </PageSubtitle>
      </PageHeader>

      {error ? <p role="alert">{error}</p> : null}

      <TableSection padding="lg">
        <FilterBar>
          <Field
            as="input"
            label="Buscar"
            placeholder="Buscar por pedido, dentista, e-mail, modelo ou cor"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <S.SelectField>
            <span>Status</span>
            <select value={status} onChange={(event) => handleStatusChange(event.target.value)}>
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value || 'all'} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </S.SelectField>
        </FilterBar>

        {loading ? (
          <SkeletonTable rows={6} columns={7} />
        ) : (
          <>
            <S.TableScroller>
              <S.OrdersTable>
                <thead>
                  <tr>
                    <th>Pedido</th>
                    <th>Dentista</th>
                    <th>Status</th>
                    <th>Pagamento</th>
                    <th>Produto</th>
                    <th>Criado em</th>
                    <th>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id}>
                      <td>{order.id.slice(0, 8)}</td>
                      <td>
                        <strong>{order.buyerName}</strong>
                        <span>{order.buyerEmail || 'E-mail não informado'}</span>
                      </td>
                      <td>
                        <S.StatusInline $tone={getStatusTone(order.status)}>
                          <S.StatusDot aria-hidden />
                          <S.StatusText>{statusLabels[order.status] ?? order.status}</S.StatusText>
                        </S.StatusInline>
                      </td>
                      <td>{getPaymentStatusLabel(order.paymentStatus)}</td>
                      <td>
                        {order.quantity}x Biteplaner
                        <span>{[order.model, order.color].filter(Boolean).join(' / ') || 'Configuração não informada'}</span>
                      </td>
                      <td>{formatDate(order.createdAt)}</td>
                      <td>
                        <S.IconActionButton
                          type="button"
                          disabled={!order.canStartExternalProduction || composingOrderId === order.id}
                          aria-label={`Criar e-mail de produção externa para pedido ${order.id.slice(0, 8)}`}
                          title="Criar e-mail para produção externa"
                          onClick={() => void composeExternalProductionEmail(order.id)}
                        >
                          <Send size={16} aria-hidden />
                        </S.IconActionButton>
                      </td>
                    </tr>
                  ))}
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7}>Nenhum pedido encontrado.</td>
                    </tr>
                  ) : null}
                </tbody>
              </S.OrdersTable>
            </S.TableScroller>

            <S.PaginationBar>
              <AdminFormButton
                type="button"
                variant="secondary"
                disabled={page === 1 || loading}
                leadingIcon={<ChevronLeft size={16} aria-hidden />}
                onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
              >
                Anterior
              </AdminFormButton>
              <S.PageIndicator>Página {page}</S.PageIndicator>
              <AdminFormButton
                type="button"
                variant="secondary"
                disabled={!hasNextPage || loading}
                trailingIcon={<ChevronRight size={16} aria-hidden />}
                onClick={() => setPage((currentPage) => currentPage + 1)}
              >
                Próxima
              </AdminFormButton>
            </S.PaginationBar>
          </>
        )}
      </TableSection>
    </PageStack>
  );
}
