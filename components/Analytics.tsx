import Script from 'next/script';
import { env, isAnalyticsConfigured } from '@/lib/env';

/**
 * GA4 met Consent Mode v2. Laadt alleen als NEXT_PUBLIC_GA_ID is gezet.
 * Standaard staat toestemming op 'denied'; de cookiebanner zet het op 'granted'.
 * Zo wordt er niets gemeten voordat de bezoeker akkoord geeft (AVG).
 */
export function Analytics() {
  if (!isAnalyticsConfigured) return null;
  return (
    <>
      <Script id="ga-consent-default" strategy="beforeInteractive">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        window.gtag = gtag;
        gtag('consent', 'default', {
          ad_storage: 'denied', analytics_storage: 'denied',
          ad_user_data: 'denied', ad_personalization: 'denied'
        });
      `}</Script>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${env.gaId}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">{`
        gtag('js', new Date());
        gtag('config', '${env.gaId}', { anonymize_ip: true });
      `}</Script>
    </>
  );
}
