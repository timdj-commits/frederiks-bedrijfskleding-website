'use server';
import { redirect } from 'next/navigation';
import { getPortaalUser, getMijnOrganisatie } from '@/lib/portaal/queries';
import { meldKlacht, type KlachtSoort } from '@/lib/portaal/service';

export async function vraagKlacht(formData: FormData) {
  const user = await getPortaalUser();
  if (!user) redirect('/portaal/login');
  const org = await getMijnOrganisatie();
  if (!org) redirect('/portaal');

  const orderId = String(formData.get('order_id') ?? '').trim() || null;
  const soortRuw = String(formData.get('soort') ?? '').trim();
  const soort: KlachtSoort = soortRuw === 'klacht' ? 'klacht' : 'vraag';
  const omschrijving = String(formData.get('omschrijving') ?? '').trim();
  if (!omschrijving) redirect('/portaal/klachten?leeg=1');

  const res = await meldKlacht({ orderId, soort, omschrijving });
  if (!res.ok) redirect('/portaal/klachten?fout=1');
  redirect('/portaal/klachten?ok=1');
}
