import { getServerSupabase } from './supabaseServer';

export type WebshopVariant = {
  id: string;
  product_id: string;
  maat: string | null;
  kleur: string | null;
  verkoopprijs: number | null;
  meerprijs: number | null;
  voorraad: number | null;
  actief: boolean;
};

export type WebshopProduct = {
  id: string;
  naam: string;
  omschrijving: string | null;
  merk: string | null;
  categorie: string | null;
  btw: number | null;
  afbeeldingen: string[] | null;
  varianten: WebshopVariant[];
};

export type WebshopMedewerker = {
  id: string;
  naam: string | null;
  voornaam: string | null;
  achternaam: string | null;
  email: string | null;
  functie: string | null;
  budget: number | null;
  budget_type: 'euro' | 'punten';
  startbudget: number | null;
  productbudget: number | null;
  buiten_budget_toegestaan: boolean;
  vestiging_id: string | null;
  actief: boolean;
};

export type WebshopOrg = {
  id: string;
  naam: string;
  budget_actief: boolean;
  goedkeuren_bestellingen: boolean;
  min_bestelbedrag: number | null;
  max_bestelbedrag: number | null;
  toon_voorraad: boolean;
  gebruik_referentienr: boolean;
  opmerking_bij_bestelling: boolean;
  verzendkosten: number | null;
};

/** Voorkeursmaat per product voor een medewerker. */
export type Voorkeursmaat = {
  product_id: string;
  voorkeursmaat: string | null;
  plus_minus_toegestaan: boolean;
};

export type PakketProductRegel = {
  product_id: string;
  variant_id: string | null;
  aantal: number;
  product_naam: string;
  variant_maat: string | null;
  variant_kleur: string | null;
};

export type WebshopPakket = {
  id: string;
  naam: string;
  soort: 'start' | 'regulier';
  pakketprijs: number | null;
  buiten_budget: boolean;
  actief: boolean;
  producten: PakketProductRegel[];
};

export type WebshopOrder = {
  id: string;
  status: string | null;
  goedkeuring_status: string | null;
  bedrag: number | null;
  notitie: string | null;
  created_at: string;
  medewerker_id: string | null;
  aangevraagd_door: string | null;
};

export type BestelRegelInput = {
  product_id: string;
  variant_id: string;
  item_naam: string;
  maat: string | null;
  kleur: string | null;
  aantal: number;
  stukprijs: number;
};

/** De organisatie van de ingelogde gebruiker, met budget- en goedkeurinstellingen. RLS borgt de juiste org. */
export async function getMijnWebshopOrganisatie(): Promise<WebshopOrg | null> {
  const sb = await getServerSupabase();
  if (!sb) return null;
  const { data } = await sb
    .from('organisaties')
    .select(
      'id, naam, budget_actief, goedkeuren_bestellingen, min_bestelbedrag, max_bestelbedrag, toon_voorraad, gebruik_referentienr, opmerking_bij_bestelling, verzendkosten',
    )
    .limit(1)
    .maybeSingle();
  return (data as WebshopOrg) ?? null;
}

/** Alle producten in het assortiment van de eigen organisatie, met hun actieve varianten. RLS filtert op assortiment. */
export async function getAssortiment(): Promise<WebshopProduct[]> {
  const sb = await getServerSupabase();
  if (!sb) return [];
  const { data: producten } = await sb
    .from('producten')
    .select('id, naam, omschrijving, merk, categorie, btw, afbeeldingen')
    .order('naam');
  const lijst = (producten as Omit<WebshopProduct, 'varianten'>[]) ?? [];
  if (lijst.length === 0) return [];

  const ids = lijst.map((p) => p.id);
  const { data: varianten } = await sb
    .from('product_varianten')
    .select('id, product_id, maat, kleur, verkoopprijs, meerprijs, voorraad, actief')
    .in('product_id', ids)
    .eq('actief', true);
  const vlist = (varianten as WebshopVariant[]) ?? [];

  return lijst.map((p) => ({
    ...p,
    varianten: vlist.filter((v) => v.product_id === p.id),
  }));
}

/** Zoekt de medewerker waarvan het e-mailadres gelijk is aan dat van de ingelogde gebruiker. Kan null zijn. */
export async function getMijnMedewerker(): Promise<WebshopMedewerker | null> {
  const sb = await getServerSupabase();
  if (!sb) return null;
  const { data: auth } = await sb.auth.getUser();
  const email = auth.user?.email;
  if (!email) return null;
  const { data } = await sb
    .from('medewerkers')
    .select(
      'id, naam, voornaam, achternaam, email, functie, budget, budget_type, startbudget, productbudget, buiten_budget_toegestaan, vestiging_id, actief',
    )
    .ilike('email', email)
    .limit(1)
    .maybeSingle();
  return (data as WebshopMedewerker) ?? null;
}

