export type NotificationActionRole = 'customer' | 'dentist' | 'lab';

export type ActionableNotification = {
  title: string;
  message: string;
  type?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type NotificationAction = {
  role: NotificationActionRole;
  label: string;
  path: string;
};

const ACTION_INTENT_PATTERN = /(acao necessaria|ação necessária|precisa|pendente|aguardando|action|required)/i;

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

export function getNotificationAction(notification: ActionableNotification): NotificationAction | null {
  const searchableText = `${notification.type ?? ''} ${notification.title} ${notification.message}`;
  const hasActionIntent =
    ACTION_INTENT_PATTERN.test(searchableText) ||
    Boolean(readMetadataRole(notification.metadata));

  if (!hasActionIntent) {
    return null;
  }

  const role = inferRole(notification);

  if (role === 'customer') {
    return { role, label: 'Ir para jornada', path: '/painel/biteplaner/jornada' };
  }

  if (role === 'dentist') {
    return { role, label: 'Ver ordens do dentista', path: '/painel/biteplaner?mode=dentist' };
  }

  if (role === 'lab') {
    return { role, label: 'Ver ordens do laboratório', path: '/painel/biteplaner?mode=lab' };
  }

  return null;
}

