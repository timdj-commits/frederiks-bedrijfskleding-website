import { kmsAdmin } from '@/lib/kms/adminClient';

/**
 * Data-access voor de module Drukproeven. Een drukproef hoort bij een klant en toont
 * hoe een logo op een kledingstuk komt (plek, maat, techniek). Jessi maakt hem aan,
 * automatisch gegenereerd (via de garment-render) of met een eigen geuploade afbeelding;
 * daarna kan de klant hem goedkeuren (per mail of in het portaal).
 * Alle queries via kmsAdmin() (service-role). Alleen server-side, achter dashAuthed().
 */

export const DRUKPROEF_STATUSSEN = ['concept', 'verstuurd', 'goedgekeurd', 'afgekeurd'] as const;

export type Drukproef = {
  id: string;
  organisatie_id: string;
  product_id: string | null;
  order_id: string | null;
  naam: string;
  type: string;
  kleur: number;
  techniek: string;
  positie: string;
  logo_url: string | null;
  afbeelding_url: string | null;
  omschrijving: string | null;
  status: string;
  opmerking: string | null;
  token: string;
  behandeld_op: string | null;
  created_at: string;
};

export type DrukproefMetKlant = Drukproef & { organisatie_naam: string | null };

export type DrukproefVelden = {
  naam: string;
  product_id?: string | null;
  order_id?: string | null;
  type?: string;
  kleur?: number;
  techniek?: string;
  positie?: string;
  logo_url?: string | null;
  afbeelding_url?: string | null;
  omschrijving?: string | null;
};

export async function listDrukproevenVoorKlant(orgId: string): Promise<Drukproef[]> {
  const sb = kmsAdmin(); if (!sb) return [];
  const { data } = await sb.from('drukproeven').select('*').eq('organisatie_id', orgId).order('created_at', { ascending: false });
  return (data as Drukproef[]) ?? [];
}

/** De drukproeven die aan een order hangen (voor de drukproef-sectie op de order). */
export async function listDrukproevenVoorOrder(orderId: string): Promise<Drukproef[]> {
  const sb = kmsAdmin(); if (!sb) return [];
  const { data } = await sb.from('drukproeven').select('*').eq('order_id', orderId).order('created_at', { ascending: false });
  return (data as Drukproef[]) ?? [];
}

/**
 * Zet een goedgekeurde drukproef die aan een order hangt door naar productie:
 * de order krijgt status 'borduren' of 'bedrukken' op basis van de techniek, maar
 * alleen vanuit een vroege fase (we overschrijven geen verder gevorderde status).
 */
export async function verwerkDrukproefGoedkeuring(drukproefId: string): Promise<void> {
  const sb = kmsAdmin(); if (!sb) return;
  const { data } = await sb.from('drukproeven').select('order_id, techniek, status').eq('id', drukproefId).maybeSingle();
  const dp = data as { order_id: string | null; techniek: string | null; status: string } | null;
  if (!dp || dp.status !== 'goedgekeurd' || !dp.order_id) return;

  const { data: orderData } = await sb.from('orders').select('status').eq('id', dp.order_id).maybeSingle();
  const huidige = (orderData as { status: string } | null)?.status;
  const vroeg = ['concept', 'offerte_verstuurd', 'offerte_goedgekeurd', 'nog_bestellen', 'besteld', 'deellevering', 'compleet_geleverd'];
  if (!huidige || !vroeg.includes(huidige)) return;
  const nieuwe = dp.techniek === 'bedrukken' ? 'bedrukken' : 'borduren';
  await sb.from('orders').update({ status: nieuwe }).eq('id', dp.order_id);
}

export async function getDrukproef(id: string): Promise<DrukproefMetKlant | null> {
  const sb = kmsAdmin(); if (!sb) return null;
  const { data } = await sb.from('drukproeven').select('*, organisaties(naam)').eq('id', id).maybeSingle();
  if (!data) return null;
  const r = data as unknown as Drukproef & { organisaties: { naam: string } | null };
  const { organisaties, ...rest } = r;
  return { ...rest, organisatie_naam: organisaties?.naam ?? null };
}

