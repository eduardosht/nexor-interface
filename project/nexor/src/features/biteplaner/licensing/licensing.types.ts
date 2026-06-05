import type { AccessMode } from '../../demo/biteplanerFlow';

export type AccessOption = {
  key: AccessMode;
  label: string;
  description: string;
  allowed: boolean;
  highlighted: boolean;
  reason: string | null;
  status?: string;
};

export type AccessOptionsResponse = {
  productKey: 'biteplaner';
  defaultMode: AccessMode;
  enrollment: {
    id: string;
    status: string;
    source_type: string;
    created_at: string;
  } | null;
  modes: AccessOption[];
};

export type DentistLicensingWorkflow = {
  id: string;
  status: string;
  paymentStatus: string;
  testAttempts: number;
  testPassed: boolean;
  certificateIssuedAt: string | null;
  metadata: Record<string, unknown>;
};

export type DentistLicensingCourseContent = {
  id: string;
  title: string;
  videoTitle: string;
  documentTitle: string;
};

export type AccountNotification = {
  id: string;
  title: string;
  message: string;
  type?: string;
  read?: boolean;
  createdAt?: string;
};

export type DentistLicensingResponse = {
  workflow: DentistLicensingWorkflow | null;
  course: DentistLicensingCourseContent[];
  notifications: AccountNotification[];
};

export type LabLicensingResponse = DentistLicensingResponse;
