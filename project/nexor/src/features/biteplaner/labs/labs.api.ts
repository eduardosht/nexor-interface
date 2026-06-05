import { api } from '../../../lib/api';
import type { LicensedLabSelectionApiRecord } from './labs.types';

export const fetchLicensedLabs = (token?: string) =>
  api.get<{ labs: LicensedLabSelectionApiRecord[] }>('/v1/account/biteplaner/licensed-labs', token);
