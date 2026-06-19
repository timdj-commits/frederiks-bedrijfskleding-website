'use client';

import { useActionState, useState } from 'react';
import { aiOpvolgmailActie } from './actions';

type Props = {
  naam: string;
  bedrijf: string;
  branche: string;
  bericht: string;
  status: string;
};

const beginstand: { tekst?: string; error?: string } = {};

export default function AiOpvolg({ naam, bedrijf, branche, bericht, status }: Props) {
  const [state, actie, bezig] = useActionState(aiOpvolgmailActie, beginstand);
  const [open, setOpen] = useState(false);
  const [gekopieerd, setGekopieerd] = useState(false);

  async function kopieer() {
    if (!state?.tekst) return;
    try {
      await navigator.clipboard.writeText(state.tekst);
      setGekopieerd(true);
      setTimeout(() => setGekopieerd(false), 2000);
    } catch {
      setGekopieerd(false);
    }
  }

  return (
    <div className="mt-3 border-t border-line pt-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-xs font-semibold text-amber-700 hover:text-amber-800"
        aria-expanded={open}
      >
        {open ? 'Verberg AI-opvolgmail' : 'AI-opvolgmail'}
      </button>

      {open && (
        <div className="mt-2">
          <form action={actie}>
            <input type="hidden" name="naam" value={naam} />
            <input type="hidden" name="bedrijf" value={bedrijf} />
            <input type="hidden" name="branche" value={branche} />
            <input type="hidden" name="bericht" value={bericht} />
            <input type="hidden" name="status" value={status} />
            <button
              type="submit"
              disabled={bezig}
              className="w-full rounded-md bg-white px-2.5 py-1.5 text-xs font-semibold text-ink-700 ring-1 ring-line hover:bg-mist disabled:opacity-60"
            >
              {bezig ? 'Bezig…' : 'Genereer concept-mail'}
            </button>
          </form>

          {state?.error && (
            <p className="mt-2 rounded-md bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-800">
              {state.error}
            </p>
          )}

          {state?.tekst && (
            <div className="mt-2">
              <textarea
                readOnly
                value={state.tekst}
                rows={8}
                className="w-full rounded-md border border-line bg-white px-2.5 py-2 text-xs focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
              />
              <button
                type="button"
                onClick={kopieer}
                className="mt-1.5 rounded-md border border-line bg-white px-2.5 py-1 text-xs font-semibold text-ink-700 hover:bg-mist"
              >
                {gekopieerd ? 'Gekopieerd' : 'Kopieer'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
