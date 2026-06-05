import { api } from '../../../lib/api';
import type {
  AccessOptionsResponse,
  DentistLicensingResponse,
  DentistLicensingWorkflow,
  LabLicensingResponse,
} from './licensing.types';

export const fetchAccessOptions = (token?: string) =>
  api.get<AccessOptionsResponse>('/v1/products/biteplaner/access-options', token);

export const fetchDentistLicensing = (token?: string) =>
  api.get<DentistLicensingResponse>('/v1/account/biteplaner/dentist-licensing', token);

export const fetchLabLicensing = (token?: string) =>
  api.get<LabLicensingResponse>('/v1/account/biteplaner/lab-licensing', token);

export const confirmDentistLicensingPayment = (token?: string) =>
  api.post<{ workflow: DentistLicensingWorkflow }>(
    '/v1/account/biteplaner/dentist-licensing/payment-confirmed',
    {},
    token,
  );

export const confirmLabLicensingPayment = (token?: string) =>
  api.post<{ workflow: DentistLicensingWorkflow }>(
    '/v1/account/biteplaner/lab-licensing/payment-confirmed',
    {},
    token,
  );

export const signDentistLicensingContract = (
  type: 'intention' | 'licensing' | 'distrato',
  token?: string,
) =>
  api.post<{ workflow: DentistLicensingWorkflow }>(
    `/v1/account/biteplaner/dentist-licensing/contracts/${type}/sign`,
    {},
    token,
  );

export const signLabLicensingContract = (
  type: 'intention' | 'licensing' | 'distrato',
  token?: string,
) =>
  api.post<{ workflow: DentistLicensingWorkflow }>(
    `/v1/account/biteplaner/lab-licensing/contracts/${type}/sign`,
    {},
    token,
  );

export const updateDentistLicensingCourseProgress = (
  contentId: string,
  completed: boolean,
  token?: string,
) =>
  api.post<{ workflow: DentistLicensingWorkflow }>(
    '/v1/account/biteplaner/dentist-licensing/course/progress',
    { contentId, completed },
    token,
  );

export const updateLabLicensingCourseProgress = (
  contentId: string,
  completed: boolean,
  token?: string,
) =>
  api.post<{ workflow: DentistLicensingWorkflow }>(
    '/v1/account/biteplaner/lab-licensing/course/progress',
    { contentId, completed },
    token,
  );

export const submitDentistLicensingTest = (answers: string[], token?: string) =>
  api.post<{ workflow: DentistLicensingWorkflow }>(
    '/v1/account/biteplaner/dentist-licensing/test/submit',
    { answers },
    token,
  );

export const submitLabLicensingTest = (answers: string[], token?: string) =>
  api.post<{ workflow: DentistLicensingWorkflow }>(
    '/v1/account/biteplaner/lab-licensing/test/submit',
    { answers },
    token,
  );
