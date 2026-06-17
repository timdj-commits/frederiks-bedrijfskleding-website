import { createClient } from '@supabase/supabase-js';
import { env, isLeadsDbConfigured } from '@/lib/env';

/**
 * Upload een bestand naar de publieke opslag-bucket 'media' en geef de publieke
 * URL terug. Server-side via de service-role. Geeft null bij geen bestand of fout.
 */
export async function uploadMedia(file: File | null, prefix: string): Promise<string | null> {
  if (!isLeadsDbConfigured || !file || file.size === 0) return null;
  const sb = createClient(env.supabaseUrl, env.supabaseServiceKey, { auth: { persistSession: false } });
  const ext = (file.name.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '');
  const veiligPrefix = prefix.replace(/[^a-z0-9/_-]/gi, '').replace(/^\/+|\/+$/g, '') || 'overig';
  const naam = `${veiligPrefix}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext || 'bin'}`;
  const buf = Buffer.from(await file.arrayBuffer());
  const { error } = await sb.storage.from('media').upload(naam, buf, {
    contentType: file.type || undefined,
    upsert: false,
  });
  if (error) return null;
  const { data } = sb.storage.from('media').getPublicUrl(naam);
  return data.publicUrl ?? null;
}
