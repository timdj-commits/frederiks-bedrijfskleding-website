import { kmsAdmin } from '@/lib/kms/adminClient';

/**
 * Data-access voor het assortiment per klant: welke producten een organisatie mag bestellen
 * en met welk verstrekkingstype (budget, periodiek gratis, altijd gratis of punten).
 * Alle queries via kmsAdmin() (service-role, omzeilt RLS). Alleen server-side gebruiken,
 * altijd achter dashAuthed().
 */

export const VERSTREKKING_TYPES = ['budget', 'periodiek_gratis', 'altijd_gratis', 'punten'] as const;
export type VerstrekkingType = (typeof VERSTREKKING_TYPES)[number];

export const PERIODE_TYPES = ['maand', 'kwartaal', 'jaar'] as const;
export type Periode = (typeof PERIODE_TYPES)[number];

/** Een regel uit de assortiment-tabel met de verstrekkingsinstellingen. */
export type AssortimentRegel = {
  id: string;
  organisatie_id: string;
  product_id: string;
  afdeling_id: string | null;
  medewerker_id: string | null;
  toegestaan: boolean;
  verstrekking_type: VerstrekkingType;
  gratis_per_periode: number | null;
  periode: Periode;
};

/** Een product met of het in het assortiment van de organisatie zit en de verstrekkingsinstellingen. */
export type AssortimentProduct = {
  product_id: string;
  naam: string;
  merk: string | null;
  in_assortiment: boolean;
  assortiment_id: string | null;
  toegestaan: boolean;
  verstrekking_type: VerstrekkingType;
  gratis_per_periode: number | null;
  periode: Periode;
};

function normaliseerType(v: string | null): VerstrekkingType {
  return (VERSTREKKING_TYPES as readonly string[]).includes(v ?? '')
    ? (v as VerstrekkingType)
    : 'budget';
}

function normaliseerPeriode(v: string | null): Periode {
  return (PERIODE_TYPES as readonly string[]).includes(v ?? '') ? (v as Periode) : 'jaar';
}

/** Alle producten met of ze in het assortiment van deze organisatie zitten en hun verstrekkingsinstellingen. */
export async function listAssortiment(orgId: string): Promise<AssortimentProduct[]> {
  const sb = kmsAdmin();
  if (!sb) return [];

  const [{ data: producten }, { data: regels }] = await Promise.all([
    sb.from('producten').select('id, naam, merk').eq('actief', true).order('naam'),
    sb
      .from('assortiment')
      .select('id, product_id, toegestaan, verstrekking_type, gratis_per_periode, periode')
      .eq('organisatie_id', orgId),
  ]);

  const prodLijst = (producten as { id: string; naam: string; merk: string | null }[]) ?? [];
  const regelLijst =
    (regels as {
      id: string;
      product_id: string;
      toegestaan: boolean;
      verstrekking_type: string | null;
      gratis_per_periode: number | null;
      periode: string | null;
    }[]) ?? [];

  const perProduct = new Map<string, (typeof regelLijst)[number]>();
  for (const r of regelLijst) if (!perProduct.has(r.product_id)) perProduct.set(r.product_id, r);

  return prodLijst.map((p) => {
    const r = perProduct.get(p.id);
    return {
      product_id: p.id,
      naam: p.naam,
      merk: p.merk,
      in_assortiment: Boolean(r),
      assortiment_id: r?.id ?? null,
      toegestaan: r ? Boolean(r.toegestaan) : true,
      verstrekking_type: normaliseerType(r?.verstrekking_type ?? null),
      gratis_per_periode: r?.gratis_per_periode ?? null,
      periode: normaliseerPeriode(r?.periode ?? null),
    };
  });
}

/** Alle actieve producten voor de keuze (id, naam, merk). */
export async function listProducten(): Promise<{ id: string; naam: string; merk: string | null }[]> {
  const sb = kmsAdmin();
  if (!sb) return [];
  const { data } = await sb.from('producten').select('id, naam, merk').eq('actief', true).order('naam');
  return (data as { id: string; naam: string; merk: string | null }[]) ?? [];
}

/**
 * Zet een product in of uit het assortiment van een organisatie.
 * Aan: maakt een assortimentregel aan als die nog niet bestaat (standaard verstrekking 'budget').
 * Uit: verwijdert alle regels van dit product voor deze organisatie.
 */
export async function zetInAssortiment(orgId: string, productId: string, aan: boolean): Promise<boolean> {
  const sb = kmsAdmin();
  if (!sb) return false;

  if (!aan) {
    const { error } = await sb
      .from('assortiment')
      .delete()
      .eq('organisatie_id', orgId)
      .eq('product_id', productId);
    return !error;
  }

  // Bestaat er al een regel, dan niets te doen.
  const { data: bestaand } = await sb
    .from('assortiment')
    .select('id')
    .eq('organisatie_id', orgId)
    .eq('product_id', productId)
    .limit(1)
    .maybeSingle();
  if (bestaand) return true;

  const { error } = await sb.from('assortiment').insert({
    organisatie_id: orgId,
    product_id: productId,
    toegestaan: true,
    verstrekking_type: 'budget',
    periode: 'jaar',
  });
  return !error;
}

/** Velden die je voor een verstrekking kunt zetten. */
export type VerstrekkingVelden = {
  verstrekking_type: VerstrekkingType;
  gratis_per_periode: number | null;
  periode: Periode;
};

/**
 * Werkt de verstrekkingsinstellingen van een product in het assortiment bij.
 * Kan op assortiment-id of op de combinatie organisatie + product.
 * Bestaat er nog geen regel (bij org+product), dan wordt er een aangemaakt.
 */
export async function zetVerstrekking(
  ref: { assortimentId: string } | { orgId: string; productId: string },
  velden: VerstrekkingVelden,
): Promise<boolean> {
  const sb = kmsAdmin();
  if (!sb) return false;

  const schoon: VerstrekkingVelden = {
    verstrekking_type: normaliseerType(velden.verstrekking_type),
    // Een aantal heeft alleen betekenis bij periodiek gratis.
    gratis_per_periode:
      velden.verstrekking_type === 'periodiek_gratis'
        ? velden.gratis_per_periode != null && velden.gratis_per_periode >= 0
          ? Math.floor(velden.gratis_per_periode)
          : 0
        : null,
    periode: normaliseerPeriode(velden.periode),
  };

  if ('assortimentId' in ref) {
    const { error } = await sb.from('assortiment').update(schoon).eq('id', ref.assortimentId);
    return !error;
  }

  const { data: bestaand } = await sb
    .from('assortiment')
    .select('id')
    .eq('organisatie_id', ref.orgId)
    .eq('product_id', ref.productId)
    .limit(1)
    .maybeSingle();

  if (bestaand) {
    const { error } = await sb
      .from('assortiment')
      .update(schoon)
      .eq('id', (bestaand as { id: string }).id);
    return !error;
  }

  const { error } = await sb.from('assortiment').insert({
    organisatie_id: ref.orgId,
    product_id: ref.productId,
    toegestaan: true,
    ...schoon,
  });
  return !error;
}