export async function maakDrukproef(orgId: string, v: DrukproefVelden): Promise<string | null> {
  const sb = kmsAdmin(); if (!sb) return null;
  const { data, error } = await sb
    .from('drukproeven')
    .insert({
      organisatie_id: orgId,
      naam: v.naam.trim(),
      product_id: v.product_id ?? null,
      order_id: v.order_id ?? null,
      type: v.type ?? 'tshirt',
      kleur: Number.isFinite(Number(v.kleur)) ? Math.round(Number(v.kleur)) : 0,
      techniek: v.techniek ?? 'borduren',
      positie: v.positie ?? 'borst-links',
      logo_url: v.logo_url ?? null,
      afbeelding_url: v.afbeelding_url ?? null,
      omschrijving: v.omschrijving?.trim() || null,
      status: 'concept',
    })
    .select('id')
    .single();
  if (error || !data) return null;
  return (data as { id: string }).id;
}

export async function werkDrukproef(id: string, v: DrukproefVelden): Promise<boolean> {
  const sb = kmsAdmin(); if (!sb) return false;
  const patch: Record<string, unknown> = { naam: v.naam.trim() };
  if (v.product_id !== undefined) patch.product_id = v.product_id ?? null;
  if (v.type !== undefined) patch.type = v.type;
  if (v.kleur !== undefined) patch.kleur = Math.round(Number(v.kleur)) || 0;
  if (v.techniek !== undefined) patch.techniek = v.techniek;
  if (v.positie !== undefined) patch.positie = v.positie;
  if (v.logo_url !== undefined) patch.logo_url = v.logo_url ?? null;
  if (v.afbeelding_url !== undefined) patch.afbeelding_url = v.afbeelding_url ?? null;
  if (v.omschrijving !== undefined) patch.omschrijving = v.omschrijving?.trim() || null;
  const { error } = await sb.from('drukproeven').update(patch).eq('id', id);
  return !error;
}

export async function zetDrukproefStatus(id: string, status: string, opmerking?: string | null): Promise<boolean> {
  const sb = kmsAdmin(); if (!sb) return false;
  const patch: Record<string, unknown> = { status };
  if (opmerking !== undefined) patch.opmerking = opmerking?.trim() || null;
  if (status === 'goedgekeurd' || status === 'afgekeurd') patch.behandeld_op = new Date().toISOString();
  const { error } = await sb.from('drukproeven').update(patch).eq('id', id);
  return !error;
}

export async function verwijderDrukproef(id: string): Promise<boolean> {
  const sb = kmsAdmin(); if (!sb) return false;
  const { error } = await sb.from('drukproeven').delete().eq('id', id);
  return !error;
}

/** Zet de drukproef op 'verstuurd' zodat de klant hem kan beoordelen (mail of portaal). */
export async function markeerVerstuurd(id: string): Promise<boolean> {
  const sb = kmsAdmin(); if (!sb) return false;
  const { error } = await sb.from('drukproeven').update({ status: 'verstuurd' }).eq('id', id);
  return !error;
}

/** Publieke ophaling via de geheime token (goedkeurlink in de mail, geen login nodig). */
export async function getDrukproefViaToken(token: string): Promise<DrukproefMetKlant | null> {
  const sb = kmsAdmin(); if (!sb || !token.trim()) return null;
  const { data } = await sb.from('drukproeven').select('*, organisaties(naam)').eq('token', token.trim()).maybeSingle();
  if (!data) return null;
  const r = data as unknown as Drukproef & { organisaties: { naam: string } | null };
  const { organisaties, ...rest } = r;
  return { ...rest, organisatie_naam: organisaties?.naam ?? null };
}

/**
 * Beslist een drukproef via de token: alleen toegestaan zolang hij nog niet behandeld is
 * (status concept of verstuurd). Geeft de bijgewerkte drukproef terug, of null bij fout.
 */
export async function beslisDrukproefViaToken(token: string, akkoord: boolean, opmerking?: string | null): Promise<DrukproefMetKlant | null> {
  const sb = kmsAdmin(); if (!sb || !token.trim()) return null;
  const huidig = await getDrukproefViaToken(token);
  if (!huidig || (huidig.status !== 'concept' && huidig.status !== 'verstuurd')) return null;
  const { error } = await sb
    .from('drukproeven')
    .update({ status: akkoord ? 'goedgekeurd' : 'afgekeurd', opmerking: opmerking?.trim() || null, behandeld_op: new Date().toISOString() })
    .eq('id', huidig.id);
  if (error) return null;
  if (akkoord) await verwerkDrukproefGoedkeuring(huidig.id);
  return { ...huidig, status: akkoord ? 'goedgekeurd' : 'afgekeurd', opmerking: opmerking?.trim() || null };
}
