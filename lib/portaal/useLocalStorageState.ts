'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';

/**
 * Gedraagt zich als useState, maar bewaart de waarde in localStorage onder een sleutel.
 * Veilige guards: typeof window, try/catch rond storage en JSON parse/stringify, zodat
 * server-rendering en geblokkeerde of corrupte storage nooit een crash geven.
 *
 * Bij het eerste render wordt de beginwaarde gebruikt (gelijk aan de server), en pas
 * na mount wordt een eventuele opgeslagen waarde ingelezen. Zo blijft de hydration stabiel.
 */
export function useLocalStorageState<T>(
  sleutel: string,
  beginwaarde: T,
): [T, Dispatch<SetStateAction<T>>] {
  const [waarde, setWaarde] = useState<T>(beginwaarde);
  // Voorkomt dat de eerste effect-run (inlezen) de net ingelezen waarde meteen terugschrijft.
  const ingelezen = useRef(false);

  // Eenmalig inlezen na mount (client-only), defensief tegen ontbrekende of kapotte data.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const ruw = window.localStorage.getItem(sleutel);
      if (ruw != null) {
        setWaarde(JSON.parse(ruw) as T);
      }
    } catch {
      // Storage niet beschikbaar of ongeldige JSON: hou de beginwaarde aan.
    }
    ingelezen.current = true;
    // Sleutel is stabiel; bewust eenmalig.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Wegschrijven bij elke wijziging, maar pas nadat we eenmalig hebben ingelezen.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!ingelezen.current) return;
    try {
      window.localStorage.setItem(sleutel, JSON.stringify(waarde));
    } catch {
      // Storage vol of geblokkeerd: stil overslaan, de state blijft in het geheugen werken.
    }
  }, [sleutel, waarde]);

  const set = useCallback<Dispatch<SetStateAction<T>>>((next) => {
    setWaarde(next);
  }, []);

  return [waarde, set];
}
