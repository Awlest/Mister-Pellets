"use client";

import * as React from "react";
import Link from "next/link";
import Script from "next/script";
import {
  CONSENT_KEY,
  EVENTS,
  GA_MEASUREMENT_ID,
  readConsent,
  trackEvent,
  updateConsent,
  writeConsent,
  type ConsentChoice,
} from "@/lib/analytics";

/**
 * Mesure d'audience GA4 avec mode consentement Google (v2).
 *
 * Le script se charge dès le départ, mais avec tous les consentements refusés
 * par défaut : aucun cookie ni identifiant n'est stocké tant que le visiteur
 * n'a pas accepté. Google reçoit alors des signaux anonymes qui lui permettent
 * de modéliser les conversions manquantes, ce qui évite de piloter des
 * campagnes sur des chiffres amputés de la moitié du trafic. Le passage à
 * `granted` ne se fait qu'après un clic explicite sur Accepter.
 *
 * Le bootstrap tient en un seul script inline plutôt qu'en trois balises :
 * l'ordre d'exécution des scripts `afterInteractive` n'est pas garanti par
 * Next, et un `consent default` qui arriverait après le premier hit serait
 * inutile.
 */

const BOOTSTRAP = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  wait_for_update: 500
});
try {
  if (localStorage.getItem('${CONSENT_KEY}') === 'granted') {
    gtag('consent', 'update', {
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
      analytics_storage: 'granted'
    });
  }
} catch (e) {}
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}');
`;

/**
 * Le choix de l'utilisateur vit dans localStorage, pas dans React. On le lit
 * par `useSyncExternalStore` plutôt que par un `setState` dans un effet : la
 * règle React 19 `set-state-in-effect` interdit le second, et surtout cette
 * forme évite le rendu intermédiaire où le bandeau clignote chez quelqu'un qui
 * a déjà répondu.
 */
let listeners: Array<() => void> = [];

function subscribe(cb: () => void) {
  listeners.push(cb);
  return () => {
    listeners = listeners.filter((l) => l !== cb);
  };
}

const getSnapshot = (): ConsentChoice | "unknown" => readConsent() ?? "unknown";
const getServerSnapshot = (): "loading" => "loading";

export function Analytics() {
  const choice = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Clics téléphoniques : un seul écouteur délégué couvre tous les liens du
  // site, présents comme à venir. Sans ça il faudrait instrumenter chaque
  // bouton, et le premier oublié fausse le rapport.
  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const link = target?.closest?.("a[href^='tel:']") as HTMLAnchorElement | null;
      if (!link) return;
      trackEvent(EVENTS.appelTelephone, {
        numero: link.getAttribute("href")?.replace("tel:", "") ?? "",
        emplacement: window.location.pathname,
      });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const decide = (value: ConsentChoice) => {
    writeConsent(value);
    updateConsent(value);
    listeners.forEach((l) => l());
  };

  return (
    <>
      <Script id="ga-bootstrap" strategy="afterInteractive">
        {BOOTSTRAP}
      </Script>
      <Script
        id="ga-lib"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />

      {choice === "unknown" && (
        <div
          role="dialog"
          aria-label="Cookies de mesure d'audience"
          // bottom-28 sur mobile : la barre de navigation flottante occupe le
          // bas de l'écran, un bandeau posé à 0 la recouvrirait.
          className="fixed inset-x-3 bottom-28 z-50 rounded-2xl border border-mp-sand bg-mp-cream p-5 shadow-lg lg:inset-x-auto lg:bottom-6 lg:left-6 lg:max-w-md"
        >
          <p className="text-sm leading-relaxed text-mp-ink">
            On mesure l&apos;audience du site pour savoir quelles pages servent vraiment et d&apos;où
            viennent nos clients. Rien n&apos;est stocké sur votre appareil tant que vous
            n&apos;avez pas accepté.{" "}
            <Link href="/politique-cookies" className="underline hover:text-mp-orange-flame">
              Notre politique cookies
            </Link>
            .
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => decide("granted")}
              className="rounded-full bg-mp-green-deep px-5 py-2.5 text-sm font-semibold text-mp-cream transition-colors hover:bg-mp-orange-flame focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mp-orange-flame"
            >
              Accepter
            </button>
            <button
              type="button"
              onClick={() => decide("denied")}
              className="rounded-full border border-mp-sand px-5 py-2.5 text-sm font-semibold text-mp-ink transition-colors hover:border-mp-green-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mp-orange-flame"
            >
              Refuser
            </button>
          </div>
        </div>
      )}
    </>
  );
}
