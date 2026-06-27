'use server';
import { redirect } from 'next/navigation';
import { kmsAdmin, dashAuthed } from '@/lib/kms/adminClient';
import { aiTekst } from '@/lib/ai';

type SupabaseAdmin = NonNullable<ReturnType<typeof kmsAdmin>>;

/**
 * Onderliggende conversie-logica voor een enkele lead. Zet een lead om naar een
 * organisatie + hoofdcontact en koppelt de lead aan die organisatie. Geen
 * redirect: hergebruikbaar voor zowel de enkelvoudige als de bulk-actie.
 * Geeft het organisatie-id terug, of null als er niets te converteren viel
 * (lead niet gevonden of insert mislukt). Was de lead al gekoppeld, dan wordt
 * dat bestaande organisatie-id teruggegeven.
 */
async function converteerLeadKern(sb: SupabaseAdmin, id: string): Promise<string | null> {
  if (!id) return null;
  const { data: lead } = await sb.from('leads').select('*').eq('id', id).maybeSingle();
  const l = lead as { id: string; name: string; company: string | null; email: string | null; phone: string | null; organisatie_id: string | null } | null;
  if (!l) return null;
  if (l.organisatie_id) return l.organisatie_id;
  const { data: org } = await sb
    .from('organisaties')
    .insert({ naam: l.company || l.name, contactpersoon: l.name, email_algemeen: l.email })
    .select('id')
    .single();
  const orgId = (org as { id: string } | null)?.id;
  if (!orgId) return null;
  await sb.from('contactpersonen').insert({ organisatie_id: orgId, naam: l.name, email: l.email, telefoon: l.phone, hoofdcontact: true });
  await sb.from('leads').update({ organisatie_id: orgId }).eq('id', id);
  return orgId;
}

export async function converteerLead(formData: FormData) {
  if (!(await dashAuthed())) redirect('/dashboard');
  const id = String(formData.get('id') ?? '');
  const sb = kmsAdmin();
  if (!sb || !id) redirect('/dashboard/leads');
  const orgId = await converteerLeadKern(sb, id);
  if (!orgId) redirect('/dashboard/leads');
  redirect('/dashboard/klanten/' + orgId);
}

/**
 * Converteert meerdere aangevinkte leads in een keer naar klant. Per lead wordt
 * dezelfde kernlogica gedraaid; een fout bij een enkele lead stopt de rest niet.
 * Daarna keren we terug naar de leadslijst (met de meegegeven filter-URL).
 */
export async function bulkConverteerLeads(formData: FormData) {
  if (!(await dashAuthed())) redirect('/dashboard');
  const sb = kmsAdmin();
  const terug = String(formData.get('terug') ?? '/dashboard/leads') || '/dashboard/leads';
  if (!sb) redirect(terug);
  const ids = formData.getAll('lead_ids').map((v) => String(v)).filter(Boolean);
  for (const id of ids) {
    try {
      await converteerLeadKern(sb, id);
    } catch {
      // Een mislukte lead mag de rest van de batch niet blokkeren.
    }
  }
  const scheiding = terug.includes('?') ? '&' : '?';
  redirect(`${terug}${scheiding}ok=bijgewerkt`);
}

/**
 * Genereert met de bestaande AI-laag (Claude) een concept-opvolgmail voor een
 * lead op basis van de lead-context. Vorm is geschikt voor useActionState. Geen
 * redirect: het resultaat wordt teruggegeven zodat de beheerder het zelf kan
 * nalezen, aanpassen en versturen. De AI-key blijft volledig server-side.
 */
export async function aiOpvolgmailActie(
  _prev: { tekst?: string; error?: string } | null,
  formData: FormData,
): Promise<{ tekst?: string; error?: string }> {
  if (!(await dashAuthed())) return { error: 'Geen toegang.' };

  const naam = String(formData.get('naam') ?? '').trim();
  const bedrijf = String(formData.get('bedrijf') ?? '').trim();
  const branche = String(formData.get('branche') ?? '').trim();
  const bericht = String(formData.get('bericht') ?? '').trim();
  const status = String(formData.get('status') ?? '').trim();

  const opdracht =
    'Schrijf een korte, persoonlijke en professionele opvolg-e-mail (max 120 woorden) ' +
    'namens Frederiks Bedrijfskleding aan een lead. ' +
    `Lead: naam=${naam || 'onbekend'}, ` +
    `bedrijf=${bedrijf || 'onbekend'}, ` +
    `branche=${branche || 'onbekend'}, ` +
    `hun bericht=${bericht || 'geen bericht'}, ` +
    `status=${status || 'onbekend'}. ` +
    'Toon: vriendelijk, concreet, gericht op een vrijblijvend adviesgesprek of ' +
    'langskomen om te passen. ' +
    "Onderteken met 'Met vriendelijke groet, Frederiks Bedrijfskleding'. " +
    'Geen onderwerpregel, alleen de mailtekst.';

  const resultaat = await aiTekst(opdracht);
  if (!resultaat.ok) {
    return { error: resultaat.error ?? 'Er ging iets mis bij het genereren.' };
  }
  return { tekst: resultaat.tekst };
}
