import { z } from 'zod';

const emptyToUndef = (v: unknown) => (v === '' ? undefined : v);
const devDefaults = {
  VITE_BITEPLANER_URL: 'http://localhost:5174',
  VITE_API_URL: 'http://127.0.0.1:3333',
};

const schema = z.object({
  VITE_BITEPLANER_URL: z.string().url(),
  VITE_API_URL: z.string().url(),
  VITE_APP_URL: z.preprocess(emptyToUndef, z.string().url().optional()),
  VITE_SUPABASE_URL: z.preprocess(emptyToUndef, z.string().url().optional()),
  VITE_SUPABASE_ANON_KEY: z.preprocess(emptyToUndef, z.string().min(1).optional()),
  VITE_CONTACT_EMAIL: z.preprocess(emptyToUndef, z.string().email().optional()),
  VITE_CONTACT_WHATSAPP: z.preprocess(emptyToUndef, z.string().optional()),
  DISABLE_BITEPLANER: z.preprocess(emptyToUndef, z.enum(['true', 'false']).optional()),
});

type RawEnv = Record<string, unknown>;

function isDevEnv(raw: RawEnv) {
  return raw.MODE === 'development' || raw.DEV === true || raw.DEV === 'true';
}

export function parseEnv(raw: RawEnv) {
  const source = isDevEnv(raw) ? { ...devDefaults, ...raw } : raw;
  const parsed = schema.parse(source);
  return {
    biteplanerUrl: parsed.VITE_BITEPLANER_URL,
    apiUrl: parsed.VITE_API_URL,
    appUrl: parsed.VITE_APP_URL,
    supabaseUrl: parsed.VITE_SUPABASE_URL,
    supabaseAnonKey: parsed.VITE_SUPABASE_ANON_KEY,
    contactEmail: parsed.VITE_CONTACT_EMAIL,
    contactWhatsapp: parsed.VITE_CONTACT_WHATSAPP,
    disableBiteplaner: parsed.DISABLE_BITEPLANER === 'true',
  };
}

// Lazily parsed so unit tests that import parseEnv directly don't trigger this.
let _env: ReturnType<typeof parseEnv> | undefined;
export function getEnv() {
  if (!_env) {
    _env = parseEnv(import.meta.env);
  }
  return _env;
}

// Kept for runtime convenience in non-test code.
export const env: ReturnType<typeof parseEnv> = new Proxy({} as ReturnType<typeof parseEnv>, {
  get(_target, prop) {
    return getEnv()[prop as keyof ReturnType<typeof parseEnv>];
  },
});
