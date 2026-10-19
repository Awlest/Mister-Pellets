/**
 * Mesure d'audience et suivi des conversions (Google Analytics 4 et Google Ads).
 *
 * L'identifiant de mesure est public par nature : il apparaît en clair dans le
 * code de chaque page. Le garder ici plutôt qu'en variable d'environnement
 * évite qu'un déploiement sans la variable désactive silencieusement la mesure,
 * ce qui ne se voit qu'en consultant les rapports des semaines plus tard.
 *
 * Propriété « Mister Pellets » du compte Analytics Awlest, créée le
 * 5 septembre 2026. La propriété « Mister Clim » a son propre identifiant, et
 * awlest.com le sien : les trois marques ne doivent pas mélanger leurs données,
 * puisqu'elles auront trois comptes Google Ads distincts.
 */
export const GA_MEASUREMENT_ID = "G-XZH50KSFW4";

/**
 * Balise Google Ads du compte « Mister Pellets » (791-127-5254), actions de
 * conversion créées le 26 septembre 2026. Public par nature, comme l'ID GA4.
 */
export const ADS_ID = "AW-17614035512";

/** Clé de stockage du choix de l'utilisateur sur les cookies de mesure. */
export const CONSENT_KEY = "mp-consent";

export type ConsentChoice = "granted" | "denied";

/**
 * Conversions suivies. Les noms sont figés : les changer casse l'historique
 * des rapports et les campagnes Google Ads qui s'y réfèrent.
 *
 * `generate_lead` est un nom recommandé par Google, reconnu automatiquement
 * comme conversion. Les trois autres sont propres au métier.
 */
export const EVENTS = {
  /** Configurateur terminé : le visiteur a obtenu un prix chiffré. */
  devisChiffre: "generate_lead",
  /** Formulaire de demande de devis envoyé. */
  formulaireDevis: "formulaire_devis",
  /** Rendez-vous réservé en ligne, créneau confirmé dans l'agenda. */
  rdvReserve: "rdv_reserve",
  /** Clic sur un lien téléphonique. Ne dit pas si l'appel a abouti. */
  appelTelephone: "appel_telephone",
  /**
   * Noms du plan de marquage commun aux 4 sites (standard du 17/10/2026),
   * envoyés en plus des noms historiques ci-dessus. Absents de
   * ADS_CONVERSIONS : ils ne déclenchent aucune conversion Google Ads.
   */
  bookAppointment: "book_appointment",
  clickToCall: "click_to_call",
  /** Clic vers un autre site de la famille Awlest. */
  crossBrandClick: "cross_brand_click",
} as const;

/** Paramètres portés par chaque événement du plan commun. */
export const BRAND_PARAMS = { brand: "pellets", project_type: "poele_pellets" } as const;

/**
 * Conversion Google Ads envoyée en plus de l'événement GA4 du même nom. Les
 * libellés viennent de Objectifs > Conversions dans Google Ads : un libellé
 * erroné ne lève aucune erreur, la conversion est simplement perdue. Le clic
 * téléphonique est une action secondaire côté Ads (observation seulement) :
 * les appels qui comptent sont ceux passés depuis l'annonce, mesurés par
 * Google lui-même.
 */
const ADS_CONVERSIONS: Partial<Record<string, string>> = {
  [EVENTS.rdvReserve]: `${ADS_ID}/eJiaCI7TlYYdELi0g89B`,
  [EVENTS.devisChiffre]: `${ADS_ID}/kQ5qCJHTlYYdELi0g89B`,
  [EVENTS.formulaireDevis]: `${ADS_ID}/b7dgCJTTlYYdELi0g89B`,
  [EVENTS.appelTelephone]: `${ADS_ID}/S0PJCNihm4YdELi0g89B`,
};

type GtagArgs =
  | ["event", string, Record<string, unknown>?]
  | ["consent", "default" | "update", Record<string, string>]
  | ["config", string, Record<string, unknown>?]
  | ["js", Date];

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: GtagArgs) => void;
    /** gtag.js déjà lancé par l'amorce du <head> (visite issue d'une annonce). */
    __gtagEarly?: boolean;
  }
}

