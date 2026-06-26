import { api } from '../../../lib/api';
import type { AccessOptionsResponse } from './licensing.types';

export const fetchAccessOptions = (token?: string) =>
  api.get<AccessOptionsResponse>('/v1/products/biteplaner/access-options', token);
