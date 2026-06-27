'use server';

import { redirect } from 'next/navigation';
import { dashAuthed, getHuidigeAdmin } from '@/lib/kms/adminClient';
import { keurGoedVerzoek, wijsAfVerzoek } from '@/lib/kms/medewerkerVerzoeken';

/**
 * Acties voor het goedkeuren/afwijzen van medewerker-wijzigingsverzoeken.
 * Alles draait achter de dashboard-login; zonder toegang sturen we terug naar /dashboard.
 */

async function huidigeNaam(): Promise<string> {
  const admin = await getHuidigeAdmin();
  return admin?.naam?.trim() || 'Frederiks';
}

export async function keurGoedActie(formData: FormData): Promise<void> {
  if (!(await dashAuthed())) redirect('/dashboard');
  const id = String(formData.get('id') || '').trim();
  if (!id) redirect('/dashboard/medewerker-verzoeken');
  const doorWie = await huidigeNaam();
  await keurGoedVerzoek(id, doorWie);
  redirect('/dashboard/medewerker-verzoeken?ok=status');
}

export async function wijsAfActie(formData: FormData): Promise<void> {
  if (!(await dashAuthed())) redirect('/dashboard');
  const id = String(formData.get('id') || '').trim();
  if (!id) redirect('/dashboard/medewerker-verzoeken');
  const notitie = String(formData.get('notitie') || '').trim();
  const doorWie = await huidigeNaam();
  await wijsAfVerzoek(id, doorWie, notitie || undefined);
  redirect('/dashboard/medewerker-verzoeken?ok=status');
}
