import Link from 'next/link';
import { redirect } from 'next/navigation';
import { dashAuthed } from '@/lib/kms/adminClient';
import { formatDatum, formatGetal } from '@/lib/format';
import { listInschrijvingen } from '@/lib/kms/nieuwsbrief';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Nieuwsbrief', robots: { index: false, follow: false } };

export default async function NieuwsbriefPage() {
  if (!(await dashAuthed())) redirect('/dashboard');

  const inschrijvingen = await listInschrijvingen();

  return (
    <main className="container-x py-12">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-extrabold text-ink-900">Nieuwsbrief</h1>
        <Link href="/dashboard" className="text-sm font-semibold text-warm hover:text-ink-800">Terug naar dashboard</Link>
      </div>
      <p className="mt-2 text-sm text-warm">
        Inschrijvingen via het formulier in de footer.{' '}
        <span className="font-semibold text-ink-900">{formatGetal(inschrijvingen.length)}</span>
        {inschrijvingen.length === 1 ? ' inschrijving' : ' inschrijvingen'}.
      </p>

      {inschrijvingen.length === 0 ? (
        <p className="mt-6 rounded-xl border border-line bg-mist px-5 py-4 text-sm text-warm">
          Er zijn nog geen inschrijvingen. Zodra bezoekers zich via de footer inschrijven, verschijnen ze hier.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-white shadow-soft">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line bg-mist text-xs uppercase tracking-wide text-warm">
              <tr>
                <th className="px-4 py-3">E-mail</th>
                <th className="px-4 py-3">Naam</th>
                <th className="px-4 py-3">Bron</th>
                <th className="px-4 py-3">Datum</th>
              </tr>
            </thead>
            <tbody>
              {inschrijvingen.map((r) => (
                <tr key={r.id} className="border-b border-line">
                  <td className="px-4 py-3 text-ink-900">{r.email}</td>
                  <td className="px-4 py-3 text-warm">{r.naam || '-'}</td>
                  <td className="px-4 py-3 text-warm">{r.bron || '-'}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-warm">{formatDatum(r.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
