/**
 * Bepaalt waar een bezoeker vandaan komt, op basis van UTM-parameters, ad-clickids
 * en de referrer. Werkt client-side en zonder analytics. Het resultaat gaat mee in
 * de lead-mail, zodat je weet welk kanaal de aanvraag opleverde (belangrijk voor attributie).
 */
export function getHerkomst(): string {
  if (typeof window === 'undefined') return '';
  const parts: string[] = [];
  try {
    const p = new URLSearchParams(window.location.search);
    const s = p.get('utm_source'); const m = p.get('utm_medium'); const c = p.get('utm_campaign');
    if (s) parts.push(`bron=${s}`);
    if (m) parts.push(`medium=${m}`);
    if (c) parts.push(`campagne=${c}`);
    if (p.get('gclid')) parts.push('Google Ads (gclid)');
    if (p.get('fbclid')) parts.push('Meta (fbclid)');
    let ref = '';
    if (document.referrer) {
      try { ref = new URL(document.referrer).hostname.replace(/^www\./, ''); } catch { /* */ }
    }
    if (ref && !ref.includes(window.location.hostname)) parts.push(`verwijzing: ${ref}`);
    if (!parts.length) parts.push(ref ? `verwijzing: ${ref}` : 'direct of onbekend');
  } catch { return 'onbekend'; }
  return parts.join(', ');
}
