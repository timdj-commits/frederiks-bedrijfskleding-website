import { getServerSupabase } from './supabaseServer';
import { getMijnToegang } from './team';

export type RetourStatus = 'aangemeld' | 'goedgekeurd' | 'afgewezen' | 'verwerkt';
export type KlachtSoort = 'vraag' | 'klacht';
export type KlachtStatus = 'open' | 'in_behandeling' | 'afgehandeld';

export type OrderKeuze = { id: string; ordernummer: string | null; status: string | null };

export type Retour = {
  id: string;
  order_id: string | null;
  reden: string | null;
  status: RetourStatus;
  retouradres: string | null;
  instructie: string | null;
  created_at: string;
  ordernummer: string | null;
};

export type Klacht = {
  id: string;
  order_id: string | null;
  soort: KlachtSoort;
  omschrijving: string;
  status: KlachtStatus;
  antwoord: string | null;
  created_at: string;
  ordernummer: string | null;
};

/** Bestellingen van de eigen organisatie voor de keuzelijst bij een retour of klacht. RLS scoopt op org. */
export async function getMijnOrders(): Promise<OrderKeuze[]> {
  const sb = await getServerSupabase();
  if (!sb) return [];
  const { data } = await sb
    .from('orders')
    .select('id, ordernummer, status')
    .order('created_at', { ascending: false });
  return (data as unknown as OrderKeuze[]) ?? [];
}

/** Retouren van de eigen organisatie, nieuwste eerst. RLS scoopt op org. */
export async function getMijnRetouren(): Promise<Retour[]> {
  const sb = await getServerSupabase();
  if (!sb) return [];
  const { data } = await sb
    .from('retouren')
    .select('id, order_id, reden, status, retouradres, instructie, created_at, orders(ordernummer)')
    .order('created_at', { ascending: false });
  const rijen =
    (data as unknown as {
      id: string;
      order_id: string | null;
      reden: string | null;
      status: RetourStatus;
      retouradres: string | null;
      instructie: string | null;
      created_at: string;
      orders: { ordernummer: string | null } | null;
    }[]) ?? [];
  return rijen.map((r) => ({
    id: r.id,
    order_id: r.order_id,
    reden: r.reden,
    status: r.status,
    retouradres: r.retouradres,
    instructie: r.instructie,
    created_at: r.created_at,
    ordernummer: r.orders?.ordernummer ?? null,
  }));
}

/** Meldt een retour aan binnen de eigen organisatie. Zet organisatie_id en medewerker_id op de eigen waarden. */
export async function meldRetour(input: {
  orderId: string | null;
  reden: string;
}): Promise<{ ok: boolean; error?: string }> {
  const sb = await getServerSupabase();
  if (!sb) return { ok: false, error: 'Portaal niet geconfigureerd' };
  const toegang = await getMijnToegang();
  if (!toegang.organisatieId) return { ok: false, error: 'Geen organisatie gekoppeld' };
  const { error } = await sb.from('retouren').insert({
    organisatie_id: toegang.organisatieId,
    medewerker_id: toegang.medewerkerId,
    order_id: input.orderId,
    reden: input.reden,
    status: 'aangemeld',
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Klachten en vragen van de eigen organisatie, nieuwste eerst. RLS scoopt op org. */
export async function getMijnKlachten(): Promise<Klacht[]> {
  const sb = await getServerSupabase();
  if (!sb) return [];
  const { data } = await sb
    .from('klachten')
    .select('id, order_id, soort, omschrijving, status, antwoord, created_at, orders(ordernummer)')
    .order('created_at', { ascending: false });
  const rijen =
    (data as unknown as {
      id: string;
      order_id: string | null;
      soort: KlachtSoort;
      omschrijving: string;
      status: KlachtStatus;
      antwoord: string | null;
      created_at: string;
      orders: { ordernummer: string | null } | null;
    }[]) ?? [];
  return rijen.map((k) => ({
    id: k.id,
    order_id: k.order_id,
    soort: k.soort,
    omschrijving: k.omschrijving,
    status: k.status,
    antwoord: k.antwoord,
    created_at: k.created_at,
    ordernummer: k.orders?.ordernummer ?? null,
  }));
}

/** Meldt een vraag of klacht aan binnen de eigen organisatie. Zet organisatie_id en medewerker_id op de eigen waarden. */
export async function meldKlacht(input: {
  orderId: string | null;
  soort: KlachtSoort;
  omschrijving: string;
}): Promise<{ ok: boolean; error?: string }> {
  const sb = await getServerSupabase();
  if (!sb) return { ok: false, error: 'Portaal niet geconfigureerd' };
  const toegang = await getMijnToegang();
  if (!toegang.organisatieId) return { ok: false, error: 'Geen organisatie gekoppeld' };
  const { error } = await sb.from('klachten').insert({
    organisatie_id: toegang.organisatieId,
    medewerker_id: toegang.medewerkerId,
    order_id: input.orderId,
    soort: input.soort,
    omschrijving: input.omschrijving,
    status: 'open',
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
