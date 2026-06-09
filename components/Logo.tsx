import Link from 'next/link';
import { site } from '@/content/site';
import { logoDataUri } from '@/content/logoData';

/**
 * Logo als ingebakken data-URI (rendert altijd). shrink-0 zodat het nooit
 * door de flex-balk wordt platgedrukt. Footer (light): op een wit chip-vlak.
 */
export function Logo({ light = false }: { light?: boolean }) {
  /* eslint-disable-next-line @next/next/no-img-element */
  const img = <img src={logoDataUri} alt={site.name} className={light ? 'h-8 w-auto' : 'h-10 w-auto sm:h-12'} />;
  if (light) {
    return (
      <Link href="/" className="inline-flex shrink-0" aria-label={`${site.name} naar home`}>
        <span className="inline-flex items-center rounded-md bg-white px-3 py-2 shadow-sm">{img}</span>
      </Link>
    );
  }
  return (
    <Link href="/" className="inline-flex shrink-0 items-center" aria-label={`${site.name} naar home`}>
      {img}
    </Link>
  );
}
