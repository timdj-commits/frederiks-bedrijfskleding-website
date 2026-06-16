import { kmsAdmin } from '@/lib/kms/adminClient';

/**
 * Bulk-import voor het KMS. Plak CSV (puntkomma of komma) in een textarea,
 * eerste regel zijn de kolomkoppen. Per regel een insert via kmsAdmin.
 * Alleen server-side gebruiken, altijd achter dashAuthed().
 */

export type ImportResultaat = {
  aangemaakt: number;
  overgeslagen: number;
  fouten: string[];
};

/** Eenvoudige CSV-parser: splitst op nieuwe regels en op puntkomma OF komma. */
export function parseCsv(csv: string): { koppen: string[]; rijen: string[][] } {
  const regels = csv
    .split(/\r?\n/)
    .map((r) => r.trim())
    .filter((r) => r.length > 0);
  if (regels.length === 0) return { koppen: [], rijen: [] };

  const splitsOp = (regel: string): string[] => {
    const scheiding = regel.includes(';') ? ';' : ',';
    return regel.split(scheiding).map((v) => v.trim());
  };

  const koppen = splitsOp(regels[0]).map((k) => k.toLowerCase());
  const rijen = regels.slice(1).map(splitsOp);
  return { koppen, rijen };
}

/** Maakt per kolomkop een index, zodat de volgorde flexibel mag zijn. */
function kolomIndex(koppen: string[]): Record<string, number> {
  const idx: Record<string, number> = {};
  koppen.forEach((k, i) => {
    if (!(k in idx)) idx[k] = i;
  });
  return idx;
}

function veld(rij: string[], idx: Record<string, number>, ...namen: string[]): string {
  for (const n of namen) {
    const i = idx[n];
    if (i !== undefined && rij[i] !== undefined) {
      const v = rij[i].trim();
      if (v) return v;
    }
  }
  return '';
}

export async function importeerMedewerkers(orgId: string, csv: string): Promise<ImportResultaat> {
  const res: ImportResultaat = { aangemaakt: 0, overgeslagen: 0, fouten: [] };
  const sb = kmsAdmin();
  if (!sb) {
    res.fouten.push('Database niet gekoppeld.');
    return res;
  }
  if (!orgId) {
    res.fouten.push('Geen klant gekozen.');
    return res;
  }

  const { koppen, rijen } = parseCsv(csv);
  if (rijen.length === 0) {
    res.fouten.push('Geen regels gevonden onder de kolomkoppen.');
    return res;
  }
  const idx = kolomIndex(koppen);

  for (let i = 0; i < rijen.length; i++) {
    const rij = rijen[i];
    const regelnr = i + 2; // +1 voor kop, +1 voor 1-gebaseerd tellen
    const naam = veld(rij, idx, 'naam', 'volledige naam');
    if (!naam) {
      res.overgeslagen++;
      res.fouten.push(`Regel ${regelnr}: geen naam, overgeslagen.`);
      continue;
    }

    // Naam opsplitsen in voornaam/achternaam als die kolommen ontbreken.
    let voornaam = veld(rij, idx, 'voornaam') || null;
    let achternaam = veld(rij, idx, 'achternaam') || null;
    if (!voornaam && !achternaam) {
      const delen = naam.split(/\s+/);
      voornaam = delen[0] ?? null;
      achternaam = delen.length > 1 ? delen.slice(1).join(' ') : null;
    }

    const rij_data = {
      organisatie_id: orgId,
      naam,
      voornaam,
      achternaam,
      email: veld(rij, idx, 'email', 'e-mail') || null,
      functie: veld(rij, idx, 'functie') || null,
      personeelsnummer: veld(rij, idx, 'personeelsnummer', 'personeelsnr') || null,
      telefoon: veld(rij, idx, 'telefoon', 'telefoonnummer') || null,
    };

    const { error } = await sb.from('medewerkers').insert(rij_data);
    if (error) {
      res.overgeslagen++;
      res.fouten.push(`Regel ${regelnr} (${naam}): ${error.message}`);
    } else {
      res.aangemaakt++;
    }
  }

  return res;
}

export async function importeerProducten(csv: string): Promise<ImportResultaat> {
  const res: ImportResultaat = { aangemaakt: 0, overgeslagen: 0, fouten: [] };
  const sb = kmsAdmin();
  if (!sb) {
    res.fouten.push('Database niet gekoppeld.');
    return res;
  }

  const { koppen, rijen } = parseCsv(csv);
  if (rijen.length === 0) {
    res.fouten.push('Geen regels gevonden onder de kolomkoppen.');
    return res;
  }
  const idx = kolomIndex(koppen);

  for (let i = 0; i < rijen.length; i++) {
    const rij = rijen[i];
    const regelnr = i + 2;
    const naam = veld(rij, idx, 'naam');
    if (!naam) {
      res.overgeslagen++;
      res.fouten.push(`Regel ${regelnr}: geen naam, overgeslagen.`);
      continue;
    }

    const rij_data = {
      naam,
      merk: veld(rij, idx, 'merk') || null,
      categorie: veld(rij, idx, 'categorie') || null,
      subcategorie: veld(rij, idx, 'subcategorie') || null,
      sku: veld(rij, idx, 'sku', 'artikelnummer') || null,
      ean: veld(rij, idx, 'ean') || null,
      btw: 21,
    };

    const { error } = await sb.from('producten').insert(rij_data);
    if (error) {
      res.overgeslagen++;
      res.fouten.push(`Regel ${regelnr} (${naam}): ${error.message}`);
    } else {
      res.aangemaakt++;
    }
  }

  return res;
}