/** Alle actieve medewerkers van de eigen organisatie. Voor de keuze als de gebruiker geen eigen match heeft. */
export async function getWebshopMedewerkers(): Promise<WebshopMedewerker[]> {
  const sb = await getServerSupabase();
  if (!sb) return [];
  const { data } = await sb
    .from('medewerkers')
    .select(
      'id, naam, voornaam, achternaam, email, functie, budget, budget_type, startbudget, productbudget, buiten_budget_toegestaan, vestiging_id, actief',
    )
    .eq('actief', true)
    .order('naam');
  return (data as WebshopMedewerker[]) ?? [];
}

/** Som van order.bedrag voor een medewerker (al bestelde waarde). */
export async function getBudgetVerbruik(medewerkerId: string): Promise<number> {
  const sb = await getServerSupabase();
  if (!sb) return 0;
  const { data } = await sb
    .from('orders')
    .select('bedrag')
    .eq('medewerker_id', medewerkerId);
  return ((data as { bedrag: number | null }[]) ?? []).reduce((sum, r) => sum + (Number(r.bedrag) || 0), 0);
}

/** Voorkeursmaten van een medewerker als map product_id -> { voorkeursmaat, plus_minus_toegestaan }. RLS borgt de scope. */
export async function getVoorkeursmaten(
  medewerkerId: string,
): Promise<Record<string, { voorkeursmaat: string | null; plus_minus_toegestaan: boolean }>> {
  const sb = await getServerSupabase();
  if (!sb) return {};
  const { data } = await sb
    .from('medewerker_maten')
    .select('product_id, voorkeursmaat, plus_minus_toegestaan')
    .eq('medewerker_id', medewerkerId);
  const map: Record<string, { voorkeursmaat: string | null; plus_minus_toegestaan: boolean }> = {};
  ((data as Voorkeursmaat[]) ?? []).forEach((r) => {
    map[r.product_id] = {
      voorkeursmaat: r.voorkeursmaat,
      plus_minus_toegestaan: Boolean(r.plus_minus_toegestaan),
    };
  });
  return map;
}

/** Actieve pakketten van de eigen organisatie met hun producten. RLS filtert op de eigen org. */
export async function getPakketten(): Promise<WebshopPakket[]> {
  const sb = await getServerSupabase();
  if (!sb) return [];
  const { data: pakketten } = await sb
    .from('pakketten')
    .select('id, naam, soort, pakketprijs, buiten_budget, actief')
    .eq('actief', true)
    .order('soort')
    .order('naam');
  const lijst = (pakketten as Omit<WebshopPakket, 'producten'>[]) ?? [];
  if (lijst.length === 0) return [];

  const ids = lijst.map((p) => p.id);
  const { data: producten } = await sb
    .from('pakket_producten')
    .select('pakket_id, product_id, variant_id, aantal, product:producten(naam), variant:product_varianten(maat, kleur)')
    .in('pakket_id', ids);
  const rows =
    (producten as unknown as {
      pakket_id: string;
      product_id: string;
      variant_id: string | null;
      aantal: number;
      product: { naam: string } | null;
      variant: { maat: string | null; kleur: string | null } | null;
    }[]) ?? [];

  return lijst.map((p) => ({
    ...p,
    producten: rows
      .filter((r) => r.pakket_id === p.id)
      .map((r) => ({
        product_id: r.product_id,
        variant_id: r.variant_id,
        aantal: Number(r.aantal) || 1,
        product_naam: r.product?.naam ?? 'Onbekend product',
        variant_maat: r.variant?.maat ?? null,
        variant_kleur: r.variant?.kleur ?? null,
      })),
  }));
}

/** Bestelhistorie van de eigen organisatie, recent eerst. RLS borgt de juiste org. */
export async function getWebshopOrders(): Promise<WebshopOrder[]> {
  const sb = await getServerSupabase();
  if (!sb) return [];
  const { data } = await sb
    .from('orders')
    .select('id, status, goedkeuring_status, bedrag, notitie, created_at, medewerker_id, aangevraagd_door')
    .order('created_at', { ascending: false })
    .limit(50);
  return (data as WebshopOrder[]) ?? [];
}

