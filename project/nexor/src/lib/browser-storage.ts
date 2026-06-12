type BrowserStorage = 'local' | 'session';

function getStorage(type: BrowserStorage): Storage | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return type === 'local' ? window.localStorage : window.sessionStorage;
}

export function readStorageValue(key: string, type: BrowserStorage = 'local'): string | null {
  try {
    return getStorage(type)?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

export function writeStorageValue(key: string, value: string, type: BrowserStorage = 'local') {
  try {
    getStorage(type)?.setItem(key, value);
  } catch {
    // Storage can be unavailable in privacy modes; app state should remain usable in memory.
  }
}

export function removeStorageValue(key: string, type: BrowserStorage = 'local') {
  try {
    getStorage(type)?.removeItem(key);
  } catch {
    // Ignore storage failures for non-critical persisted UI state.
  }
}

export function readStorageJson<T>(key: string, type: BrowserStorage = 'local'): T | null {
  const raw = readStorageValue(key, type);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    removeStorageValue(key, type);
    return null;
  }
}

export function writeStorageJson<T>(key: string, value: T, type: BrowserStorage = 'local') {
  writeStorageValue(key, JSON.stringify(value), type);
}
