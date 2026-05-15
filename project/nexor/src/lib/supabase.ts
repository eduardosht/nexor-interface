import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from '../config/env';

let client: SupabaseClient | null | undefined;

export function getSupabaseClient(): SupabaseClient | null {
  if (client !== undefined) {
    return client;
  }

  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    client = null;
    return client;
  }

  client = createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });

  return client;
}

export const supabase = getSupabaseClient();
