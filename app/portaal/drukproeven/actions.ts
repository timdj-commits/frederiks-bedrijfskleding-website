'use server';
import { redirect } from 'next/navigation';
import { getPortaalUser } from '@/lib/portaal/queries';
import { getMijnToegang } from '@/lib/portaal/team';
import { getServerSupabase } from '@/lib/portaal/supabaseServer';
import { verwerkDrukproefGoedkeuring } from '@/lib/kms/drukproeven';

/**
 * Beslist een drukproef vanuit het portaal: goedkeuren of afkeuren met een opmerking.
 * Alleen een beheerder of leidinggevende mag dit. RLS borgt dat het de eigen org is.
 */
export async function beslisDrukproefPortaalActie(formData: FormData) {
  const user = await getPortaalUser();
  if (!user) redirect('/portaal/login');

  const toegang = await getMijnToegang();
  if (toegang.rol !== 'beheerder' && toegang.rol !== 'leidinggevende') {
    redirect('/portaal/drukproeven');
  }

  const id = String(formData.get('id') ?? '').trim();
  const besluit = String(formData.get('besluit') ?? '').trim();
  const opmerking = String(formData.get('opmerking') ?? '').trim();
  if (!id || (besluit !== 'akkoord' && besluit !== 'afkeuren')) {
    redirect('/portaal/drukproeven');
  }

  const sb = await getServerSupabase();
  if (!sb) redirect('/portaal/drukproeven');

  await sb
    .from('drukproeven')
    .update({
      status: besluit === 'akkoord' ? 'goedgekeurd' : 'afgekeurd',
      opmerking: opmerking || null,
      behandeld_op: new Date().toISOString(),
    })
    .eq('id', id);

  // Hangt de drukproef aan een order, dan zet een goedkeuring die order door naar productie.
  if (besluit === 'akkoord') await verwerkDrukproefGoedkeuring(id);

  redirect('/portaal/drukproeven?ok=opgeslagen');
}
