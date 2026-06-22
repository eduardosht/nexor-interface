import { api } from '../../lib/api';
import type { CommunicationPreferences } from './platformEmails.types';

export type CommunicationPreferencesResponse = {
  preferences: CommunicationPreferences;
};

export type UpdateCommunicationPreferencesPayload = {
  systemFlowEmailEnabled: boolean;
};

export const fetchCommunicationPreferences = (token?: string) =>
  api.get<CommunicationPreferencesResponse>('/v1/account/communication-preferences', token);

export const updateCommunicationPreferences = (
  token: string | undefined,
  payload: UpdateCommunicationPreferencesPayload
) => api.patch<CommunicationPreferencesResponse>('/v1/account/communication-preferences', payload, token);


export type PlatformEmailStatus = 'scheduled' | 'processing' | 'sent' | 'failed' | 'cancelled' | 'skipped';

export type PlatformEmailEvent = {
  id: string;
  recipient_email: string;
  order_id: string | null;
  follow_up_kind: 'return_15_days' | 'return_30_days' | null;
  reminder_sequence: number | null;
  scheduled_for: string;
  status: PlatformEmailStatus;
  attempt_count: number;
  last_error_message: string | null;
  skip_reason: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type PlatformEmailJobRun = {
  id: string;
  job_key: string;
  status: 'running' | 'completed' | 'failed' | 'already_running';
  started_at: string;
  finished_at: string | null;
  triggered_by: 'cron' | 'admin';
  summary: Record<string, unknown>;
  error_message: string | null;
};

export type PlatformEmailPreview = {
  subject: string;
  html: string;
  text: string;
};

export type PlatformEmailRunSummary = {
  jobRunId: string;
  alreadyRunning: boolean;
  processed: number;
  sent: number;
  failed: number;
  retryScheduled: number;
  skipped: number;
  sentBeforeRun: number;
  remainingDailyLimit: number;
  dailyLimit: number;
};

export const listPlatformEmails = (token: string | undefined, params: { status?: PlatformEmailStatus | ''; limit?: number } = {}) => {
  const search = new URLSearchParams();
  if (params.status) search.set('status', params.status);
  search.set('limit', String(params.limit ?? 100));
  return api.get<{ emails: PlatformEmailEvent[] }>(`/v1/admin/platform-emails?${search.toString()}`, token);
};

export const listPlatformEmailJobRuns = (token: string | undefined, limit = 10) =>
  api.get<{ runs: PlatformEmailJobRun[] }>(`/v1/admin/platform-emails/job-runs?limit=${limit}`, token);

export const previewPlatformEmail = (token: string | undefined, eventId: string) =>
  api.get<{ preview: PlatformEmailPreview }>(`/v1/admin/platform-emails/${eventId}/preview`, token);

export const cancelPlatformEmail = (token: string | undefined, eventId: string, reason: string) =>
  api.post<{ email: PlatformEmailEvent }>(`/v1/admin/platform-emails/${eventId}/cancel`, { reason }, token);

export const retryPlatformEmail = (token: string | undefined, eventId: string) =>
  api.post<{ email: PlatformEmailEvent }>(`/v1/admin/platform-emails/${eventId}/retry`, {}, token);

export const runPlatformEmailDailyJob = (token: string | undefined) =>
  api.post<PlatformEmailRunSummary>('/v1/admin/platform-emails/run-daily-job', {}, token);
