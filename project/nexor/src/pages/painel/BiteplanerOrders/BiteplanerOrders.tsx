import { AdminDataTable, AdminFormButton, AdminStatusPill, type AdminDataTableColumn } from '@nexor/design-system';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { SkeletonTable } from '../../../components/Skeleton';
import { fetchBiteplanerDentistOrders } from '../../../features/commerce/biteplanerDentistOrders.api';
import type { BiteplanerDentistOrderSummary } from '../../../features/commerce/biteplanerDentistOrders.types';
import {
  COMMERCE_BACKEND_ORDER_STATUS_OPTIONS,
  getCommerceBackendOrderStatusColor,
  getCommerceBackendOrderStatusLabel,
} from '../../../features/commerce/commerceOrderStatus.presenter';
import { useAuth } from '../../../hooks/useAuth';
import * as S from './styles';

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function formatDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getInitialOrdersDateRange() {
  const dateTo = new Date();
  const dateFrom = new Date(dateTo);
  dateFrom.setDate(dateFrom.getDate() - 30);

  return {
    dateFrom: formatDateInputValue(dateFrom),
    dateTo: formatDateInputValue(dateTo),
  };
}

export function BiteplanerOrders() {
  const { session } = useAuth();
  const token = session?.access_token;
  const [searchParams] = useSearchParams();
  const checkoutResult = searchParams.get('checkout');
  const returnedOrderId = searchParams.get('orderId');
  const initialDateRange = useRef(getInitialOrdersDateRange()).current;
  const [orders, setOrders] = useState<BiteplanerDentistOrderSummary[]>([]);
  const [status, setStatus] = useState('');
  const [dateFrom, setDateFrom] = useState(initialDateRange.dateFrom);
  const [dateTo, setDateTo] = useState(initialDateRange.dateTo);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const requestSequence = useRef(0);

  const loadOrders = useCallback(async () => {
    const requestId = ++requestSequence.current;

    if (!token) {
      setOrders([]);
      setLoading(false);
      setError('');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetchBiteplanerDentistOrders(token, {
        status: status || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        limit: 100,
      });
      if (requestSequence.current === requestId) {
        setOrders(response.orders);
      }
    } catch {
      if (requestSequence.current !== requestId) return;

      setError('Não foi possível carregar suas ordens Biteplaner.');
      setOrders([]);
    } finally {
      if (requestSequence.current === requestId) {
        setLoading(false);
      }
    }
  }, [dateFrom, dateTo, status, token]);

  useEffect(() => {
    void loadOrders();
    return () => {
      requestSequence.current += 1;
    };
  }, [loadOrders]);

  const filteredOrders = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return orders;

    return orders.filter((order) => (
      `${order.id} ${order.productName} ${order.model} ${order.color} ${order.status} ${order.paymentStatus}`
        .toLowerCase()
        .includes(term)
    ));
  }, [orders, search]);

  const filterActions = (
    <S.FilterActions>
      <S.FilterField>
        Status
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          {COMMERCE_BACKEND_ORDER_STATUS_OPTIONS.map((option) => (
            <option key={option.value || 'all'} value={option.value}>{option.label}</option>
          ))}
        </select>
      </S.FilterField>
      <S.FilterField>
        De
        <input
          type="date"
          value={dateFrom}
          onChange={(event) => setDateFrom(event.target.value)}
        />
      </S.FilterField>
      <S.FilterField>
        Até
        <input
          type="date"
          value={dateTo}
          onChange={(event) => setDateTo(event.target.value)}
        />
      </S.FilterField>
    </S.FilterActions>
  );

  const columns = useMemo<AdminDataTableColumn<BiteplanerDentistOrderSummary>[]>(
    () => [
      {
        key: 'order',
        label: 'Pedido',
        width: '12%',
        sortValue: (order) => order.id,
        render: (order) => <S.MonoValue>{order.id.slice(0, 7)}</S.MonoValue>,
      },
      {
        key: 'status',
        label: 'Status',
        width: '18%',
        sortValue: (order) => getCommerceBackendOrderStatusLabel(order.status),
        render: (order) => (
          <AdminStatusPill
            color={getCommerceBackendOrderStatusColor(order.status)}
            label={getCommerceBackendOrderStatusLabel(order.status)}
          />
        ),
      },
      {
        key: 'payment',
        label: 'Pagamento',
        width: '16%',
        sortValue: (order) => getCommerceBackendOrderStatusLabel(order.paymentStatus),
        render: (order) => getCommerceBackendOrderStatusLabel(order.paymentStatus),
      },
      {
        key: 'product',
        label: 'Produto',
        width: '24%',
        sortValue: (order) => `${order.productName} ${order.model} ${order.color}`,
        render: (order) => (
          <S.CellStack>
            <strong>{order.quantity}x {order.productName}</strong>
            <span>{[order.model, order.color].filter(Boolean).join(' / ') || 'Configuração não informada'}</span>
          </S.CellStack>
        ),
      },
      {
        key: 'total',
        label: 'Valor',
        width: '13%',
        align: 'right',
        sortValue: (order) => order.totalCents ?? 0,
        render: (order) => order.totalFormatted,
      },
      {
        key: 'createdAt',
        label: 'Data',
        width: '15%',
        sortValue: (order) => new Date(order.createdAt).getTime(),
        render: (order) => formatDate(order.createdAt),
      },
      {
        key: 'action',
        label: 'Ação',
        width: '12%',
        align: 'center',
        render: (order) => (
          <S.DetailLink to={`/painel/biteplaner/ordens/${order.id}`}>
            {order.id === returnedOrderId ? 'Ver ordem criada' : 'Ver detalhes'}
          </S.DetailLink>
        ),
      },
    ],
    []
  );

  return (
    <S.PageStack>
      <S.HeaderRow>
        <S.Header>
          <S.Title>Ordens Biteplaner</S.Title>
          <S.Subtitle>Acompanhe as compras Biteplaner feitas pela sua conta Nexor.</S.Subtitle>
        </S.Header>
        <AdminFormButton type="button" variant="secondary" onClick={() => void loadOrders()} disabled={loading}>
          <RefreshCw size={16} aria-hidden />
          Atualizar lista
        </AdminFormButton>
      </S.HeaderRow>

      {checkoutResult === 'success' ? (
        <S.CheckoutNotice role="status" $tone="success">
          <strong>Checkout concluído</strong>
          <span>
            O retorno do Asaas foi recebido. A confirmação financeira será exibida quando o webhook atualizar a ordem.
          </span>
          {returnedOrderId ? (
            <S.CheckoutOrderLink to={`/painel/biteplaner/ordens/${returnedOrderId}`}>
              Ordem criada: {returnedOrderId}
            </S.CheckoutOrderLink>
          ) : null}
        </S.CheckoutNotice>
      ) : null}

      {checkoutResult === 'cancel' ? (
        <S.CheckoutNotice role="status" $tone="warning">
          <strong>Pagamento não concluído</strong>
          <span>O checkout foi encerrado. A ordem permanece disponível para uma nova tentativa.</span>
          {returnedOrderId ? (
            <S.CheckoutOrderLink to={`/painel/biteplaner/ordens/${returnedOrderId}`}>
              Ver ordem pendente
            </S.CheckoutOrderLink>
          ) : null}
        </S.CheckoutNotice>
      ) : null}

      {filterActions}

      {error ? (
        <S.EmptyState role="alert">
          <strong>{error}</strong>
          <AdminFormButton type="button" variant="secondary" onClick={() => void loadOrders()}>
            Tentar novamente
          </AdminFormButton>
        </S.EmptyState>
      ) : null}

      {loading ? (
        <SkeletonTable rows={5} columns={7} />
      ) : !error ? (
        <AdminDataTable
          data={filteredOrders}
          columns={columns}
          keyExtractor={(order) => order.id}
          emptyMessage="Nenhuma ordem encontrada."
          searchLabel="Buscar"
          searchPlaceholder="Buscar por pedido, produto, tipo ou cor"
          searchValue={search}
          onSearchChange={setSearch}
          pageSize={10}
          initialSortKey="createdAt"
          initialSortDirection="desc"
          testId="biteplaner-dentist-orders-table"
        />
      ) : null}
    </S.PageStack>
  );
}
