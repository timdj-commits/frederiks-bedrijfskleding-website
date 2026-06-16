import { getServerSupabase } from './supabaseServer';

export type Huisstijl = {
  naam: string;
  kleur: string | null;
  logoUrl: string | null;
  sfeerafbeeldingUrl: string | null;
};

/** Standaard-accent uit de Frederiks-huisstijl (amber-500). */
export const STANDAARD_ACCENT = '#ec6726';

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

/** Maakt een waarde veilig om als accentkleur in inline-style te gebruiken. */
export function veiligeKleur(kleur: string | null | undefined): string {
  const k = (kleur ?? '').trim();
  return HEX.test(k) ? k : STANDAARD_ACCENT;
}

/**
 * Haalt de huisstijl van de ingelogde organisatie op (via RLS).
 * Geeft null terug als het portaal niet geconfigureerd is, de gebruiker
 * niet is ingelogd, of er geen gekoppelde organisatie is.
 */
export async function getHuisstijl(): Promise<Huisstijl | null> {
  const sb = await getServerSupabase();
  if (!sb) return null;
  const { data } = await sb
    .from('organisaties')
    .select('naam, huisstijl_kleur, portaal_logo_url, sfeerafbeelding_url')
    .limit(1)
    .maybeSingle();
  if (!data) return null;
  const row = data as {
    naam: string;
    huisstijl_kleur: string | null;
    portaal_logo_url: string | null;
    sfeerafbeelding_url: string | null;
  };
  const trim = (v: string | null) => {
    const t = (v ?? '').trim();
    return t.length > 0 ? t : null;
  };
  return {
    naam: row.naam,
    kleur: trim(row.huisstijl_kleur),
    logoUrl: trim(row.portaal_logo_url),
    sfeerafbeeldingUrl: trim(row.sfeerafbeelding_url),
  };
}