/** Extra gegevens en instellingen die de bestelling sturen. Alles optioneel: ontbreekt iets, dan valt de check weg. */
export type BestelOpties = {
  /** De medewerker waarvoor besteld wordt, met budgetvelden. Nodig voor budget- en productbudgetcheck. */
  medewerker?: WebshopMedewerker | null;
  /** Al verbruikt budget (som van eerdere orders). */
  verbruikt?: number;
  /** Referentienummer, alleen meegestuurd als de org dit gebruikt. */
  referentienr?: string | null;
};

/** Resultaat van een handhavingscheck. ok=false betekent geblokkeerd, met een nette reden. */
type HandhaafResultaat = { ok: true } | { ok: false; reden: string };

const euroFmt = (n: number) =>
  new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(n || 0);

/**
 * Controleert min/max bestelbedrag, budget en productbudget voor een wagentotaal.
 * Geeft een duidelijke Nederlandstalige reden terug als iets de bestelling blokkeert.
 * Ontbrekende instellingen worden overgeslagen, zodat het huidige gedrag behouden blijft.
 */
export function handhaafBestelling(
  org: WebshopOrg,
  totaal: number,
  aantalStuks: number,
  opts: BestelOpties = {},
): HandhaafResultaat {
  // Min/max bestelbedrag van de organisatie.
  if (org.min_bestelbedrag != null && totaal < Number(org.min_bestelbedrag)) {
    return {
      ok: false,
      reden: `Het minimale bestelbedrag is ${euroFmt(Number(org.min_bestelbedrag))}. Voeg meer toe aan je winkelwagen.`,
    };
  }
  if (org.max_bestelbedrag != null && totaal > Number(org.max_bestelbedrag)) {
    return {
      ok: false,
      reden: `Het maximale bestelbedrag is ${euroFmt(Number(org.max_bestelbedrag))}. Haal iets uit je winkelwagen.`,
    };
  }

  const mw = opts.medewerker;
  if (org.budget_actief && mw) {
    // Budget: blokkeer alleen als buiten budget niet is toegestaan en het totaal het resterende overschrijdt.
    if (mw.budget != null && !mw.buiten_budget_toegestaan) {
      const resterend = Number(mw.budget) - (opts.verbruikt ?? 0);
      if (totaal > resterend) {
        const label =
          mw.budget_type === 'punten'
            ? `${Math.round(resterend)} punten`
            : euroFmt(resterend);
        return {
          ok: false,
          reden: `Het totaal is hoger dan je resterende budget (${label}). Pas de winkelwagen aan.`,
        };
      }
    }
    // Productbudget: maximaal aantal stuks per bestelling, als ingesteld.
    if (mw.productbudget != null && aantalStuks > Number(mw.productbudget)) {
      return {
        ok: false,
        reden: `Je mag maximaal ${mw.productbudget} stuks per bestelling kiezen. Nu staan er ${aantalStuks} in je winkelwagen.`,
      };
    }
  }

  return { ok: true };
}

/**
 * Maakt een order plus orderregels aan. Goedkeuring en status volgen de instelling van de organisatie.
 * Voert eerst de handhaving uit (min/max bedrag, budget, productbudget) en blokkeert met een nette reden.
 * Zet vestiging_id op de vestiging van de medewerker en neemt referentienr en opmerking mee.
 */
export async function maakWebshopBestelling(
  org: WebshopOrg,
  aangevraagdDoor: string,
  medewerkerId: string | null,
  regels: BestelRegelInput[],
  notitie: string,
  opts: BestelOpties = {},
): Promise<{ ok: boolean; error?: string }> {
  const sb = await getServerSupabase();
  if (!sb) return { ok: false, error: 'Portaal niet geconfigureerd' };
  if (regels.length === 0) return { ok: false, error: 'Geen regels' };

  const bedrag = regels.reduce((sum, r) => sum + r.aantal * r.stukprijs, 0);
  const aantalStuks = regels.reduce((sum, r) => sum + r.aantal, 0);

  const check = handhaafBestelling(org, bedrag, aantalStuks, opts);
  if (!check.ok) return { ok: false, error: check.reden };

  const goedkeuringStatus = org.goedkeuren_bestellingen ? 'wacht' : 'niet_nodig';
  const status = org.goedkeuren_bestellingen ? 'concept' : 'nog_bestellen';
  const vestigingId = opts.medewerker?.vestiging_id ?? null;
  const referentienr = org.gebruik_referentienr ? opts.referentienr?.trim() || null : null;

  const { data, error } = await sb
    .from('orders')
    .insert({
      organisatie_id: org.id,
      medewerker_id: medewerkerId,
      aangevraagd_door: aangevraagdDoor,
      status,
      goedkeuring_status: goedkeuringStatus,
      bedrag,
      notitie: notitie || null,
      vestiging_id: vestigingId,
      referentienr,
    })
    .select('id')
    .single();
  if (error || !data) return { ok: false, error: error?.message ?? 'Aanmaken mislukt' };

  const orderId = (data as { id: string }).id;
  const rows = regels.map((r) => ({
    order_id: orderId,
    product_id: r.product_id,
    variant_id: r.variant_id,
    item_naam: r.item_naam,
    maat: r.maat,
    kleur: r.kleur,
    aantal: r.aantal,
    stukprijs: r.stukprijs,
  }));
  const { error: e2 } = await sb.from('orderregels').insert(rows);
  if (e2) return { ok: false, error: e2.message };
  return { ok: true };
}

