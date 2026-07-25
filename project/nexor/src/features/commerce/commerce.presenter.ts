import type {
  AdminCommerceSummaryResponse,
  BiteplanerCommerceSummaryResponse,
  BiteplanerDentistCommerceState,
  BiteplanerLicenseStatus,
  CommerceAdminSummary,
  CommerceCatalogVersion,
  CommerceChargeSummary,
  CommerceOrderStatus,
  CommerceOrderSummary,
  DentistCommerceAction,
  TechnicalRequirementSummary,
} from './commerce.types';

const ORDER_STATUS_LABELS: Record<CommerceOrderStatus, string> = {
  draft: 'Rascunho',
  locked: 'Pedido travado',
  awaiting_payment: 'Aguardando pagamento',
  paid: 'Pagamento confirmado',
  in_fulfillment: 'Em operação',
  completed: 'Concluído',
  cancelled: 'Cancelado',
};

const LICENSE_STATUS_LABELS: Record<BiteplanerLicenseStatus, string> = {
  none: 'Sem licença',
  pending: 'Licença em análise',
  active: 'Licenciado',
  revoked: 'Licença revogada',
};

const REQUIREMENT_LABELS: Record<string, string> = {
  upper_scan_file: 'Escaneamento superior',
  lower_scan_file: 'Escaneamento inferior',
  bite_registration_file: 'Registro de mordida',
  technical_prescription: 'Prescrição técnica',
  notes: 'Observações técnicas',
};

export function canDentistBuyBiteplaner(
  profileComplete: boolean,
  licenseStatus: BiteplanerLicenseStatus
) {
  return profileComplete && licenseStatus === 'active';
}

export function getCommerceOrderStatusLabel(status: CommerceOrderStatus) {
  return ORDER_STATUS_LABELS[status];
}

export function getBiteplanerLicenseStatusLabel(status: BiteplanerLicenseStatus) {
  return LICENSE_STATUS_LABELS[status];
}

export function formatCurrencyFromCents(valueCents: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valueCents / 100);
}

export function getNextDentistCommerceAction(input: {
  profileComplete: boolean;
  licenseStatus: BiteplanerLicenseStatus;
}): DentistCommerceAction {
  if (!input.profileComplete) {
    return {
      label: 'Completar perfil',
      kind: 'complete_profile',
      enabled: true,
    };
  }

  if (input.licenseStatus === 'none') {
    return {
      label: 'Solicitar licença',
      kind: 'request_license',
      enabled: true,
    };
  }

  if (input.licenseStatus === 'pending') {
    return {
      label: 'Licença em análise',
      kind: 'wait_license',
      enabled: false,
    };
  }

  if (input.licenseStatus === 'active') {
    return {
      label: 'Comprar Biteplaner',
      kind: 'buy_biteplaner',
      enabled: true,
    };
  }

  return {
    label: 'Falar com suporte',
    kind: 'contact_support',
    enabled: true,
  };
}

const adaptLicenseStatus = (
  status: BiteplanerCommerceSummaryResponse['summary']['license']['status']
): BiteplanerLicenseStatus => {
  if (status === 'not_requested') return 'none';
  if (status === 'inactive') return 'revoked';
  return status;
};

const adaptOrderStatus = (status: string): CommerceOrderStatus => {
  if (
    status === 'awaiting_order_completion' ||
    status === 'technical_review' ||
    status === 'correction_requested' ||
    status === 'ready_for_production' ||
    status === 'in_production'
  ) {
    return 'in_fulfillment';
  }

  if (status === 'delivered' || status === 'shipped') {
    return 'completed';
  }

  if (status === 'expired' || status === 'payment_failed' || status === 'cancelled' || status === 'refunded') {
    return 'cancelled';
  }

  if (status === 'draft' || status === 'awaiting_payment' || status === 'paid' || status === 'completed') {
    return status;
  }

  return 'draft';
};

const hasPaidOrderStatus = (status: string) =>
  [
    'paid',
    'awaiting_order_completion',
    'technical_review',
    'correction_requested',
    'ready_for_production',
    'in_production',
    'shipped',
    'delivered',
    'completed',
  ].includes(status);

const adaptCatalogVersion = (
  version: BiteplanerCommerceSummaryResponse['summary']['catalog'],
  requirements: string[] = []
): CommerceCatalogVersion => {
  const requirementDetails = version.requirements?.map((requirement) => ({
    id: requirement.id,
    label: REQUIREMENT_LABELS[requirement.requirementKey] ?? requirement.requirementKey,
    requirementKey: requirement.requirementKey,
    isRequired: requirement.isRequired,
    valueKind: requirement.valueKind,
  }));

  return {
    id: version.id,
    productKey: version.productKey,
    name: version.name,
    version: Number(version.sku.match(/\d+$/)?.[0] ?? 1),
    active: version.isActive,
    priceCents: version.priceCents,
    currency: version.currency,
    requirements,
    requirementDetails,
    updatedAt: new Date(0).toISOString(),
  };
};

