export type PartnerOverviewResponse = {
  inviteLinks: Array<{
    id: string;
    token: string;
    status: string;
    intendedCustomerName: string | null;
    intendedCustomerEmail: string | null;
    created_at: string;
    expires_at: string | null;
    consumed_at: string | null;
  }>;
  leads: Array<{
    id: string;
    partnerId: string;
    partnerLinkId: string;
    orderId: string;
    customerProfileId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string | null;
    funnelStage: string;
    statusLabel: string;
    created_at: string;
    orderStatus: string | null;
  }>;
  summary: {
    leadsCaptured: number;
    convertedToAccount: number;
    activeOrders: number;
    finishedOrders?: number;
  };
};
