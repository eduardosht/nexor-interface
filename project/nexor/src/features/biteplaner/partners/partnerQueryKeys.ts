export const partnerQueryKeys = {
  all: ['biteplaner', 'partners'] as const,
  overview: (ownerId: string) => [...partnerQueryKeys.all, 'overview', ownerId] as const,
  inviteLinks: (ownerId: string) => [...partnerQueryKeys.overview(ownerId), 'invite-links'] as const,
};

