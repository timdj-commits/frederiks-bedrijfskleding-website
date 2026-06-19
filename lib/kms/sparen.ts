import { kmsAdmin } from '@/lib/kms/adminClient';

/**
 * Data-access voor het spaarsysteem: bedrijven sparen punten op hun bestellingen,
 * inwisselbaar voor korting op een volgende bestelling. Verzilveren gebeurt in v1
 * via het dashboard (Jessi), niet in de webshop-checkout.
 *
 * `instellingen` en `spaar_inwisselingen` hebben RLS aan met GEEN policies, dus
 * alle lees-/schrijfacties verlopen via kmsAdmin() (service-role). Alleen
 * server-side gebruiken, altijd achter dashAuthed() (behalve getSpaarsaldo/
 * getSpaarInstellingen die ook het portaal aanroept voor de eigen organisatie).
 */

// Orderstatussen die NIET als bestede omzet meetellen voor het sparen.
const NIET_TELLENDE_STATUSSEN = ['concept', 'geannuleerd', 'offerte_verstuurd'];

export type SpaarInstellingen = { actief: boolean; puntenPerEuro: number; euroPerPunt: number };
export type Spaarsaldo = { verdiend: number; ingewisseld: number; saldo: number; euroWaarde: number };
export type SpaarsaldoKlant = {
  organisatieId: string;
  naam: string;
  verdiend: number;
  ingewisseld: number;
  saldo: number;
  euroWaarde: number;
};

function ronde2(n: number): number {
  return Math.round((Number.isFinite(n) ? n : 0) * 100) / 100;
}

function parseGetal(waarde: string | null | undefined, fallback: number): number {
  if (waarde == null) return fallback;
  const n = Number(String(waarde).replace(',', '.'));
  return Number.isFinite(n) ? n : fallback;
}

/** Leest de drie instellingen-rijen met nette fallbacks. */
export async function getSpaarInstellingen(): Promise<SpaarInstellingen> {
  const sb = kmsAdmin();
  if (!sb) return { actief: false, puntenPerEuro: 1, euroPerPunt: 0.01 };
  const { data } = await sb
    .from('instellingen')
    .select('sleutel, waarde')
    .in('sleutel', ['spaar_actief', 'spaar_punten_per_euro', 'spaar_euro_per_punt']);
  const map: Record<string, string> = {};
  ((data as unknown as { sleutel: string; waarde: string | null }[]) ?? []).forEach((r) => {
    map[r.sleutel] = r.waarde ?? '';
  });
  return {
    actief: map['spaar_actief'] === 'true',
    puntenPerEuro: parseGetal(map['spaar_punten_per_euro'], 1),
    euroPerPunt: parseGetal(map['spaar_euro_per_punt'], 0.01),
  };
}

/** Upsert de drie instellingen-rijen (onConflict 'sleutel'), waarden als string. */
export async function zetSpaarInstellingen(v: SpaarInstellingen): Promise<boolean> {
  const sb = kmsAdmin();
  if (!sb) return false;
  const rijen = [
    { sleutel: 'spaar_actief', waarde: v.actief ? 'true' : 'false' },
    { sleutel: 'spaar_punten_per_euro', waarde: String(v.puntenPerEuro) },
    { sleutel: 'spaar_euro_per_punt', waarde: String(v.euroPerPunt) },
  ];
  const { error } = await sb.from('instellingen').upsert(rijen, { onConflict: 'sleutel' });
  return !error;
}

/** Spaarsaldo voor één organisatie. */
export async function getSpaarsaldo(orgId: string): Promise<Spaarsaldo> {
  const sb = kmsAdmin();
  if (!sb) return { verdiend: 0, ingewisseld: 0, saldo: 0, euroWaarde: 0 };
  const { puntenPerEuro, euroPerPunt } = await getSpaarInstellingen();

  const { data: orderData } = await sb
    .from('orders')
    .select('bedrag, status')
    .eq('organisatie_id', orgId);
  const omzet = ((orderData as unknown as { bedrag: number | null; status: string | null }[]) ?? [])
    .filter((o) => !NIET_TELLENDE_STATUSSEN.includes(String(o.status ?? '')))
    .reduce((som, o) => som + (Number(o.bedrag) || 0), 0);
  const verdiend = Math.floor(omzet * puntenPerEuro);

  const { data: inwisselData } = await sb
    .from('spaar_inwisselingen')
    .select('punten')
    .eq('organisatie_id', orgId);
  const ingewisseld = ((inwisselData as unknown as { punten: number | null }[]) ?? [])
    .reduce((som, r) => som + (Number(r.punten) || 0), 0);

  const saldo = Math.max(0, verdiend - ingewisseld);
  return { verdiend, ingewisseld, saldo, euroWaarde: ronde2(saldo * euroPerPunt) };
}

