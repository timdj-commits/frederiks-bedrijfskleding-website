'use server';
import { redirect } from 'next/navigation';
import { getPortaalUser, getMijnOrganisatie, getKledinglijn, maakMedewerker, verwijderMedewerker, zetMaat, zetBudget } from '@/lib/portaal/queries';

async function guardOrg() {
  const user = await getPortaalUser();
  if (!user) return null;
  return await getMijnOrganisatie();
}

export async function nieuweMedewerker(formData: FormData) {
  const org = await guardOrg();
  if (!org) redirect('/portaal/login');
  const naam = String(formData.get('naam') ?? '').trim();
  const functie = String(formData.get('functie') ?? '').trim();
  if (naam) await maakMedewerker(org.id, naam, functie);
  redirect('/portaal/medewerkers');
}

export async function verwijderMedewerkerAction(formData: FormData) {
  const org = await guardOrg();
  if (!org) redirect('/portaal/login');
  const id = String(formData.get('id') ?? '');
  if (id) await verwijderMedewerker(id);
  redirect('/portaal/medewerkers');
}

export async function bewaarBudget(formData: FormData) {
  const org = await guardOrg();
  if (!org) redirect('/portaal/login');
  const id = String(formData.get('medewerker_id') ?? '');
  const ruw = String(formData.get('budget') ?? '').replace(/[^0-9.,]/g, '').replace(',', '.');
  const budget = ruw === '' ? null : Number(ruw);
  if (id) await zetBudget(id, budget);
  redirect('/portaal/medewerkers');
}

export async function bewaarMaten(formData: FormData) {
  const org = await guardOrg();
  if (!org) redirect('/portaal/login');
  const medewerkerId = String(formData.get('medewerker_id') ?? '');
  if (!medewerkerId) redirect('/portaal/medewerkers');
  const items = await getKledinglijn();
  for (const it of items) {
    const maat = String(formData.get(`maat_${it.id}`) ?? '').trim();
    await zetMaat(medewerkerId, it.id, maat);
  }
  redirect('/portaal/medewerkers?bewaard=1');
}
