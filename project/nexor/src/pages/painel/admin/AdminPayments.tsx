import { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminDataTable, AdminStatusPill, Button, type AdminDataTableColumn } from '@nexor/design-system';
import { CheckCircle2, Copy, Eye, X } from 'lucide-react';
import styled from 'styled-components';
import { SkeletonTable } from '../../../components/Skeleton';
import { useAdminPortal } from '../../../features/admin/portal';
import {
  confirmPayment,
  fetchOrders,
  getAuthToken,
  getOrderDisplayId,
  type DemoOrderSummary,
} from '../../../features/demo/biteplanerFlow';
import { useAuth } from '../../../hooks/useAuth';
import * as OperationalTable from '../BiteplanerHub/styles';
import { AdminProductGate } from './AdminProductGate';
import { PageHeader, PageStack, PageSubtitle, PageTitle, TableSection } from './styles';

const ADMIN_PAYMENT_PAGE_SIZE = 30;
const BITEPLANER_UNIT_PRICE_CENTS = 137000;
const POST_PAYMENT_STATUSES = new Set([
  'payment_confirmed',
  'awaiting_dentist_forms',
  'awaiting_dentist_acceptance',
  'awaiting_scheduling',
  'appointment_confirmed',
  'in_progress',
  'awaiting_lab_start',
  'lab_processing',
  'dentist_adjustment_required',
  'product_received_by_clinic',
  'completed',
]);

function formatCurrencyBRL(cents: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100);
}

function formatPurchaseOption(value: string | null | undefined) {
  if (value === 'impacto') return 'Linha Impact';
  if (value === 'esportes') return 'Linha Strength';
  if (value === 'preto') return 'Preto';
  if (value === 'branco') return 'Branco';
  return value ?? 'Não informado';
}

function getOrderAmountCents(order: DemoOrderSummary) {
  return BITEPLANER_UNIT_PRICE_CENTS * Math.max(1, order.purchaseConfiguration?.quantity ?? 1);
}

function isPaymentConfirmedOrder(order: DemoOrderSummary) {
  return POST_PAYMENT_STATUSES.has(order.status) || order.paymentRequest?.status === 'paid';
}

function getPaymentRequestLabel(order: DemoOrderSummary) {
  if (isPaymentConfirmedOrder(order)) return 'Pagamento confirmado';
  return order.paymentRequest?.status === 'message_sent' ? 'Mensagem enviada' : 'Aguardando envio';
}

function getPaymentRequestColor(order: DemoOrderSummary) {
  if (isPaymentConfirmedOrder(order)) return '#15803d';
  if (order.paymentRequest?.status === 'message_sent') return '#15803d';
  return '#d18a00';
}

function isPaymentRelevantOrder(order: DemoOrderSummary) {
  return Boolean(order.purchaseConfiguration) || Boolean(order.paymentRequest) || POST_PAYMENT_STATUSES.has(order.status);
}

function buildPaymentMessage(order: DemoOrderSummary) {
  const customerName = order.customer?.full_name?.trim() || 'cliente';
  const configuration = order.purchaseConfiguration;

  return [
    `Olá, ${customerName}.`,
    '',
    `Sua compra do Biteplaner foi confirmada no pedido ${getOrderDisplayId(order)}.`,
    `Modelo: ${formatPurchaseOption(configuration?.model)}`,
    `Cor: ${formatPurchaseOption(configuration?.color)}`,
    `Quantidade: ${configuration?.quantity ?? 1}`,
    `Valor: ${formatCurrencyBRL(getOrderAmountCents(order))}`,
    '',
    'Envie o link de pagamento por este canal. Assim que o pagamento for identificado, a produção será liberada para continuidade operacional.',
  ].join('\n');
}

