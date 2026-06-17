'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

type Hit = { type: string; label: string; sub: string; href: string };

/**
 * Globaal zoeken over klanten, producten, orders en facturen.
 * Wordt geopend met Cmd/Ctrl+K (afgehandeld in DashboardShell) en is hier
 * controlled via open/onClose. Debounced fetch naar /api/dashboard/search.
 */
export default function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState('');
  const [hits, setHits] = useState<Hit[]>([]);
  const [actief, setActief] = useState(0);
  const [bezig, setBezig] = useState(false);

  // Reset en focus bij openen.
  useEffect(() => {
    if (open) {
      setQ('');
      setHits([]);
      setActief(0);
      const t = setTimeout(() => inputRef.current?.focus(), 30);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Debounced zoeken.
  useEffect(() => {
    if (!open) return;
    const term = q.trim();
    if (term.length < 2) {
      setHits([]);
      return;
    }
    setBezig(true);
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/dashboard/search?q=${encodeURIComponent(term)}`, { signal: ctrl.signal });
        const data = (await res.json()) as { results: Hit[] };
        setHits(data.results ?? []);
        setActief(0);
      } catch {
        /* afgebroken of mislukt: stil laten */
      } finally {
        setBezig(false);
      }
    }, 180);
    return () => {
      ctrl.abort();
      clearTimeout(t);
    };
  }, [q, open]);

  function ga(hit: Hit) {
    onClose();
    router.push(hit.href);
  }

  function onKey(e: React.KeyboardEvent) {
    if (e.key === 'Escape') onClose();
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActief((i) => Math.min(i + 1, hits.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActief((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && hits[actief]) {
      e.preventDefault();
      ga(hits[actief]);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[12vh]" onKeyDown={onKey}>
      <button type="button" aria-label="Sluiten" onClick={onClose} className="absolute inset-0 cursor-default bg-black/50" />
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-line bg-white shadow-soft">
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Zoek klant, product, order of factuur…"
          className="w-full border-b border-line px-5 py-4 text-sm focus:outline-none"
        />
        <div className="max-h-80 overflow-y-auto">
          {q.trim().length < 2 ? (
            <p className="px-5 py-6 text-center text-sm text-warm">Typ minstens 2 tekens om te zoeken.</p>
          ) : hits.length === 0 ? (
            <p className="px-5 py-6 text-center text-sm text-warm">{bezig ? 'Zoeken…' : 'Niets gevonden.'}</p>
          ) : (
            <ul className="py-2">
              {hits.map((h, i) => (
                <li key={`${h.type}-${h.href}`}>
                  <button
                    type="button"
                    onMouseEnter={() => setActief(i)}
                    onClick={() => ga(h)}
                    className={`flex w-full items-center justify-between gap-3 px-5 py-2.5 text-left text-sm ${i === actief ? 'bg-mist' : ''}`}
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-semibold text-ink-900">{h.label}</span>
                      {h.sub && <span className="block truncate text-xs text-warm">{h.sub}</span>}
                    </span>
                    <span className="shrink-0 rounded-full bg-mist px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-warm">
                      {h.type}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex items-center justify-between border-t border-line px-5 py-2 text-[11px] text-warm">
          <span>↑↓ kiezen · Enter openen · Esc sluiten</span>
          <span>Zoeken</span>
        </div>
      </div>
    </div>
  );
}
