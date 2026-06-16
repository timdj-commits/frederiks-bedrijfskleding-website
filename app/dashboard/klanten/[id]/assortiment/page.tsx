import Link from 'next/link';
import { redirect } from 'next/navigation';
import { kmsAdmin, dashAuthed } from '@/lib/kms/adminClient';
import { listAssortiment, type AssortimentProduct } from '@/lib/kms/assortiment';
import { wisselAssortiment, bewaarVerstrekking } from './actions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Assortiment', robots: { index: false, follow: false } };

const inputCls =
  'mt-1 w-full rounded-md border border-line px-3 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200';
const knopCls = 'rounded-md bg-ink-900 px-4 py-2 text-sm font-semibold text-white hover:bg-ink-800';
const wisselCls = 'rounded-md border border-line px-2.5 py-1 text-xs font-semibold text-ink-700 hover:bg-mist';

const VERSTREKKING_LABEL: Record<AssortimentProduct['verstrekking_type'], string> = {
  budget: 'Van budget af',
  periodiek_gratis: 'Periodiek gratis',
  altijd_gratis: 'Altijd gratis',
  punten: 'Punten',
};

const PERIODE_LABEL: Record<AssortimentProduct['periode'], string> = {
  maand: 'per maand',
  kwartaal: 'per kwartaal',
  jaar: 'per jaar',
};

