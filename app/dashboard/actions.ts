'use server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { env } from '@/lib/env';
import { updateLeadStatus } from '@/lib/supabase';

const DASH_COOKIE = 'fb_dash';

export async function login(formData: FormData) {
  const pw = String(formData.get('password') ?? '').trim();
  const expected = env.dashboardPassword.trim();
  if (expected && pw === expected) {
    (await cookies()).set(DASH_COOKIE, expected, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });
    redirect('/dashboard');
  }
  redirect('/dashboard?fout=1');
}

export async function logout() {
  (await cookies()).delete(DASH_COOKIE);
  redirect('/dashboard');
}

export async function setStatus(formData: FormData) {
  const auth = (await cookies()).get(DASH_COOKIE)?.value;
  if (!env.dashboardPassword || auth !== env.dashboardPassword.trim()) redirect('/dashboard');
  const id = String(formData.get('id') ?? '');
  const status = String(formData.get('status') ?? '');
  if (id && status) await updateLeadStatus(id, status);
  redirect('/dashboard');
}
