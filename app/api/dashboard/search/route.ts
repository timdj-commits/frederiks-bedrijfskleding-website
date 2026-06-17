import { NextResponse } from 'next/server';
import { kmsAdmin, dashAuthed } from '@/lib/kms/adminClient';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Hit = { type: string; label: string; sub: string; href: string };

/** Pakt de organisatienaam uit een Supabase-join (object of array). */
function orgNaam(j: { naam: string | null } | { naam: string | null }[] | null): string {
  if (!j) return '';
  const o = Array.isArray(j) ? j[0] : j;
  return o?.naam ?? '';
}

export async function GET(req: Request) {
  if (!(await dashAuthed())) return NextResponse.json({ results: [] }, { status: 401 });
  const q = (new URL(req.url).searchParams.get('q') ?? '').trim();
  if (q.length < 2) return NextResponse.json({ results: [] });
  const sb = kmsAdmin();
  if (!sb) return NextResponse.json({ results: [] });

  const like = `%${q}%`;
  const [orgs, prods, orders, facturen] = await Promise.all([
    sb.from('organisaties').select('id, naam, plaats').or(`naam.ilike.${like},plaats.ilike.${like}`).limit(6),
    sb.from('producten').select('id, naam, merk, sku').or(`naam.ilike.${like},merk.ilike.${like},sku.ilike.${like}`).limit(6),
    sb.from('orders').select('id, ordernummer, organisaties(naam)').ilike('ordernummer', like).limit(6),
    sb.from('facturen').select('id, factuurnummer, organisaties(naam)').ilike('factuurnummer', like).limit(6),
  ]);

  const results: Hit[] = [];
  ((orgs.data as { id: string; naam: string; plaats: string | null }[]) ?? []).forEach((o) =>
    results.push({ type: 'Klant', label: o.naam, sub: o.plaats ?? '', href: `/dashboard/klanten/${o.id}` }),
  );
  ((prods.data as { id: string; naam: string; merk: string | null; sku: string | null }[]) ?? []).forEach((p) =>
    results.push({
      type: 'Product',
      label: p.naam,
      sub: [p.merk, p.sku].filter(Boolean).join(' · '),
      href: `/dashboard/producten/${p.id}`,
    }),
  );
  ((orders.data as { id: string; ordernummer: string | null; organisaties: { naam: string | null } | { naam: string | null }[] | null }[]) ?? []).forEach((o) =>
    results.push({ type: 'Order', label: o.ordernummer ?? o.id.slice(0, 8), sub: orgNaam(o.organisaties), href: `/dashboard/orders/${o.id}` }),
  );
  ((facturen.data as { id: string; factuurnummer: string | null; organisaties: { naam: string | null } | { naam: string | null }[] | null }[]) ?? []).forEach((f) =>
    results.push({ type: 'Factuur', label: f.factuurnummer ?? f.id.slice(0, 8), sub: orgNaam(f.organisaties), href: `/dashboard/facturen/${f.id}` }),
  );

  return NextResponse.json({ results });
}
