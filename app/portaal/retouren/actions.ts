'use server';
import { redirect } from 'next/navigation';
import { getPortaalUser, getMijnOrganisatie } from '@/lib/portaal/queries';
import { meldRetour } from '@/lib/portaal/service';

export async function vraagRetour(formData: FormData) {
  const user = await getPortaalUser();
  if (!user) redirect('/portaal/login');
  const org = await getMijnOrganisatie();
  if (!org) redirect('/portaal');

  const orderId = String(formData.get('order_id') ?? '').trim() || null;
  const reden = String(formData.get('reden') ?? '').trim();
  if (!reden) redirect('/portaal/retouren?leeg=1');

  const res = await meldRetour({ orderId, reden });
  if (!res.ok) redirect('/portaal/retouren?fout=1');
  redirect('/portaal/retouren?ok=1');
}
