'use server';
import { redirect } from 'next/navigation';
import { dashAuthed } from '@/lib/kms/adminClient';
import { importeerMedewerkers, importeerProducten, type ImportResultaat } from '@/lib/kms/import';

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
  const orgId = String(formData.get('organisatie_id') ?? '').trim();
  const csv = String(formData.get('csv') ?? '');
  const res = await importeerMedewerkers(orgId, csv);
  terug('medewerkers', res);
}

export async function productenImport(formData: FormData) {
  if (!(await dashAuthed())) redirect('/dashboard');
  const csv = String(formData.get('csv') ?? '');
  const res = await importeerProducten(csv);
  terug('producten', res);
}
