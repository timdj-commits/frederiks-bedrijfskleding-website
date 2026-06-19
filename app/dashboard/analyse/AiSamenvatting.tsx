'use client';

import { useActionState } from 'react';
import { aiSamenvattingActie, type AiSamenvattingResultaat } from './actions';

type Props = {
  cijfers: Record<string, unknown>;
};

const beginstand: AiSamenvattingResultaat = {};

export default function AiSamenvatting({ cijfers }: Props) {
  const [state, actie, bezig] = useActionState(aiSamenvattingActie, beginstand);

  return (
    <div>
      <p className="text-sm text-warm">
        Laat de AI de cijfers van deze maand samenvatten in een paar concrete
        aandachtspunten: wat valt op, wat gaat goed en waar je deze maand op moet letten.
      </p>

      <form action={actie} className="mt-4">
        <input type="hidden" name="cijfers" value={JSON.stringify(cijfers)} />
        <button type="submit" disabled={bezig} className="btn-primary disabled:opacity-60">
          {bezig ? 'Bezig…' : 'Vat samen met AI'}
        </button>
      </form>

      {state?.error && (
        <p className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800">
          {state.error}
        </p>
      )}

      {state?.tekst && (
        <div className="mt-4 whitespace-pre-wrap rounded-xl border border-line bg-mist px-4 py-3 text-sm leading-relaxed text-ink-800">
          {state.tekst}
        </div>
      )}
    </div>
  );
}
