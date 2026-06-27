'use server';
import { redirect } from 'next/navigation';
import { getServerSupabase } from '@/lib/portaal/supabaseServer';
import { markeerMeldingenGelezen } from '@/lib/portaal/verzoeken';

export async function portaalLogout() {
  const sb = await getServerSupabase();
  if (sb) await sb.auth.signOut();
  redirect('/portaal/login');
}

export async function markeerMeldingenGelezenActie() {
  await markeerMeldingenGelezen();
  redirect('/portaal');
}