/** Spaarsaldo voor alle organisaties, gesorteerd op saldo aflopend. */
export async function getSpaarsaldoAlle(): Promise<SpaarsaldoKlant[]> {
  const sb = kmsAdmin();
  if (!sb) return [];
  const { puntenPerEuro, euroPerPunt } = await getSpaarInstellingen();

  const [{ data: orgData }, { data: orderData }, { data: inwisselData }] = await Promise.all([
    sb.from('organisaties').select('id, naam'),
    sb.from('orders').select('organisatie_id, bedrag, status'),
    sb.from('spaar_inwisselingen').select('organisatie_id, punten'),
  ]);

  const organisaties = (orgData as unknown as { id: string; naam: string | null }[]) ?? [];
  const orders = (orderData as unknown as { organisatie_id: string | null; bedrag: number | null; status: string | null }[]) ?? [];
  const inwisselingen = (inwisselData as unknown as { organisatie_id: string | null; punten: number | null }[]) ?? [];

  const omzetPerOrg: Record<string, number> = {};
  orders.forEach((o) => {
    const id = o.organisatie_id;
    if (!id || NIET_TELLENDE_STATUSSEN.includes(String(o.status ?? ''))) return;
    omzetPerOrg[id] = (omzetPerOrg[id] ?? 0) + (Number(o.bedrag) || 0);
  });

  const ingewisseldPerOrg: Record<string, number> = {};
  inwisselingen.forEach((r) => {
    const id = r.organisatie_id;
    if (!id) return;
    ingewisseldPerOrg[id] = (ingewisseldPerOrg[id] ?? 0) + (Number(r.punten) || 0);
  });

  const rijen: SpaarsaldoKlant[] = organisaties.map((org) => {
    const verdiend = Math.floor((omzetPerOrg[org.id] ?? 0) * puntenPerEuro);
    const ingewisseld = ingewisseldPerOrg[org.id] ?? 0;
    const saldo = Math.max(0, verdiend - ingewisseld);
    return {
      organisatieId: org.id,
      naam: org.naam ?? '',
      verdiend,
      ingewisseld,
      saldo,
      euroWaarde: ronde2(saldo * euroPerPunt),
    };
  });

  rijen.sort((a, b) => b.saldo - a.saldo);
  return rijen;
}

/** Wisselt punten in voor één organisatie. Guard op saldo. */
export async function wisselPuntenIn(
  orgId: string,
  punten: number,
  omschrijving?: string,
): Promise<{ ok: boolean; kortingEuro: number; error?: string }> {
  const sb = kmsAdmin();
  if (!sb) return { ok: false, kortingEuro: 0, error: 'Database niet gekoppeld' };
  if (!orgId) return { ok: false, kortingEuro: 0, error: 'Geen klant gekozen' };
  if (!Number.isFinite(punten) || punten <= 0) {
    return { ok: false, kortingEuro: 0, error: 'Vul een positief aantal punten in' };
  }

  const { saldo } = await getSpaarsaldo(orgId);
  if (punten > saldo) {
    return { ok: false, kortingEuro: 0, error: `Niet genoeg saldo: ${saldo} punten beschikbaar` };
  }

  const { euroPerPunt } = await getSpaarInstellingen();
  const kortingEuro = ronde2(punten * euroPerPunt);

  const { error } = await sb.from('spaar_inwisselingen').insert({
    organisatie_id: orgId,
    punten,
    korting_euro: kortingEuro,
    omschrijving: omschrijving?.trim() || null,
  });
  if (error) return { ok: false, kortingEuro: 0, error: error.message };
  return { ok: true, kortingEuro };
}