/**
 * Envoie un événement à GA4, et la conversion Google Ads correspondante s'il y
 * en a une. Sans effet si la mesure n'est pas chargée (refus de l'utilisateur,
 * bloqueur de publicité, rendu serveur) : le suivi ne doit jamais faire
 * échouer une action métier.
 */
export function trackEvent(name: string, params?: Record<string, unknown>): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  try {
    window.gtag("event", name, params);
    const sendTo = ADS_CONVERSIONS[name];
    if (sendTo) window.gtag("event", "conversion", { send_to: sendTo });
  } catch {
    // Un blocage réseau ou une extension ne doit pas remonter jusqu'à l'UI.
  }
}

/** Met à jour le consentement Google après le choix de l'utilisateur. */
export function updateConsent(choice: ConsentChoice): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("consent", "update", {
    ad_storage: choice,
    ad_user_data: choice,
    ad_personalization: choice,
    analytics_storage: choice,
  });
}

export function readConsent(): ConsentChoice | null {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

export function writeConsent(choice: ConsentChoice): void {
  try {
    localStorage.setItem(CONSENT_KEY, choice);
  } catch {
    // Navigation privée ou stockage bloqué : le bandeau réapparaîtra, tant pis.
  }
}

/**
 * Script d'amorce du mode consentement, à rendre en clair dans le `<head>`.
 *
 * Il DOIT s'exécuter avant que la bibliothèque Google ne s'initialise, sinon
 * un identifiant peut être stocké avant le refus par défaut. Passé par
 * `next/script`, il n'apparaissait pas dans le HTML servi et son ordre face au
 * chargement de gtag.js n'était pas garanti : constaté en production le
 * 5 septembre 2026. Un `<script>` inline dans le `<head>` est le seul moyen
 * d'avoir la garantie d'ordre.
 *
 * Il pose aussi `data-consent` sur `<html>` quand un choix est déjà
 * enregistré : le bandeau cookies, rendu dans le HTML, est alors masqué par
 * CSS avant le premier affichage (components/layout/Analytics.tsx).
 *
 * Pour une visite issue d'une annonce ou d'une campagne (gclid, utm_…), il
 * lance aussi gtag.js tout de suite et le signale par `window.__gtagEarly`.
 * Sinon la bibliothèque n'arrive qu'après le chargement de la page
 * (Analytics.tsx) : un clic sur un lien interne avant son arrivée effacerait
 * ces paramètres de l'adresse, et la conversion ne serait plus attribuée à
 * l'annonce.
 *
 * Sans consentement, aucun cookie ne garde le clic d'annonce. gtag lit le
 * gclid dans l'adresse d'arrivée et le garde en mémoire tant que la page vit,
 * navigations internes de Next comprises, même quand le visiteur change de
 * page avant l'arrivée de gtag.js (contrôlé le 19/10/2026 : chaque conversion
 * repart avec le gclid). `url_passthrough` couvre le reste : il recopie gclid
 * et wbraid dans les liens internes au moment du clic, si bien qu'un
 * rechargement complet (lien <a> ordinaire, nouvel onglet, page rechargée)
 * ne perd plus le clic. Il doit précéder les `config`.
 * Pas d'`ads_data_redaction` : quand le visiteur refuse, cette option retire
 * l'identifiant de clic des appels Google Ads, la conversion ne serait plus
 * reliée à l'annonce.
 */
export const GA_BOOTSTRAP = `
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
gtag('set', 'url_passthrough', true);
try {
  var mpConsent = localStorage.getItem('${CONSENT_KEY}');
  if (mpConsent === 'granted' || mpConsent === 'denied') {
    document.documentElement.setAttribute('data-consent', mpConsent);
  }
  if (mpConsent === 'granted') {
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
gtag('config', '${ADS_ID}');
if (/[?&](gclid|gbraid|wbraid|dclid|gad_source|srsltid|utm_[a-z]+)=/i.test(location.search)) {
  window.__gtagEarly = true;
  var gs = document.createElement('script');
  gs.async = true;
  gs.src = 'https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}';
  document.head.appendChild(gs);
}
`;
