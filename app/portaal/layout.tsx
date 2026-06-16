import type { CSSProperties } from 'react';
import { isPortalConfigured } from '@/lib/env';
import { getHuisstijl, veiligeKleur, type Huisstijl } from '@/lib/portaal/huisstijl';

export const dynamic = 'force-dynamic';

/**
 * Layout om alle /portaal-pagina's. Geeft de ingelogde klant zijn eigen
 * huisstijl (accentkleur, logo, sfeerbeeld) zonder de bestaande pagina-inhoud
 * te overheersen. Zonder organisatie of huisstijl (login, niet ingelogd,
 * portaal niet geconfigureerd) worden de children gewoon ongewijzigd getoond.
 */
export default async function PortaalLayout({ children }: { children: React.ReactNode }) {
  let huisstijl: Huisstijl | null = null;

  if (isPortalConfigured) {
    try {
      huisstijl = await getHuisstijl();
    } catch {
      // Niet ingelogd of geen gekoppelde organisatie: val terug op de gewone weergave.
      huisstijl = null;
    }
  }

  // Geen huisstijl om te tonen: render de children zoals ze zijn (login blijft werken).
  if (!huisstijl || (!huisstijl.kleur && !huisstijl.logoUrl && !huisstijl.sfeerafbeeldingUrl)) {
    return <>{children}</>;
  }

  const accent = veiligeKleur(huisstijl.kleur);
  // Zet een CSS-variabele; pagina-inhoud blijft de standaard amber gebruiken,
  // de variabele kleurt alleen de merkbalk en de banneraccenten van deze layout.
  const wrapperStyle = { '--portaal-accent': accent } as CSSProperties;

  const heeftMerkbalk = Boolean(huisstijl.logoUrl || huisstijl.naam);

  return (
    <div style={wrapperStyle}>
      {heeftMerkbalk && (
        <div
          className="border-b border-line bg-white"
          style={{ borderBottomColor: 'color-mix(in srgb, var(--portaal-accent) 35%, #e4e2e0)' }}
        >
          <div className="container-x flex items-center gap-3 py-3">
            {huisstijl.logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={huisstijl.logoUrl}
                alt={`Logo ${huisstijl.naam}`}
                className="h-8 w-auto max-w-[160px] object-contain"
              />
            )}
            {huisstijl.naam && (
              <span className="text-sm font-semibold text-ink-800">{huisstijl.naam}</span>
            )}
            <span
              className="ml-auto hidden h-1.5 w-12 rounded-full sm:block"
              style={{ backgroundColor: 'var(--portaal-accent)' }}
              aria-hidden="true"
            />
          </div>
        </div>
      )}

      {huisstijl.sfeerafbeeldingUrl && (
        <div className="container-x pt-4">
          <div
            className="relative h-28 w-full overflow-hidden rounded-2xl border border-line bg-mist sm:h-36"
            style={{
              backgroundImage: `url(${huisstijl.sfeerafbeeldingUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
            role="img"
            aria-label={`Sfeerbeeld ${huisstijl.naam}`}
          >
            <div
              className="absolute inset-0"
              style={{ backgroundColor: 'color-mix(in srgb, var(--portaal-accent) 18%, transparent)' }}
              aria-hidden="true"
            />
          </div>
        </div>
      )}

      {children}
    </div>
  );
}
