const ADMINISTRATIVE_ROLES = new Set([
  'admin',
  'support',
  'finance',
  'clinical',
  'operations',
  'management',
  'compliance',
]);

export function hasAdministrativeRole(roles: string[] = []) {
  return roles.some((role) => ADMINISTRATIVE_ROLES.has(role));
}
