export function resolveSafeNextPath(value: string | null | undefined, fallback: string) {
  if (!value || !value.startsWith('/')) {
    return fallback;
  }

  if (value.startsWith('//')) {
    return fallback;
  }

  return value;
}

export function redirectToExternal(url: string) {
  window.location.href = url;
}

const ONBOARDING_PATH_PATTERN = /^\/painel\/biteplaner\/cadastro\/(parceiro|dentista|laboratório)$/;

export function resolvePostLoginPath(roles?: unknown, nextPath?: string | null): string {
  if (Array.isArray(roles) && roles.includes('admin')) {
    return '/painel/admin/home';
  }

  const safeNextPath = resolveSafeNextPath(nextPath, '');

  if (ONBOARDING_PATH_PATTERN.test(safeNextPath)) {
    return safeNextPath;
  }

  return '/painel/home';
}
