"use client";

import * as React from "react";
import Link from "next/link";
import Script from "next/script";
import {
  BRAND_PARAMS,
  EVENTS,
  GA_MEASUREMENT_ID,
  readConsent,
  trackEvent,
  updateConsent,
  writeConsent,
  type ConsentChoice,
} from "@/lib/analytics";
import { FAMILY_HOSTS } from "@/config/site";

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
 * L'amorce (dataLayer, consentement par défaut, restauration du choix stocké)
 * vit dans app/layout.tsx, rendue en clair dans le `<head>` : c'est la seule
 * façon de garantir qu'elle s'exécute avant la bibliothèque Google.
 */

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

  // Clics téléphoniques et liens vers les sites de la famille : un seul
  // écouteur délégué couvre tous les liens du site, présents comme à venir.
  // Sans ça il faudrait instrumenter chaque bouton, et le premier oublié
  // fausse le rapport.
  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const link = target?.closest?.("a[href]");
      if (!(link instanceof HTMLAnchorElement)) return;
      const emplacement = window.location.pathname;
      if (link.protocol === "tel:") {
        trackEvent(EVENTS.appelTelephone, {
          numero: link.getAttribute("href")?.replace("tel:", "") ?? "",
          emplacement,
        });
        trackEvent(EVENTS.clickToCall, { ...BRAND_PARAMS, emplacement });
        return;
      }
      const host = link.hostname.replace(/^www\./, "");
      if ((FAMILY_HOSTS as readonly string[]).includes(host)) {
        trackEvent(EVENTS.crossBrandClick, { ...BRAND_PARAMS, emplacement, destination: host });
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const decide = (value: ConsentChoice) => {
    writeConsent(value);
    updateConsent(value);
    listeners.forEach((l) => l());
  };

  // Visite issue d'une annonce : l'amorce du <head> a déjà lancé gtag.js
  // (lib/analytics.ts), il ne faut pas le charger une seconde fois. Lu au
  // rendu : faux côté serveur, et <Script lazyOnload> ne produit aucun HTML,
  // donc rien ne diffère à l'hydratation.
  const gtagEarly = typeof window !== "undefined" && window.__gtagEarly === true;

  return (
    <>
      {/* L'amorce du consentement est rendue en <head> par app/layout.tsx :
        * elle doit s'exécuter avant cette bibliothèque, pas après.
        * lazyOnload et non afterInteractive : avec afterInteractive, Next
        * précharge gtag.js dans le <head>, en priorité haute, et ses 176 Ko
        * partaient en même temps que la feuille de style et les polices,
        * suivis du script Google Ads (195 Ko) qu'il charge à son tour.
        * Lighthouse les comptait avant le premier affichage (LCP mobile de
        * 4,1 à 6,7 s, mesuré le 12/10/2026). Chargé quand le navigateur est
        * inactif, après la page : les appels faits avant son arrivée
        * (consentement, configuration, conversions) attendent dans
        * dataLayer, puisque l'amorce définit gtag() d'emblée. */}
      {!gtagEarly && (
        <Script
          id="ga-lib"
          strategy="lazyOnload"
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        />
      )}

      {/* Rendu dès le HTML (« loading » = rendu serveur et hydratation) :
        * avant, le bandeau n'apparaissait qu'après l'exécution du JavaScript,
        * tard sur mobile, et Lighthouse en faisait l'élément le plus lent de
        * /estimation (11/10/2026). Pour qui a déjà répondu, l'amorce du <head>
        * pose data-consent sur <html> et la classe mp-consent-banner le masque
        * avant le premier affichage (globals.css) ; React le retire ensuite. */}
      {(choice === "unknown" || choice === "loading") && (
        <div
          role="dialog"
          aria-label="Cookies de mesure d'audience"
          // Sur mobile, posé juste au-dessus de la barre de navigation
          // flottante (--mp-bottomnav-offset, globals.css) et resserré : il
          // couvrait le milieu du premier écran, boutons du héros compris.
          className="mp-consent-banner fixed inset-x-3 bottom-[calc(var(--mp-bottomnav-offset)_+_0.5rem)] z-50 rounded-2xl border border-mp-sand bg-mp-cream p-4 shadow-lg sm:p-5 lg:inset-x-auto lg:bottom-6 lg:left-6 lg:max-w-md"
        >
          <p className="text-sm leading-relaxed text-mp-ink">
            On mesure l&apos;audience du site et l&apos;efficacité de nos annonces Google, pour
            savoir quelles pages servent vraiment et d&apos;où viennent nos clients. Rien
            n&apos;est stocké sur votre appareil tant que vous n&apos;avez pas accepté.{" "}
            <Link href="/politique-cookies" className="underline hover:text-mp-orange-flame">
              Notre politique cookies
            </Link>
            .
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-4 sm:flex sm:flex-wrap">
            <button
              type="button"
              onClick={() => decide("granted")}
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-mp-green-deep px-5 text-sm font-semibold text-mp-cream transition-colors hover:bg-mp-green-mid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mp-orange-ink"
            >
              Accepter
            </button>
            <button
              type="button"
              onClick={() => decide("denied")}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-mp-sand px-5 text-sm font-semibold text-mp-ink transition-colors hover:border-mp-green-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mp-orange-ink"
            >
              Refuser
            </button>
          </div>
        </div>
      )}
    </>
  );
}
