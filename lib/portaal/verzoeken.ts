import { getServerSupabase } from './supabaseServer';

/**
 * Portaalkant (RLS) voor medewerker-wijzigingsverzoeken en in-portaal meldingen.
 * Een beheerder of leidinggevende dient een verzoek in; dat gaat pas in als Jessi het
 * goedkeurt. De RLS-policy borgt dat dit de eigen organisatie is.
 */

export type MijnVerzoek = {
  id: string;
  type: string;
  naam: string | null;
  email: string | null;
  functie: string | null;
  budget: number | null;
  status: string;
  medewerker_id: string | null;
  created_at: string;
};

export async function maakVerzoek(v: {
  organisatieId: string;
  type: 'toevoegen' | 'verwijderen';
  medewerkerId?: string | null;
  naam?: string | null;
  email?: string | null;
  functie?: string | null;
  budget?: number | null;
  aangevraagdDoor?: string | null;
}): Promise<{ ok: boolean; error?: string }> {
  const sb = await getServerSupabase();
  if (!sb) return { ok: false, error: 'Portaal niet geconfigureerd' };
  const { error } = await sb.from('medewerker_verzoeken').insert({
    organisatie_id: v.organisatieId,
    type: v.type,
    medewerker_id: v.medewerkerId ?? null,
    naam: v.naam?.trim() || null,
    email: v.email?.trim() || null,
    functie: v.functie?.trim() || null,
    budget: v.budget ?? null,
    aangevraagd_door: v.aangevraagdDoor?.trim() || null,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function listMijnVerzoeken(): Promise<MijnVerzoek[]> {
  const sb = await getServerSupabase();
  if (!sb) return [];
  const { data } = await sb
    .from('medewerker_verzoeken')
    .select('id, type, naam, email, functie, budget, status, medewerker_id, created_at')
    .order('created_at', { ascending: false });
  return (data as MijnVerzoek[]) ?? [];
}

export type MijnMelding = { id: string; tekst: string; gelezen: boolean; created_at: string };

export async function listMijnMeldingen(): Promise<MijnMelding[]> {
  const sb = await getServerSupabase();
  if (!sb) return [];
  const { data } = await sb
    .from('portaal_meldingen')
    .select('id, tekst, gelezen, created_at')
    .order('created_at', { ascending: false })
    .limit(20);
  return (data as MijnMelding[]) ?? [];
}

export async function markeerMeldingenGelezen(): Promise<void> {
  const sb = await getServerSupabase();
  if (!sb) return;
  await sb.from('portaal_meldingen').update({ gelezen: true }).eq('gelezen', false);
}
