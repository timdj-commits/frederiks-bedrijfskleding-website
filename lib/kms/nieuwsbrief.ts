import { kmsAdmin } from '@/lib/kms/adminClient';

/**
 * Data-access voor nieuwsbrief-inschrijvingen (leadcapture vanuit de footer).
 * RLS staat aan zonder policies, dus lezen verloopt via kmsAdmin() (service-role).
 * Alleen server-side gebruiken, altijd achter dashAuthed().
 */

export type Inschrijving = {
  id: string;
  email: string;
  naam: string | null;
  bron: string | null;
  created_at: string;
};

/** Alle inschrijvingen, nieuwste eerst. */
export async function listInschrijvingen(): Promise<Inschrijving[]> {
  const sb = kmsAdmin();
  if (!sb) return [];
  const { data, error } = await sb
    .from('nieuwsbrief_inschrijvingen')
    .select('id, email, naam, bron, created_at')
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data as unknown as Inschrijving[];
}