/**
 * Bestelt een compleet pakket. Maakt een order met alle pakketproducten als regels en de pakketprijs als bedrag.
 * Een pakket met buiten_budget=true omzeilt de budget- en productbudgetcheck (denk aan het verplichte startpakket).
 * De min/max bestelbedrag-grens van de organisatie blijft wel gelden, tenzij het pakket buiten budget valt.
 */
export async function bestelPakket(
  pakketId: string,
  opts: {
    org: WebshopOrg;
    aangevraagdDoor: string;
    medewerkerId: string | null;
    medewerker?: WebshopMedewerker | null;
    verbruikt?: number;
    referentienr?: string | null;
    notitie?: string;
  },
): Promise<{ ok: boolean; error?: string }> {
  const sb = await getServerSupabase();
  if (!sb) return { ok: false, error: 'Portaal niet geconfigureerd' };

  // Haal het pakket en zijn producten op (RLS borgt de eigen org).
  const pakketten = await getPakketten();
  const pakket = pakketten.find((p) => p.id === pakketId);
  if (!pakket) return { ok: false, error: 'Pakket niet gevonden' };
  if (pakket.producten.length === 0) return { ok: false, error: 'Dit pakket bevat nog geen producten' };

  // Bouw de orderregels. Het ordertotaal is de pakketprijs (één vaste prijs voor het hele pakket),
  // dus de losse regels krijgen stukprijs 0; order.bedrag draagt de pakketprijs.
  const pakketprijs = pakket.pakketprijs != null ? Number(pakket.pakketprijs) : 0;
  const regels: BestelRegelInput[] = pakket.producten.map((pp) => ({
    product_id: pp.product_id,
    variant_id: pp.variant_id ?? '',
    item_naam: pp.product_naam,
    maat: pp.variant_maat,
    kleur: pp.variant_kleur,
    aantal: pp.aantal,
    stukprijs: 0,
  }));

  const { org, aangevraagdDoor, medewerkerId } = opts;
  const aantalStuks = regels.reduce((sum, r) => sum + r.aantal, 0);

  // buiten_budget-pakket: sla budget en productbudget over, maar houd min/max bestelbedrag aan.
  const handhaafOpts: BestelOpties = pakket.buiten_budget
    ? { referentienr: opts.referentienr }
    : { medewerker: opts.medewerker, verbruikt: opts.verbruikt, referentienr: opts.referentienr };
  const check = handhaafBestelling(org, pakketprijs, aantalStuks, handhaafOpts);
  if (!check.ok) return { ok: false, error: check.reden };

  const goedkeuringStatus = org.goedkeuren_bestellingen ? 'wacht' : 'niet_nodig';
  const status = org.goedkeuren_bestellingen ? 'concept' : 'nog_bestellen';
  const vestigingId = opts.medewerker?.vestiging_id ?? null;
  const referentienr = org.gebruik_referentienr ? opts.referentienr?.trim() || null : null;
  const notitie = (opts.notitie ?? '').trim() || `Pakket: ${pakket.naam}`;

  const { data, error } = await sb
    .from('orders')
    .insert({
      organisatie_id: org.id,
      medewerker_id: medewerkerId,
      aangevraagd_door: aangevraagdDoor,
      status,
      goedkeuring_status: goedkeuringStatus,
      bedrag: pakketprijs,
      notitie,
      vestiging_id: vestigingId,
      referentienr,
    })
    .select('id')
    .single();
  if (error || !data) return { ok: false, error: error?.message ?? 'Aanmaken mislukt' };

  const orderId = (data as { id: string }).id;
  const rows = regels.map((r) => ({
    order_id: orderId,
    product_id: r.product_id,
    variant_id: r.variant_id || null,
    item_naam: r.item_naam,
    maat: r.maat,
    kleur: r.kleur,
    aantal: r.aantal,
    stukprijs: r.stukprijs,
  }));
  const { error: e2 } = await sb.from('orderregels').insert(rows);
  if (e2) return { ok: false, error: e2.message };
  return { ok: true };
}
