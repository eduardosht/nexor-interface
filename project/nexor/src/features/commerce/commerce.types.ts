export type SalesChannelKey = 'nexor' | 'orthotech';

export type ProductKey = 'biteplaner' | 'orthotech_guard' | 'orthotech_appliance';

export type BiteplanerLicenseStatus = 'none' | 'pending' | 'active' | 'revoked';

export type CommerceOrderStatus =
  | 'draft'
  | 'locked'
  | 'awaiting_payment'
  | 'paid'
  | 'in_fulfillment'
  | 'completed'
  | 'cancelled';

export type CommerceBackendOrderStatus =
  | 'draft'
  | 'expired'
  | 'awaiting_payment'
  | 'payment_failed'
  | 'awaiting_order_completion'
  | 'paid'
  | 'technical_review'
  | 'correction_requested'
  | 'ready_for_production'
  | 'in_production'
  | 'shipped'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'refunded';

export type CommercePaymentStatus = 'not_created' | 'pending' | 'paid' | 'failed' | 'cancelled';
export type CommerceChargeMethod = 'pix' | 'card';

export type CommerceFiscalStatus = 'not_requested' | 'pending' | 'issued' | 'sent' | 'failed';

export type TechnicalRequirementStatus = 'pending' | 'uploaded' | 'approved' | 'rejected';

export interface CommerceCatalogVersion {
  id: string;
  productKey: ProductKey;
  name: string;
  version: number;
  active: boolean;
  priceCents: number;
  currency: 'BRL';
  requirements: string[];
  requirementDetails?: CommerceCatalogRequirement[];
  updatedAt: string;
}

export interface CommerceCatalogRequirement {
  id: string;
  label: string;
  requirementKey: string;
  isRequired: boolean;
  valueKind: string;
}

export interface ProfessionalProfileSummary {
  fullName: string;
  email: string;
  cro: string;
  state: string;
  profileComplete: boolean;
}

export interface BiteplanerLicenseSummary {
  status: BiteplanerLicenseStatus;
  requestedAt?: string;
  approvedAt?: string;
}

export interface CommerceOrderSummary {
  id: string;
  orderNumber: string;
  salesChannelKey: SalesChannelKey;
  productKey: ProductKey;
  productName: string;
  quantity: number;
  status: CommerceOrderStatus;
  paymentStatus: CommercePaymentStatus;
  fiscalStatus: CommerceFiscalStatus;
  totalCents: number;
  createdAt: string;
}

export interface CommerceChargeSummary {
  id: string;
  orderId: string;
  provider: 'asaas';
  method: CommerceChargeMethod;
  status: string;
  amountCents: number;
  currency: 'BRL';
}

export type CommerceFiscalRecordStatus = 'pending' | 'issued' | 'cancelled' | 'failed';
export type CommerceShipmentStatus = 'preparing' | 'shipped' | 'delivered' | 'returned' | 'cancelled';

export interface CommerceFiscalRecordSummary {
  id: string;
  orderId: string;
  status: CommerceFiscalRecordStatus;
}

export interface CommerceShipmentSummary {
  id: string;
  orderId: string;
  status: CommerceShipmentStatus;
  carrier: string | null;
  trackingCode: string | null;
  trackingUrl: string | null;
}

export interface TechnicalRequirementSummary {
  id: string;
  label: string;
  status: TechnicalRequirementStatus;
  orderId?: string;
  originalFileName?: string;
}

export interface BiteplanerDentistCommerceState {
  profile: ProfessionalProfileSummary;
  license: BiteplanerLicenseSummary;
  activeCatalog: CommerceCatalogVersion;
  orders: CommerceOrderSummary[];
  requirements: TechnicalRequirementSummary[];
}

export interface CommerceAdminSummary {
  catalogVersions: CommerceCatalogVersion[];
  accessRequests: Array<{
    id: string;
    dentistName: string;
    email: string;
    cro: string;
    requestedAt: string;
    status: 'pending' | 'approved' | 'rejected';
  }>;
  orders: CommerceOrderSummary[];
  charges: CommerceChargeSummary[];
  attachments: TechnicalRequirementSummary[];
  fiscalRecords: CommerceFiscalRecordSummary[];
  shipments: CommerceShipmentSummary[];
}

export type DentistCommerceActionKind =
  | 'complete_profile'
  | 'request_license'
  | 'wait_license'
  | 'buy_biteplaner'
  | 'contact_support';

export interface DentistCommerceAction {
  label: string;
  kind: DentistCommerceActionKind;
  enabled: boolean;
}

export interface CreateBiteplanerOrderInput {
  quantity: number;
}

