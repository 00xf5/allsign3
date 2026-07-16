const DEFAULT_SUPABASE_URL = 'https://nxzvpcbudbqotujuuczo.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54enZwY2J1ZGJxb3R1anV1Y3pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4MTQ0MzcsImV4cCI6MjA4MzM5MDQzN30.45hqzbpj27CRlI3gRhtlS_VOIsuitYKDhEOPrpSminc';

function envOrDefault(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function resolveSupabaseUrl(): string {
  const fromEnv = envOrDefault(import.meta.env.VITE_SUPABASE_URL, '');
  // Ignore empty, Vercel URLs, or any non-Supabase host (common misconfig on Vercel)
  if (fromEnv.includes('.supabase.co')) {
    return fromEnv;
  }
  return DEFAULT_SUPABASE_URL;
}

export const SECURITY_CONFIG = {
  supabaseUrl: resolveSupabaseUrl(),
  supabaseAnonKey: envOrDefault(
    import.meta.env.VITE_SUPABASE_ANON_KEY,
    DEFAULT_SUPABASE_ANON_KEY,
  ),
  payloadEncryptionKey: envOrDefault(
    import.meta.env.VITE_PAYLOAD_ENCRYPTION_KEY,
    'allsign-payload-key-v1-change-in-prod',
  ),
} as const;

function trimTrailingSlash(value: string): string {
  return value.endsWith('/') ? value.slice(0, -1) : value;
}

/** Always returns absolute Supabase Edge Function URL — never a relative / Vercel path. */
export function functionUrl(name: string): string {
  const normalized = name.replace(/^\//, '');
  const base = trimTrailingSlash(SECURITY_CONFIG.supabaseUrl);
  return `${base}/functions/v1/${normalized}`;
}
