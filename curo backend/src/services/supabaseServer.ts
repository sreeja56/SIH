import "dotenv/config";
/** Minimal server-side Supabase REST client.
 * Uses the service-role key only on the Node server; never expose it to Vite/browser code.
 */
function getSupabaseConfig() {
  const url = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  return { url, key };
}
export function supabaseConfigured() {
  const { url, key } = getSupabaseConfig();
  return Boolean(url && key);
}

export async function supabaseRest<T = any>(table: string, init: RequestInit = {}, query = ''): Promise<T> {
  if (!supabaseConfigured()) throw new Error('Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  const { url, key } = getSupabaseConfig();
  const response = await fetch(`${url}/rest/v1/${table}${query}`, {
    ...init,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation,resolution=merge-duplicates',
      ...(init.headers || {}),
    },
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) throw new Error(data?.message || data?.hint || `Supabase ${response.status}`);
  return data as T;
}

export async function supabaseRpc<T = any>(fn: string, body: Record<string, unknown>): Promise<T> {
  if (!supabaseConfigured()) throw new Error('Supabase is not configured.');
  const { url, key } = getSupabaseConfig();
  const response = await fetch(`${url}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) throw new Error(data?.message || data?.hint || `Supabase RPC ${response.status}`);
  return data as T;
}
