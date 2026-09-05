/**
 * Mesure d'audience et suivi des conversions (Google Analytics 4).
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
} as const;

type GtagArgs =
  | ["event", string, Record<string, unknown>?]
  | ["consent", "default" | "update", Record<string, string>]
  | ["config", string, Record<string, unknown>?]
  | ["js", Date];

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: GtagArgs) => void;
  }
}

/**
 * Envoie un événement à GA4. Sans effet si la mesure n'est pas chargée
 * (refus de l'utilisateur, bloqueur de publicité, rendu serveur) : le suivi
 * ne doit jamais faire échouer une action métier.
 */
export function trackEvent(name: string, params?: Record<string, unknown>): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  try {
    window.gtag("event", name, params);
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
