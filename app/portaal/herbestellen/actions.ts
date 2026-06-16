'use server';
import { redirect } from 'next/navigation';
import { getPortaalUser, getMijnOrganisatie, getKledinglijn, getMedewerkers, maakBestelling } from '@/lib/portaal/queries';
import { sendEmail, escapeHtml } from '@/lib/email';
import { env } from '@/lib/env';

export async function vraagHerbestelling(formData: FormData) {
  const user = await getPortaalUser();
  if (!user) redirect('/portaal/login');
  const org = await getMijnOrganisatie();
  if (!org) redirect('/portaal');

  const items = await getKledinglijn();
  const notitie = String(formData.get('notitie') ?? '').trim();
  const voor = String(formData.get('voor') ?? '').trim();

  const regels: { item_naam: string; kledinglijn_item_id: string; maat: string; aantal: number }[] = [];
  let waarde = 0;
  for (const it of items) {
    const aantal = parseInt(String(formData.get(`aantal_${it.id}`) ?? '0'), 10);
    if (!Number.isFinite(aantal) || aantal <= 0) continue;
    const maat = String(formData.get(`maat_${it.id}`) ?? '').trim();
    regels.push({ item_naam: it.naam, kledinglijn_item_id: it.id, maat, aantal });
    waarde += (Number(it.richtprijs) || 0) * aantal;
  }
  if (regels.length === 0) redirect(`/portaal/herbestellen?leeg=1${voor ? `&voor=${voor}` : ''}`);

  let medewerkerNaam: string | null = null;
  if (voor) medewerkerNaam = (await getMedewerkers()).find((x) => x.id === voor)?.naam ?? null;

  const door = user.email ?? 'onbekend';
  const res = await maakBestelling(org.id, door, notitie, regels, { medewerkerId: voor || null, medewerkerNaam, waarde: waarde || null });
  if (!res.ok) redirect('/portaal/herbestellen?fout=1');

  const lijst = regels.map((r) => `- ${r.item_naam}${r.maat ? ` (maat ${r.maat})` : ''}: ${r.aantal}x`).join('<br>');
  await sendEmail({
    to: env.notifyEmail,
    subject: `Nieuwe herbestelling via portaal: ${org.naam}`,
    html: `<h3>Nieuwe herbestelling via het klantportaal</h3>
      <p><strong>Bedrijf:</strong> ${escapeHtml(org.naam)}</p>
      <p><strong>Door:</strong> ${escapeHtml(door)}</p>
      ${medewerkerNaam ? `<p><strong>Voor medewerker:</strong> ${escapeHtml(medewerkerNaam)}</p>` : ''}
      <p><strong>Geschatte waarde:</strong> &euro; ${waarde.toFixed(2)}</p>
      <p><strong>Regels:</strong><br>${lijst}</p>
      ${notitie ? `<p><strong>Opmerking:</strong> ${escapeHtml(notitie)}</p>` : ''}`,
  }).catch(() => {});

  redirect('/portaal/bestellingen?ok=1');
}