export default async function AssortimentPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await dashAuthed())) redirect('/dashboard');
  const { id } = await params;

  const sb = kmsAdmin();
  if (!sb) {
    return (
      <main className="container-x py-20">
        <div className="mx-auto max-w-xl rounded-2xl border border-line bg-white p-8 shadow-soft">
          <h1 className="font-display text-2xl font-extrabold text-ink-900">Leaddatabase nog niet gekoppeld</h1>
          <p className="mt-3 text-sm text-warm">Zet de Supabase-omgevingsvariabelen en draai de migraties.</p>
          <Link href={`/dashboard/klanten/${id}`} className="mt-5 inline-block text-sm font-semibold text-warm hover:text-ink-800">Terug naar klant</Link>
        </div>
      </main>
    );
  }

  const [{ data: org }, producten] = await Promise.all([
    sb.from('organisaties').select('naam').eq('id', id).maybeSingle(),
    listAssortiment(id),
  ]);

  if (!org) {
    return (
      <main className="container-x py-20">
        <div className="mx-auto max-w-xl rounded-2xl border border-line bg-white p-8 shadow-soft">
          <h1 className="font-display text-2xl font-extrabold text-ink-900">Klant niet gevonden</h1>
          <p className="mt-3 text-sm text-warm">Deze klant bestaat niet of is verwijderd.</p>
          <Link href="/dashboard/klanten" className="mt-5 inline-block text-sm font-semibold text-warm hover:text-ink-800">Terug naar klanten</Link>
        </div>
      </main>
    );
  }

  const orgNaam = (org as { naam: string }).naam;
  const inAssortiment = producten.filter((p) => p.in_assortiment);

  return (
    <main className="container-x py-12">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-ink-900">Assortiment</h1>
          <p className="mt-1 text-sm text-warm">{orgNaam}</p>
        </div>
        <Link href={`/dashboard/klanten/${id}`} className="text-sm font-semibold text-warm hover:text-ink-800">Terug naar klant</Link>
      </div>

      <p className="mt-6 max-w-2xl text-sm text-warm">
        Bepaal welke producten deze klant in de webshop kan bestellen en hoe elk artikel verstrekt wordt.
        Een artikel kan van het budget af gaan, een aantal keer per periode gratis zijn, altijd gratis zijn, of met punten gaan.
      </p>

      {/* Verstrekking per artikel in het assortiment */}
      <section className="mt-8">
        <h2 className="font-display text-xl font-bold text-ink-900">In het assortiment</h2>
        {inAssortiment.length === 0 ? (
          <p className="mt-4 rounded-xl border border-line bg-mist px-5 py-4 text-sm text-warm">
            Nog geen producten in het assortiment. Voeg er hieronder een toe.
          </p>
        ) : (
          <div className="mt-4 flex flex-col gap-4">
            {inAssortiment.map((p) => (
              <div key={p.product_id} className="rounded-2xl border border-line bg-white p-6 shadow-soft">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-ink-900">{p.naam}</p>
                    <p className="mt-0.5 text-sm text-warm">{p.merk || 'Geen merk'}</p>
                    <p className="mt-1 text-xs font-semibold text-amber-700">
                      {VERSTREKKING_LABEL[p.verstrekking_type]}
                      {p.verstrekking_type === 'periodiek_gratis'
                        ? ` (${p.gratis_per_periode ?? 0}x ${PERIODE_LABEL[p.periode]})`
                        : ''}
                    </p>
                  </div>
                  <form action={wisselAssortiment}>
                    <input type="hidden" name="orgId" value={id} />
                    <input type="hidden" name="productId" value={p.product_id} />
                    <input type="hidden" name="aan" value="false" />
                    <button type="submit" className={wisselCls}>Uit assortiment</button>
                  </form>
                </div>

                <form action={bewaarVerstrekking} className="mt-4 grid gap-4 border-t border-line pt-4 sm:grid-cols-3">
                  <input type="hidden" name="orgId" value={id} />
                  <input type="hidden" name="productId" value={p.product_id} />
                  <div>
                    <label className="block text-xs font-semibold text-warm">Verstrekkingstype</label>
                    <select name="verstrekking_type" defaultValue={p.verstrekking_type} className={inputCls}>
                      <option value="budget">Van budget af</option>
                      <option value="periodiek_gratis">Periodiek gratis</option>
                      <option value="altijd_gratis">Altijd gratis</option>
                      <option value="punten">Punten</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-warm">Aantal gratis per periode</label>
                    <input
                      name="gratis_per_periode"
                      inputMode="numeric"
                      defaultValue={p.gratis_per_periode != null ? String(p.gratis_per_periode) : ''}
                      placeholder="alleen bij periodiek gratis"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-warm">Periode</label>
                    <select name="periode" defaultValue={p.periode} className={inputCls}>
                      <option value="maand">Per maand</option>
                      <option value="kwartaal">Per kwartaal</option>
                      <option value="jaar">Per jaar</option>
                    </select>
                  </div>
                  <div className="sm:col-span-3">
                    <button type="submit" className={knopCls}>Verstrekking opslaan</button>
                  </div>
                </form>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Producten toevoegen aan het assortiment */}
      <section className="mt-12">
        <h2 className="font-display text-xl font-bold text-ink-900">Alle producten</h2>
        <p className="mt-1 text-sm text-warm">Zet een product aan om het in het assortiment van deze klant te zetten.</p>
        {producten.length === 0 ? (
          <p className="mt-4 rounded-xl border border-line bg-mist px-5 py-4 text-sm text-warm">
            Er zijn nog geen producten. Voeg ze toe onder Producten.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-2xl border border-line bg-white shadow-soft">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-mist text-xs uppercase tracking-wide text-warm">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Merk</th>
                  <th className="px-4 py-3">In assortiment</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {producten.map((p) => (
                  <tr key={p.product_id} className="border-b border-line align-top">
                    <td className="px-4 py-3 font-semibold text-ink-900">{p.naam}</td>
                    <td className="px-4 py-3 text-warm">{p.merk || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${p.in_assortiment ? 'bg-green-100 text-green-800' : 'bg-ink-100 text-ink-500'}`}>
                        {p.in_assortiment ? 'ja' : 'nee'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <form action={wisselAssortiment}>
                        <input type="hidden" name="orgId" value={id} />
                        <input type="hidden" name="productId" value={p.product_id} />
                        <input type="hidden" name="aan" value={p.in_assortiment ? 'false' : 'true'} />
                        <button type="submit" className={wisselCls}>{p.in_assortiment ? 'Verwijderen' : 'Toevoegen'}</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
