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
