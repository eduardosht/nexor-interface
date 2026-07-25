export interface BiteplanerDentistOrderSummary {
  id: string;
  status: string;
  paymentStatus: string;
  shipmentStatus: string | null;
  quantity: number;
  productName: string;
  productVersionId: string | null;
  model: string;
  color: string;
  currency: string;
  subtotalCents?: number | null;
  totalCents?: number | null;
  totalFormatted: string;
  createdAt: string;
  updatedAt: string;
  lockedAt: string | null;
}

export interface BiteplanerDentistOrderItem {
  id: string;
  productKey: string;
  productVersionId: string | null;
  name: string;
  quantity: number;
  unitPriceCents?: number | null;
  totalCents?: number | null;
  model: string;
  color: string;
  createdAt: string;
}

export interface BiteplanerDentistOrderCharge {
  id: string;
  provider: string;
  status: string;
  method: string | null;
  amountCents?: number | null;
  paidAt: string | null;
  createdAt: string;
}

export interface BiteplanerDentistOrderShipment {
  id: string;
  status: 'pending' | 'preparing' | 'shipped' | 'delivered' | 'returned';
  carrier: string | null;
  trackingCode: string | null;
  trackingUrl: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
}

export interface BiteplanerDentistOrderStatusEvent {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  reason: string | null;
  createdAt: string;
}

export interface BiteplanerDentistOrderDetail extends BiteplanerDentistOrderSummary {
  sourceApp: string;
  channelKey: string;
  items: BiteplanerDentistOrderItem[];
  charges: BiteplanerDentistOrderCharge[];
  shipments: BiteplanerDentistOrderShipment[];
  statusEvents: BiteplanerDentistOrderStatusEvent[];
}

export interface BiteplanerDentistOrdersResponse {
  orders: BiteplanerDentistOrderSummary[];
}

export interface BiteplanerDentistOrderDetailResponse {
  order: BiteplanerDentistOrderDetail;
}

export interface BiteplanerDentistOrderListParams {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
}
