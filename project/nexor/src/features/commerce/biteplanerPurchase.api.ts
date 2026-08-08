import { api } from '../../lib/api';
import type {
  CreateBiteplanerDraftInput,
  CreateBiteplanerDraftResponse,
  StartBiteplanerCheckoutInput,
  StartBiteplanerCheckoutResponse,
} from './biteplanerPurchase.types';

export const createBiteplanerDraft = (
  input: CreateBiteplanerDraftInput,
  token: string,
) => api.post<CreateBiteplanerDraftResponse>('/v1/commerce/biteplaner/drafts', input, token);

export const startBiteplanerCheckout = (
  input: StartBiteplanerCheckoutInput,
  token: string,
) => api.post<StartBiteplanerCheckoutResponse>('/v1/commerce/biteplaner/checkout', input, token);
