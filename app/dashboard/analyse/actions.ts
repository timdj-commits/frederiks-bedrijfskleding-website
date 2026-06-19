'use server';
import { dashAuthed } from '@/lib/kms/adminClient';
import { aiTekst } from '@/lib/ai';

export type AiSamenvattingResultaat = { tekst?: string; error?: string };

/**
 * Vat een compacte selectie analyse-cijfers samen tot 4-6 bullets met
 * aandachtspunten voor de eigenaar. Env-gated via de AI-laag; de key blijft
 * volledig server-side.
 */
export async function aiSamenvattingActie(
  _prev: AiSamenvattingResultaat | null,
  formData: FormData,
): Promise<AiSamenvattingResultaat> {
  if (!(await dashAuthed())) {
    return { error: 'Geen toegang.' };
  }

  const ruw = String(formData.get('cijfers') ?? '');
  let cijfers: unknown = null;
  try {
    cijfers = JSON.parse(ruw);
  } catch {
    return { error: 'Kon de cijfers niet lezen. Probeer het opnieuw.' };
  }

  const json = JSON.stringify(cijfers);
  const opdracht =
    'Je bent een zakelijke analist voor een bedrijfskledingleverancier. ' +
    'Vat de volgende cijfers samen in 4-6 korte bullets: wat valt op, wat gaat goed, ' +
    'waar moet de eigenaar deze maand op letten. Wees concreet en noem getallen. ' +
    `Cijfers (JSON): ${json}. Antwoord in het Nederlands, geen inleiding.`;

  const resultaat = await aiTekst(opdracht);

  if (!resultaat.ok) {
    return { error: resultaat.error ?? 'Er ging iets mis bij het samenvatten.' };
  }
  return { tekst: resultaat.tekst };
}
