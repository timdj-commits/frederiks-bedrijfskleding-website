'use server';
import { redirect } from 'next/navigation';
import { dashAuthed, eisEigenaar } from '@/lib/kms/adminClient';
import { importeerMedewerkers, importeerProducten, importeerProductenLijst, type ImportResultaat } from '@/lib/kms/import';

function terug(prefix: string, res: ImportResultaat): never {
  const params = new URLSearchParams();
  params.set('soort', prefix);
  params.set('aangemaakt', String(res.aangemaakt));
  params.set('overgeslagen', String(res.overgeslagen));
  if (res.fouten.length > 0) {
    // Beperk de lengte van de querystring; toon hooguit de eerste 20 meldingen.
    params.set('fouten', res.fouten.slice(0, 20).join('||'));
  }
  redirect('/dashboard/import?' + params.toString());
}

export async function medewerkersImport(formData: FormData) {
  if (!(await dashAuthed())) redirect('/dashboard');
  await eisEigenaar();
  const orgId = String(formData.get('organisatie_id') ?? '').trim();
  const csv = String(formData.get('csv') ?? '');
  const res = await importeerMedewerkers(orgId, csv);
  terug('medewerkers', res);
}

export async function productenImport(formData: FormData) {
  if (!(await dashAuthed())) redirect('/dashboard');
  await eisEigenaar();
  const csv = String(formData.get('csv') ?? '');
  const res = await importeerProducten(csv);
  terug('producten', res);
}

export async function productenLijstImport(formData: FormData) {
  if (!(await dashAuthed())) redirect('/dashboard');
  await eisEigenaar();
  // CSV kan uit het tekstveld komen of uit een geupload bestand.
  const geplakt = String(formData.get('csv') ?? '');
  let csv = geplakt;
  const bestand = formData.get('bestand');
  if ((!csv || csv.trim().length === 0) && bestand instanceof File && bestand.size > 0) {
    csv = await bestand.text();
  }

  const res = await importeerProductenLijst(csv);

  const params = new URLSearchParams();
  params.set('soort', 'lijst');
  // We hergebruiken aangemaakt/overgeslagen voor het resultaatblok en geven de
  // gedetailleerde tellingen mee als losse parameters.
  params.set('aangemaakt', String(res.productenAangemaakt));
  params.set('overgeslagen', String(res.overgeslagen));
  params.set('prod_hergebruikt', String(res.productenHergebruikt));
  params.set('varianten', String(res.variantenAangemaakt));
  if (res.fouten.length > 0) {
    params.set('fouten', res.fouten.slice(0, 20).join('||'));
  }
  redirect('/dashboard/import?' + params.toString());
}
