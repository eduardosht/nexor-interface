export type NotificationActionRole = 'customer' | 'dentist' | 'lab';
export type NotificationActionKind = 'order' | 'financial_onboarding';

export type ActionableNotification = {
  title: string;
  message: string;
  type?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type NotificationAction = {
  role?: NotificationActionRole | undefined;
  label: string;
  path: string;
  kind: NotificationActionKind;
};

const ACTION_INTENT_PATTERN = /(acao necessaria|ação necessária|precisa|pendente|aguardando|action|required)/i;
const ORDER_CONTEXT_PATTERN = /(pedido|ordem|order|consulta|consultation|producao|production)/i;
const FINANCIAL_ONBOARDING_PATH_PREFIX = '/painel/biteplaner/financeiro';

function normalize(value: unknown) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

function readMetadataRole(metadata?: Record<string, unknown> | null): NotificationActionRole | null {
  const roleValue = [
    metadata?.actionFor,
    metadata?.role,
    metadata?.targetRole,
    metadata?.audience,
    metadata?.assignee,
    metadata?.actor,
  ]
    .map(normalize)
    .find(Boolean);

  if (!roleValue) {
    return null;
  }

  if (/(customer|client|cliente|user|athlete|atleta)/.test(roleValue)) {
    return 'customer';
  }

  if (/(dentist|dentista)/.test(roleValue)) {
    return 'dentist';
  }

  if (/(lab|laboratorio|laboratory)/.test(roleValue)) {
    return 'lab';
  }

  return null;
}

function inferRole(notification: ActionableNotification): NotificationActionRole | null {
  const metadataRole = readMetadataRole(notification.metadata);
  if (metadataRole) {
    return metadataRole;
  }

  const searchableText = normalize(`${notification.type ?? ''} ${notification.title} ${notification.message}`);

  if (/(dentist|dentista)/.test(searchableText)) {
    return 'dentist';
  }

  if (/(lab|laboratorio|laboratory)/.test(searchableText)) {
    return 'lab';
  }

  if (/(customer|client|cliente|atleta|usuario|usuário)/.test(searchableText)) {
    return 'customer';
  }

  return null;
}

function hasOrderContext(notification: ActionableNotification): boolean {
  const metadata = notification.metadata ?? {};
  const metadataValues = [
    metadata.orderId,
    metadata.order_id,
    metadata.orderStatus,
    metadata.order_status,
    metadata.workflowStatus,
    metadata.status,
  ];
  const searchableText = normalize(`${notification.type ?? ''} ${notification.title} ${notification.message} ${metadataValues.join(' ')}`);

  return ORDER_CONTEXT_PATTERN.test(searchableText);
}

function readFinancialOnboardingPath(metadata?: Record<string, unknown> | null): string | null {
  const path = metadata?.financialOnboardingPath;

  if (typeof path !== 'string' || !path.startsWith(FINANCIAL_ONBOARDING_PATH_PREFIX)) {
    return null;
  }

  return path;
}

export function getNotificationCardAction(notification: ActionableNotification): NotificationAction | null {
  const financialOnboardingPath = readFinancialOnboardingPath(notification.metadata);

  if (financialOnboardingPath === null) {
    return null;
  }

  return {
    role: inferRole(notification) ?? undefined,
    kind: 'financial_onboarding',
    label: 'Completar cadastro financeiro',
    path: financialOnboardingPath,
  };
}

export function getNotificationAction(notification: ActionableNotification): NotificationAction | null {
  const searchableText = `${notification.type ?? ''} ${notification.title} ${notification.message}`;
  const hasActionIntent =
    ACTION_INTENT_PATTERN.test(searchableText) ||
    Boolean(readMetadataRole(notification.metadata));

  if (!hasActionIntent || !hasOrderContext(notification)) {
    return null;
  }

  const role = inferRole(notification);

  if (role === 'customer') {
    return { role, kind: 'order', label: 'Ir para jornada', path: '/painel/biteplaner/jornada' };
  }

  if (role === 'dentist') {
    return { role, kind: 'order', label: 'Ver ordens do dentista', path: '/painel/biteplaner?mode=dentist' };
  }

  if (role === 'lab') {
    return { role, kind: 'order', label: 'Ver ordens do laboratório', path: '/painel/biteplaner?mode=lab' };
  }

  return null;
}
