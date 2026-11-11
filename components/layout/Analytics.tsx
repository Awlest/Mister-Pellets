"use client";

import * as React from "react";
import Link from "next/link";
import Script from "next/script";
import {
  BRAND_PARAMS,
  EVENTS,
  GA_MEASUREMENT_ID,
  clearConsent,
  clearGoogleCookies,
  readConsent,
  setGoogleSending,
  trackEvent,
  updateConsent,
  writeConsent,
  type ConsentChoice,
} from "@/lib/analytics";
import { FAMILY_HOSTS } from "@/config/site";
import { buttonVariants } from "@/components/ui/button-variants";

/**
 * Mesure d'audience GA4 et conversions Google Ads, chargées après accord.
 *
 * Décision du 11/11/2026 : aucune balise Google avant un clic sur « Accepter ».
 * Avant, gtag.js se chargeait d'emblée en mode consentement « avancé » et
 * envoyait des signaux sans cookie pour que Google modélise les conversions
 * des visiteurs qui refusent ; ces conversions modélisées sont abandonnées.
 *
 * L'amorce (dataLayer, consentement refusé par défaut, restauration du choix
 * mémorisé, configuration) vit dans app/(frontend)/layout.tsx, rendue en clair
 * dans le `<head>`. Elle ne fait que remplir une file en mémoire : rien ne
 * part tant que la bibliothèque n'est pas chargée, et elle ne l'est qu'ici,
 * quand le choix vaut « granted ».
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

const notify = () => listeners.forEach((l) => l());

const BANNER_ID = "mp-consent";

/** Élément qui a rouvert le bandeau, où rendre le focus après la réponse. */
let reopenedFrom: HTMLElement | null = null;

/**
 * « Gérer les cookies » : retirer son accord doit être aussi simple que le
 * donner. Le choix est oublié, Google repasse au refus par défaut (l'état
 * d'une première visite) et le bandeau revient avec le focus, pour qui
 * navigue au clavier. Les cookies déjà posés ne sont effacés qu'au refus.
 */
function reopenConsent(from: HTMLElement) {
  reopenedFrom = from;
  clearConsent();
  updateConsent("denied");
  // La bibliothèque peut être déjà chargée dans cette page : plus aucun envoi.
  setGoogleSending(false);
  notify();
  // Après le rendu qui remonte le bandeau (setTimeout et non
  // requestAnimationFrame : figé dans un onglet en arrière-plan).
  setTimeout(() => document.getElementById(BANNER_ID)?.focus({ preventScroll: true }), 0);
}

/** Bouton du pied de page et de la politique cookies. */
export function ConsentSettingsButton({ className }: { className?: string }) {
  return (
    <button type="button" onClick={(e) => reopenConsent(e.currentTarget)} className={className}>
      Gérer les cookies
    </button>
  );
}

/**
 * Accepter et Refuser : même taille, même couleur, même ligne. Un Accepter
 * plein face à un Refuser en contour pousse à accepter ; refuser doit rester
 * aussi visible et aussi facile.
 */
const CHOICE_BUTTON = `${buttonVariants({ variant: "secondary" })} sm:w-32`;

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
    setGoogleSending(value === "granted");
    document.documentElement.setAttribute("data-consent", value);
    if (value === "denied") clearGoogleCookies();
    notify();
    if (reopenedFrom?.isConnected) reopenedFrom.focus({ preventScroll: true });
    reopenedFrom = null;
  };

  return (
    <>
      {/* Les balises Google (GA4 et Google Ads) ne se chargent QU'APRÈS
        * l'accord du visiteur : sans lui, aucune requête ne part vers
        * googletagmanager.com, google-analytics.com, googleadservices.com ni
        * doubleclick.net. Accord donné à l'instant ou déjà mémorisé : gtag.js
        * arrive en lazyOnload, quand le navigateur est inactif, hors du
        * chemin critique (176 Ko, plus le script Google Ads qu'il charge à
        * son tour). Il lit alors la file préparée par l'amorce du <head> :
        * consentement accordé, puis configuration, donc le page_view de la
        * page courante. Les conversions suivent par trackEvent. */}
      {choice === "granted" && (
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
          id={BANNER_ID}
          role="dialog"
          aria-label="Cookies de mesure"
          tabIndex={-1}
          // Sur mobile, posé juste au-dessus de la barre de navigation
          // flottante (--mp-bottomnav-offset) et, sur /estimation, de la
          // barre d'action du configurateur (--mp-actionbar-space, globals.css) :
          // il recouvrait le bouton Suivant (relevé à 375 px le 19/10/2026).
          className="mp-consent-banner fixed inset-x-3 bottom-[calc(var(--mp-bottomnav-offset)_+_var(--mp-actionbar-space)_+_0.5rem)] z-50 rounded-2xl border border-mp-sand bg-mp-cream p-3 shadow-lg sm:p-5 lg:inset-x-auto lg:bottom-6 lg:left-6 lg:max-w-md"
        >
          {/* Téléphone : une phrase courte, pour que le bandeau tienne en une
              centaine de pixels et laisse voir le bouton principal de la page. */}
          <p className="text-xs leading-snug text-mp-ink sm:hidden">
            Cookies Google pour mesurer visites et annonces, avec votre accord.{" "}
            {/* Cible de 44 px de haut sans changer le texte ni les boutons : une
                zone invisible autour du lien (::after), étendue surtout vers le
                haut ; vers le bas, 7 px seulement, moins que l'écart de 8 px
                avec les boutons (recette du lot 3 : 35 x 15 px). */}
            <Link
              href="/politique-cookies"
              className="relative inline-block whitespace-nowrap underline after:absolute after:-inset-x-2 after:-top-[22px] after:-bottom-[7px] after:content-[''] hover:text-mp-orange-ink"
            >
              Détails
            </Link>
          </p>
          <p className="hidden text-sm leading-relaxed text-mp-ink sm:block">
            Les cookies Google nous montrent comment vous nous avez trouvés, et donc quelle pub
            vaut la peine. Sans votre accord, aucune balise Google n&apos;est chargée.{" "}
            <Link href="/politique-cookies" className="whitespace-nowrap underline hover:text-mp-orange-ink">
              Politique cookies
            </Link>
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:mt-4 sm:flex">
            <button type="button" onClick={() => decide("granted")} className={CHOICE_BUTTON}>
              Accepter
            </button>
            <button type="button" onClick={() => decide("denied")} className={CHOICE_BUTTON}>
              Refuser
            </button>
          </div>
        </div>
      )}
    </>
  );
}
