import { api } from '../../lib/api';
import type {
  BiteplanerDentistOrderDetailResponse,
  BiteplanerDentistOrderListParams,
  BiteplanerDentistOrdersResponse,
} from './biteplanerDentistOrders.types';

const buildOrdersPath = (params: BiteplanerDentistOrderListParams = {}) => {
  const query = new URLSearchParams();

  if (params.status) query.set('status', params.status);
  if (params.dateFrom) query.set('dateFrom', params.dateFrom);
  if (params.dateTo) query.set('dateTo', params.dateTo);
  if (params.limit !== undefined) query.set('limit', String(params.limit));

  const queryString = query.toString();
  return queryString
    ? `/v1/commerce/biteplaner/orders?${queryString}`
    : '/v1/commerce/biteplaner/orders';
};

export const fetchBiteplanerDentistOrders = (
  token: string,
  params?: BiteplanerDentistOrderListParams
) => api.get<BiteplanerDentistOrdersResponse>(buildOrdersPath(params), token);

export const fetchBiteplanerDentistOrder = (orderId: string, token: string) =>
  api.get<BiteplanerDentistOrderDetailResponse>(`/v1/commerce/biteplaner/orders/${orderId}`, token);