export function AdminPayments() {
  const { selectedProduct } = useAdminPortal();
  const { session } = useAuth();
  const token = getAuthToken(session);
  const [orders, setOrders] = useState<DemoOrderSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<DemoOrderSummary | null>(null);
  const [notice, setNotice] = useState('');
  const [submittingOrderId, setSubmittingOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedProduct || !token) {
      return;
    }

    let active = true;

    async function loadOrders() {
      setLoading(true);
      try {
        const response = await fetchOrders('admin', token, {
          limit: ADMIN_PAYMENT_PAGE_SIZE,
        });

        if (active) {
          setOrders(response.orders.filter(isPaymentRelevantOrder));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadOrders();

    return () => {
      active = false;
    };
  }, [selectedProduct, token]);

  async function handleCopyPaymentMessage(order: DemoOrderSummary) {
    await navigator.clipboard.writeText(buildPaymentMessage(order));
    setNotice('Mensagem copiada.');
  }

  async function handleConfirmPayment(order: DemoOrderSummary) {
    if (!token) {
      return;
    }

    setSubmittingOrderId(order.id);
    setNotice('');

    try {
      const response = await confirmPayment(order.checkoutOrderId ?? order.id, token);
      setOrders((current) => current.map((item) => (item.id === order.id ? response.order : item)));
      setSelectedOrder(null);
      setNotice('Pagamento confirmado.');
    } finally {
      setSubmittingOrderId(null);
    }
  }

  const columns = useMemo<AdminDataTableColumn<DemoOrderSummary>[]>(
    () => [
      {
        key: 'order',
        label: 'Pedido',
        width: '12%',
        sortValue: (row) => getOrderDisplayId(row),
        render: (row) => getOrderDisplayId(row),
      },
      {
        key: 'customer',
        label: 'Cliente',
        sortValue: (row) => row.customer?.full_name ?? '',
        render: (row) => row.customer?.full_name ?? 'Não informado',
      },
      {
        key: 'email',
        label: 'E-mail',
        sortValue: (row) => row.customer?.email ?? '',
        render: (row) => row.customer?.email ?? 'Não informado',
      },
      {
        key: 'phone',
        label: 'Celular',
        sortValue: (row) => row.customer?.phone ?? '',
        render: (row) => row.customer?.phone ?? 'Não informado',
      },
      {
        key: 'amount',
        label: 'Valor',
        align: 'right',
        sortValue: (row) => getOrderAmountCents(row),
        render: (row) => formatCurrencyBRL(getOrderAmountCents(row)),
      },
      {
        key: 'status',
        label: 'Status',
        sortValue: (row) => getPaymentRequestLabel(row),
        render: (row) => (
          <AdminStatusPill
            color={getPaymentRequestColor(row)}
            label={getPaymentRequestLabel(row)}
          />
        ),
      },
      {
        key: 'actions',
        label: 'Ações',
        align: 'center',
        render: (row) => (
          <OperationalTable.TableIconButton
            type="button"
            aria-label={`Ver mensagem de pagamento ${getOrderDisplayId(row)}`}
            title="Ver mensagem"
            onClick={() => setSelectedOrder(row)}
          >
            <Eye size={16} aria-hidden />
          </OperationalTable.TableIconButton>
        ),
      },
    ],
    []
  );

  const renderPaymentQueueMobileCard = useCallback((row: DemoOrderSummary) => {
    const orderLabel = getOrderDisplayId(row);

    return (
      <OperationalTable.QueueMobileCard>
        <OperationalTable.QueueMobileHeader>
          <strong>{orderLabel}</strong>
          <AdminStatusPill
            color={getPaymentRequestColor(row)}
            label={getPaymentRequestLabel(row)}
          />
        </OperationalTable.QueueMobileHeader>
        <OperationalTable.QueueMobileDetail>
          <span>Cliente</span>
          <strong>{row.customer?.full_name ?? 'Não informado'}</strong>
        </OperationalTable.QueueMobileDetail>
        <OperationalTable.QueueMobileDetail>
          <span>E-mail</span>
          <strong>{row.customer?.email ?? 'Não informado'}</strong>
        </OperationalTable.QueueMobileDetail>
        <OperationalTable.QueueMobileDetail>
          <span>Celular</span>
          <strong>{row.customer?.phone ?? 'Não informado'}</strong>
        </OperationalTable.QueueMobileDetail>
        <OperationalTable.QueueMobileDetail>
          <span>Valor</span>
          <strong>{formatCurrencyBRL(getOrderAmountCents(row))}</strong>
        </OperationalTable.QueueMobileDetail>
        <OperationalTable.QueueMobileActions aria-label={`Ações da ordem ${orderLabel}`}>
          <OperationalTable.QueueMobileActionButton
            type="button"
            $tone="neutral"
            aria-label={`Ver mensagem de pagamento ${orderLabel}`}
            title="Ver mensagem"
            onClick={() => setSelectedOrder(row)}
          >
            <Eye size={15} aria-hidden />
            <span>Ver mensagem</span>
          </OperationalTable.QueueMobileActionButton>
        </OperationalTable.QueueMobileActions>
      </OperationalTable.QueueMobileCard>
    );
  }, []);

  return (
    <PageStack>
      <PageHeader>
        <PageTitle>Pagamentos</PageTitle>
        <PageSubtitle>
          Ordens com compra confirmada pelo cliente e pagamento pendente. Revise e-mail, celular, valor e nome antes de
          enviar manualmente o link de pagamento por e-mail ou WhatsApp.
        </PageSubtitle>
      </PageHeader>

      <AdminProductGate />

      {selectedProduct ? (
        <TableSection padding="lg">
          {notice ? <Notice role="status">{notice}</Notice> : null}

          {loading ? (
            <SkeletonTable rows={6} columns={6} />
          ) : (
            <OperationalTable.OperationalTableShell data-testid="admin-payments-table-shell">
              <AdminDataTable
                data={orders}
                columns={columns}
                keyExtractor={(row) => row.id}
                renderMobileCard={renderPaymentQueueMobileCard}
                mobileTestId="admin-payments-table-mobile"
                pageSize={8}
                emptyMessage="Nenhuma ordem aguardando envio de link de pagamento."
                testId="admin-payments-table"
              />
            </OperationalTable.OperationalTableShell>
          )}
        </TableSection>
      ) : null}

      {selectedOrder ? (
        <ModalBackdrop>
          <ModalCard role="dialog" aria-modal="true" aria-label="Mensagem de pagamento">
            <ModalHeader>
              <div>
                <ModalTitle>Mensagem de pagamento</ModalTitle>
                <ModalSubtitle>{getOrderDisplayId(selectedOrder)}</ModalSubtitle>
              </div>
              <CloseButton
                type="button"
                aria-label="Fechar mensagem de pagamento"
                title="Fechar"
                onClick={() => setSelectedOrder(null)}
              >
                <X size={18} aria-hidden />
              </CloseButton>
            </ModalHeader>

            <MessageBox>{buildPaymentMessage(selectedOrder)}</MessageBox>

            <ModalActions>
              <Button
                type="button"
                variant="ghost"
                aria-label="Copiar mensagem de pagamento"
                onClick={() => void handleCopyPaymentMessage(selectedOrder)}
              >
                <Copy size={16} aria-hidden />
                Copiar
              </Button>
              <Button
                type="button"
                data-tone="success"
                disabled={submittingOrderId === selectedOrder.id || isPaymentConfirmedOrder(selectedOrder)}
                onClick={() => void handleConfirmPayment(selectedOrder)}
              >
                <CheckCircle2 size={16} aria-hidden />
                {submittingOrderId === selectedOrder.id ? 'Confirmando...' : 'Pagamento confirmado'}
              </Button>
            </ModalActions>
          </ModalCard>
        </ModalBackdrop>
      ) : null}
    </PageStack>
  );
}

const Notice = styled.div`
  padding: 12px 14px;
  border: 1px solid rgba(21, 128, 61, 0.18);
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.greenGhost};
  color: ${({ theme }) => theme.colors.green};
  font-size: 14px;
  line-height: 1.5;
`;

const ModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 80;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(15, 23, 42, 0.38);
`;

const ModalCard = styled.section`
  width: min(720px, 100%);
  max-height: calc(100vh - 40px);
  overflow: auto;
  display: grid;
  gap: 18px;
  padding: 22px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgElevated};
  box-shadow: 0 24px 70px rgba(15, 23, 42, 0.24);
`;

const ModalHeader = styled.header`
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 20px;
  line-height: 1.2;
`;

const ModalSubtitle = styled.p`
  margin: 6px 0 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
`;

const CloseButton = styled.button`
  flex: 0 0 auto;
  width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.bgElevated};
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  transition:
    background 160ms ease,
    border-color 160ms ease,
    color 160ms ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.textPrimary};
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

const MessageBox = styled.pre`
  margin: 0;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  padding: 16px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.bgBase};
  color: ${({ theme }) => theme.colors.textPrimary};
  font: inherit;
  font-size: 14px;
  line-height: 1.6;
`;

const ModalActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-end;
`;
