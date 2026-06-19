import { NextResponse } from 'next/server';
import { kmsAdmin } from '@/lib/kms/adminClient';
import { rateLimit, clientIp } from '@/lib/ratelimit';

export const runtime = 'nodejs';

/**
 * Nieuwsbrief-inschrijving als leadcapture. Schrijft via de service-role
 * (kmsAdmin) in nieuwsbrief_inschrijvingen (RLS aan, geen policies). Een
 * dubbele inschrijving (unieke index op lower(email)) wordt stil als succes
 * behandeld: de bezoeker hoeft niet te weten dat hij al ingeschreven stond.
 */
export async function POST(req: Request) {
  if (!rateLimit(`nieuwsbrief:${clientIp(req)}`, 5, 600_000)) {
    return NextResponse.json({ error: 'Te veel verzoeken. Probeer het later opnieuw.' }, { status: 429 });
  }

  const body = (await req.json().catch(() => null)) as
    | { email?: unknown; naam?: unknown; bron?: unknown; website?: unknown }
    | null;
  if (!body) {
    return NextResponse.json({ error: 'Ongeldige aanvraag.' }, { status: 400 });
  }

  // Honeypot: gevuld = bot, stil negeren.
  if (typeof body.website === 'string' && body.website.trim() !== '') {
    return NextResponse.json({ ok: true });
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Vul een geldig e-mailadres in.' }, { status: 422 });
  }

  const naam = typeof body.naam === 'string' && body.naam.trim() ? body.naam.trim() : null;
  const bron = typeof body.bron === 'string' && body.bron.trim() ? body.bron.trim() : null;

  const sb = kmsAdmin();
  if (!sb) {
    // Database niet gekoppeld (preview/lokaal): niet de gebruiker laten falen.
    return NextResponse.json({ ok: true });
  }

  const { error } = await sb.from('nieuwsbrief_inschrijvingen').insert({ email, naam, bron });
  if (error) {
    // 23505 = unique_violation (al ingeschreven) -> stil als succes terug.
    if (error.code === '23505') {
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: 'Inschrijven lukte niet. Probeer het later opnieuw.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
