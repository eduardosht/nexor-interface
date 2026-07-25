import { useQuery } from '@tanstack/react-query';
import { getAdminCommerceSummary, getBiteplanerCommerceSummary } from './commerce.api';
import { adaptAdminCommerceSummary, adaptBiteplanerCommerceSummary } from './commerce.presenter';

export const commerceQueryKeys = {
  biteplanerSummary: ['commerce', 'biteplaner-summary'] as const,
  adminSummary: ['commerce', 'admin-summary'] as const,
};

export function useBiteplanerCommerceState(token?: string) {
  return useQuery({
    queryKey: commerceQueryKeys.biteplanerSummary,
    enabled: Boolean(token),
    queryFn: async () => adaptBiteplanerCommerceSummary(await getBiteplanerCommerceSummary(token ?? '')),
  });
}

export function useAdminCommerceState(token?: string) {
  return useQuery({
    queryKey: commerceQueryKeys.adminSummary,
    enabled: Boolean(token),
    queryFn: async () => adaptAdminCommerceSummary(await getAdminCommerceSummary(token ?? '')),
  });
}
