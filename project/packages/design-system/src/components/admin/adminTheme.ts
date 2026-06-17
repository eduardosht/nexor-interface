export function adminColor(theme: unknown, appKey: string, tokenKey: string, fallback: string) {
  const colors = (theme as { colors?: Record<string, string> }).colors;
  return colors?.[appKey] ?? colors?.[tokenKey] ?? fallback;
}
