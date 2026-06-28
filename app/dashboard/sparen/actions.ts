'use server';
import { redirect } from 'next/navigation';
import { dashAuthed, eisEigenaar } from '@/lib/kms/adminClient';
import { zetSpaarInstellingen, wisselPuntenIn } from '@/lib/kms/sparen';
import { logAudit } from '@/lib/kms/audit';

export async function zetSpaarInstellingenActie(formData: FormData) {
  if (!(await dashAuthed())) redirect('/dashboard');
  await eisEigenaar();
  const actief = String(formData.get('actief') ?? '') === 'aan';
  const puntenPerEuro = Number(String(formData.get('punten_per_euro') ?? '').replace(',', '.')) || 1;
  const euroPerPunt = Number(String(formData.get('euro_per_punt') ?? '').replace(',', '.')) || 0.01;
  await zetSpaarInstellingen({ actief, puntenPerEuro, euroPerPunt });
  await logAudit('spaarinstellingen_gewijzigd', { entiteit: 'instellingen' });
  redirect('/dashboard/sparen?ok=instellingen');
}

export async function wisselPuntenInActie(formData: FormData) {
  if (!(await dashAuthed())) redirect('/dashboard');
  await eisEigenaar();
  const organisatieId = String(formData.get('organisatie_id') ?? '').trim();
  const punten = Math.floor(Number(String(formData.get('punten') ?? '').replace(',', '.')));
  const r = await wisselPuntenIn(organisatieId, punten);
  if (r.ok) {
    await logAudit('spaarpunten_ingewisseld', {
      entiteit: 'organisatie',
      entiteitId: organisatieId,
      details: { organisatie_id: organisatieId, punten },
    });
    redirect('/dashboard/sparen?ok=ingewisseld');
  }
  redirect(`/dashboard/sparen?fout=${encodeURIComponent(r.error ?? 'Mislukt')}`);
}
