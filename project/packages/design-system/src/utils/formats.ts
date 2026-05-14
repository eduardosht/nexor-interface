export type SupportedDocumentType = 'cpf' | 'rg';

export function sanitizePersonName(value: string): string {
  return value.replace(/[0-9]/g, '');
}

export function sanitizeDocumentValue(type: SupportedDocumentType, value: string): string {
  if (type === 'cpf') {
    return value.replace(/\D/g, '').slice(0, 11);
  }

  return value.replace(/[^0-9A-Za-z]/g, '').toUpperCase().slice(0, 9);
}

export function formatDocumentValue(type: SupportedDocumentType, value: string): string {
  const sanitized = sanitizeDocumentValue(type, value);

  if (type === 'cpf') {
    return sanitized
      .replace(/^(\d{3})(\d)/, '$1.$2')
      .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
  }

  return sanitized
    .replace(/^([0-9A-Z]{2})([0-9A-Z])/, '$1.$2')
    .replace(/^([0-9A-Z]{2})\.([0-9A-Z]{3})([0-9A-Z])/, '$1.$2.$3')
    .replace(/^([0-9A-Z]{2})\.([0-9A-Z]{3})\.([0-9A-Z]{3})([0-9A-Z])/, '$1.$2.$3-$4');
}

export function getDocumentMaxLength(type: SupportedDocumentType): number {
  return type === 'cpf' ? 14 : 12;
}

export function sanitizePhoneValue(value: string): string {
  return value.replace(/\D/g, '').slice(0, 11);
}

export function formatPhoneValue(value: string): string {
  const sanitized = sanitizePhoneValue(value);

  return sanitized
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/^(\(\d{2}\) \d{5})(\d)/, '$1-$2');
}

export function getPhoneMaxLength(): number {
  return 15;
}
