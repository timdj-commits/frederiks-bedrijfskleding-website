import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { isPortalConfigured } from '@/lib/env';
import { getPortaalUser, getMijnOrganisatie } from '@/lib/portaal/queries';
import { getMijnToegang } from '@/lib/portaal/team';
import { getMijnRetouren, getMijnOrders, type RetourStatus } from '@/lib/portaal/service';
import PortaalNav from '../PortaalNav';
import { vraagRetour } from './actions';

export const metadata: Metadata = { title: 'Retouren', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

const veld = 'mt-2 w-full rounded-lg border border-line px-3 py-2 text-sm text-ink-900 focus:border-amber-500 focus:outline-none';
const datum = (s: string) => new Intl.DateTimeFormat('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(s));

const statusLabel: Record<RetourStatus, string> = {
  aangemeld: 'Aangemeld',
  goedgekeurd: 'Goedgekeurd',
  afgewezen: 'Afgewezen',
  verwerkt: 'Verwerkt',
};

function StatusBadge({ status }: { status: RetourStatus }) {
  const label = statusLabel[status] ?? status;
  const toon =
    status === 'goedgekeurd' || status === 'verwerkt'
      ? 'border-green-300 bg-green-50 text-green-800'
      : status === 'afgewezen'
        ? 'border-line bg-cream text-warm'
        : 'border-amber-300 bg-amber-50 text-amber-700';
  return <span className={`inline-block rounded-full border px-3 py-1 text-xs font-semibold ${toon}`}>{label}</span>;
}

export default async function Retouren({ searchParams }: { searchParams: Promise<{ ok?: string; leeg?: string; fout?: string }> }) {
  if (!isPortalConfigured) {
    return (
      <main className="container-x py-20">
        <div className="mx-auto max-w-xl rounded-2xl border border-line bg-white p-8 shadow-soft">
          <h1 className="font-display text-2xl font-extrabold text-ink-900">Klantportaal nog niet actief</h1>
          <p className="mt-3 text-sm text-warm">Het portaal staat nog niet aan. Neem contact op met Frederiks Bedrijfskleding.</p>
        </div>
      </main>
    );
  }

  const user = await getPortaalUser();
  if (!user) redirect('/portaal/login');

  const org = await getMijnOrganisatie();
  if (!org) {
    return (
      <main className="container-x py-20">
        <div className="mx-auto max-w-xl rounded-2xl border border-line bg-white p-8 shadow-soft">
          <h1 className="font-display text-2xl font-extrabold text-ink-900">Je account is nog niet gekoppeld</h1>
          <p className="mt-3 text-sm text-warm">Je bent ingelogd als {user.email}, maar dit adres hangt nog niet aan een bedrijf. Neem contact op met Frederiks Bedrijfskleding.</p>
        </div>
      </main>
    );
  }

  const sp = await searchParams;
  const [retouren, orders, toegang] = await Promise.all([getMijnRetouren(), getMijnOrders(), getMijnToegang()]);

  return (
    <main className="container-x py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-600">Klantportaal</p>
          <h1 className="font-display text-3xl font-extrabold text-ink-900">Retouren</h1>
        </div>
      </div>
      <PortaalNav rol={toegang.rol} actief="/portaal/retouren" />

      <p className="mt-6 max-w-2xl text-sm text-warm">Meld een retour aan voor kleding die je terug wilt sturen. We beoordelen je aanmelding en sturen je het retouradres met de juiste instructies.</p>

      {sp?.ok && (
        <div className="mt-6 rounded-xl border border-green-300 bg-green-50 p-4 text-sm text-green-800">
          Je retour is aangemeld. We nemen het in behandeling en laten je het retouradres weten.
        </div>
      )}
      {sp?.leeg && (
        <div className="mt-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-ink-800">
          Vul kort een reden in zodat we de retour kunnen beoordelen.
        </div>
      )}
      {sp?.fout && (
        <div className="mt-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-ink-800">
          Er ging iets mis bij het aanmelden. Probeer het zo nog eens of bel ons even.
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div>
          <div className="rounded-xl border border-line bg-white p-5 shadow-soft">
            <h2 className="font-display text-lg font-extrabold text-ink-900">Retour aanmelden</h2>
            <form action={vraagRetour} className="mt-4">
              <label htmlFor="order_id" className="block text-sm font-semibold text-ink-900">Bestelling (optioneel)</label>
              <select id="order_id" name="order_id" className={veld} defaultValue="">
                <option value="">Geen specifieke bestelling</option>
                {orders.map((o) => (
                  <option key={o.id} value={o.id}>{o.ordernummer ? `Order ${o.ordernummer}` : 'Bestelling'}</option>
                ))}
              </select>

              <label htmlFor="reden" className="mt-4 block text-sm font-semibold text-ink-900">Reden</label>
              <textarea id="reden" name="reden" rows={4} required placeholder="Bijvoorbeeld een verkeerde maat of een beschadigd kledingstuk." className={veld} />

              <button type="submit" className="btn-primary mt-4 w-full justify-center">Retour aanmelden</button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          {retouren.length === 0 ? (
            <p className="text-sm text-warm">Je hebt nog geen retouren aangemeld.</p>
          ) : (
            <div className="space-y-5">
              {retouren.map((r) => (
                <div key={r.id} className="rounded-xl border border-line bg-white p-6 shadow-soft">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-ink-900">
                      {r.ordernummer ? `Order ${r.ordernummer}` : 'Zonder bestelling'} {"·"} {datum(r.created_at)}
                    </p>
                    <StatusBadge status={r.status} />
                  </div>

                  {r.reden && (
                    <p className="mt-3 text-sm text-ink-800"><span className="font-semibold">Reden:</span> {r.reden}</p>
                  )}

                  {r.retouradres && (
                    <p className="mt-4 rounded-lg bg-cream px-4 py-3 text-sm text-warm"><span className="font-semibold text-ink-800">Retouradres:</span> {r.retouradres}</p>
                  )}
                  {r.instructie && (
                    <p className="mt-2 rounded-lg bg-cream px-4 py-3 text-sm text-warm"><span className="font-semibold text-ink-800">Instructie:</span> {r.instructie}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
