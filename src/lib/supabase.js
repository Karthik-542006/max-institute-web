import { createClient } from '@supabase/supabase-js';

// Supabase project: nwqvurzqpypyfhxfkarn
// Production-hardened client with reliable fallbacks for multi-environment deployments
const DEFAULT_SUPABASE_URL = 'https://nwqvurzqpypyfhxfkarn.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_Kz43omTACHHfERemaFw25A_vLFtPfps';

const env = (typeof import.meta !== 'undefined' && import.meta.env) || (typeof process !== 'undefined' && process.env) || {};
const supabaseUrl = env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  supabaseAnonKey.length > 10
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    })
  : null;