const adaptOrders = (
  orders: BiteplanerCommerceSummaryResponse['summary']['orders']
): CommerceOrderSummary[] =>
  orders.map((order) => {
    const firstItem = order.items[0];

    return {
      id: order.id,
      orderNumber: order.id,
      salesChannelKey: order.salesChannelKey,
      productKey: firstItem?.productKey ?? 'biteplaner',
      productName: 'Biteplaner',
      quantity: firstItem?.quantity ?? 0,
      status: adaptOrderStatus(order.status),
      paymentStatus: hasPaidOrderStatus(order.status) ? 'paid' : 'pending',
      fiscalStatus: 'not_requested',
      totalCents: order.totalCents,
      createdAt: new Date(0).toISOString(),
    };
  });

const adaptCharges = (
  charges: AdminCommerceSummaryResponse['summary']['charges']
): CommerceChargeSummary[] =>
  charges.map((charge) => ({
    id: charge.id,
    orderId: charge.orderId,
    provider: charge.provider,
    method: charge.method,
    status: charge.status,
    amountCents: charge.amountCents,
    currency: charge.currency,
  }));

const adaptRequirements = (
  requirements: BiteplanerCommerceSummaryResponse['summary']['requirements']
): TechnicalRequirementSummary[] =>
  requirements.map((requirement) => ({
    id: requirement.id,
    label: REQUIREMENT_LABELS[requirement.requirementKey] ?? requirement.requirementKey,
    status: 'pending',
  }));

const adaptTechnicalRequirementStatus = (status: string): TechnicalRequirementSummary['status'] => {
  if (status === 'uploaded' || status === 'approved' || status === 'rejected') {
    return status;
  }

  return 'pending';
};

export function adaptBiteplanerCommerceSummary(
  response: BiteplanerCommerceSummaryResponse
): BiteplanerDentistCommerceState {
  const requirements = adaptRequirements(response.summary.requirements);
  const profile = response.summary.profile;

  return {
    profile: {
      fullName: profile?.fullName ?? 'Perfil Nexor',
      email: profile?.email ?? '',
      cro: profile ? `${profile.registrationState}-${profile.registrationNumber}` : '',
      state: profile?.registrationState ?? '',
      profileComplete: profile?.isComplete === true && profile?.hasLocation === true,
    },
    license: {
      status: adaptLicenseStatus(response.summary.license.status),
      requestedAt: response.summary.license.request?.submittedAt,
    },
    activeCatalog: adaptCatalogVersion(
      response.summary.catalog,
      requirements.map((requirement) => requirement.label)
    ),
    orders: adaptOrders(response.summary.orders),
    requirements,
  };
}

export function adaptAdminCommerceSummary(response: AdminCommerceSummaryResponse): CommerceAdminSummary {
  return {
    catalogVersions: response.summary.catalogVersions.map((version) =>
      adaptCatalogVersion(
        version,
        version.requirements?.map((requirement) =>
          REQUIREMENT_LABELS[requirement.requirementKey] ?? requirement.requirementKey
        ) ?? []
      )
    ),
    accessRequests: response.summary.accessRequests.map((request) => ({
      id: request.id,
      dentistName: request.applicant?.fullName ?? request.profileId,
      email: request.applicant?.email ?? '',
      cro: request.applicant
        ? `${request.applicant.registrationState}-${request.applicant.registrationNumber}`
        : '',
      requestedAt: request.submittedAt ?? new Date(0).toISOString(),
      status: request.status === 'submitted' ? 'pending' : request.status === 'cancelled' ? 'rejected' : request.status,
    })),
    orders: adaptOrders(response.summary.orders),
    charges: adaptCharges(response.summary.charges),
    attachments: response.summary.attachments.map((attachment) => ({
      id: attachment.id,
      label: attachment.originalFileName,
      orderId: attachment.orderId,
      status: adaptTechnicalRequirementStatus(attachment.status),
      originalFileName: attachment.originalFileName,
    })),
    fiscalRecords: response.summary.fiscalRecords.map((record) => ({
      id: record.id,
      orderId: record.orderId,
      status: record.status,
    })),
    shipments: (response.summary.shipments ?? []).map((shipment) => ({
      id: shipment.id,
      orderId: shipment.orderId,
      status: shipment.status,
      carrier: shipment.carrier,
      trackingCode: shipment.trackingCode,
      trackingUrl: shipment.trackingUrl,
    })),
  };
}