export interface CreateBiteplanerCheckoutInput {
  model: string;
  color: string;
  quantity: number;
  successUrl: string;
  cancelUrl: string;
}

export interface CreateCommerceOrderResponse {
  order: CommerceOrderSummary;
}

export interface CreateBiteplanerCheckoutResponse {
  order: CommerceOrderSummary;
  charge: {
    id: string;
    status: string;
    checkoutSessionId?: string;
    checkoutUrl?: string;
  };
}

export interface UpdateCommerceCatalogVersionInput {
  priceCents: number;
  isActive: boolean;
}

export interface UpdateCommerceCatalogVersionResponse {
  catalogVersion: {
    id: string;
    productKey: ProductKey;
    sku: string;
    name: string;
    priceCents: number;
    currency: 'BRL';
    isActive: boolean;
  };
}

export interface UpdateCommerceCatalogRequirementInput {
  isRequired: boolean;
  valueKind: string;
}

export interface UpdateCommerceCatalogRequirementResponse {
  requirement: {
    id: string;
    requirementKey: string;
    isRequired: boolean;
    valueKind: string;
  };
}

export interface UpdateCommerceFiscalRecordInput {
  status: CommerceFiscalRecordStatus;
}

export interface UpdateCommerceFiscalRecordResponse {
  fiscalRecord: {
    id: string;
    orderId: string;
    status: CommerceFiscalRecordStatus;
  };
}

export interface UpdateCommerceShipmentInput {
  status: CommerceShipmentStatus;
  carrier: string | null;
  trackingCode: string | null;
  trackingUrl: string | null;
}

export interface UpdateCommerceShipmentResponse {
  shipment: CommerceShipmentSummary;
}

export interface UpdateCommerceOrderStatusInput {
  status: CommerceBackendOrderStatus;
  reason: string | null;
}

export interface UpdateCommerceOrderStatusResponse {
  order: {
    id: string;
    status: CommerceBackendOrderStatus;
  };
}

export interface FinalizeCommerceOrderResponse {
  charge: {
    id: string;
    status: string;
  };
}

export interface BiteplanerAccessRequestResponse {
  request: {
    id: string;
    status: 'pending';
  };
}

export interface BiteplanerAccessApprovalResponse {
  grant: {
    id: string;
    productKey: 'biteplaner';
    status: 'active';
  };
}

export interface BiteplanerCommerceSummaryResponse {
  summary: {
    profile: {
      profileId: string;
      professionalProfileId: string;
      fullName: string;
      email: string;
      registrationNumber: string;
      registrationState: string;
      isComplete: boolean;
      hasLocation: boolean;
    } | null;
    license: {
      status: 'active' | 'not_requested' | 'pending' | 'inactive';
      request: {
        id: string;
        status: 'submitted' | 'approved' | 'rejected' | 'cancelled';
        submittedAt?: string;
      } | null;
    };
    catalog: {
      id: string;
      productKey: 'biteplaner';
      sku: string;
      name: string;
      priceCents: number;
      currency: 'BRL';
      isActive: boolean;
      requirements?: Array<{
        id: string;
        requirementKey: string;
        isRequired: boolean;
        valueKind: string;
      }>;
    };
    requirements: Array<{
      id: string;
      requirementKey: string;
      isRequired: boolean;
      valueKind: string;
    }>;
    orders: Array<{
      id: string;
      salesChannelKey: 'nexor';
      status: string;
      totalCents: number;
      currency: 'BRL';
      items: Array<{
        id: string;
        productKey: 'biteplaner';
        quantity: number;
      }>;
    }>;
  };
}

export interface AdminCommerceSummaryResponse {
  summary: {
    catalogVersions: BiteplanerCommerceSummaryResponse['summary']['catalog'][];
    accessRequests: Array<{
      id: string;
      productKey: 'biteplaner';
      profileId: string;
      status: 'submitted' | 'approved' | 'rejected' | 'cancelled';
      submittedAt?: string;
      applicant?: {
        fullName: string;
        email: string;
        registrationNumber: string;
        registrationState: string;
      };
    }>;
    orders: BiteplanerCommerceSummaryResponse['summary']['orders'];
    charges: Array<{
      id: string;
      orderId: string;
      provider: 'asaas';
      method: CommerceChargeMethod;
      status: string;
      amountCents: number;
      currency: 'BRL';
    }>;
    attachments: Array<{
      id: string;
      orderId: string;
      originalFileName: string;
      status: string;
    }>;
    fiscalRecords: Array<{
      id: string;
      orderId: string;
      status: CommerceFiscalRecordStatus;
    }>;
    shipments: CommerceShipmentSummary[];
  };
}
