/**
 * Blocs des pages légales, et fiche qui personnalise ces pages pour un site.
 *
 * ⚠️ FICHIER COMMUN aux quatre sites d'AWLEST SRL (awlest-next, Mister-Pellets,
 * mister-clim, mister-bois). Il doit rester identique dans les quatre dépôts :
 * une modification se reporte le même jour dans les trois autres. Seul
 * `site.ts` diffère d'un site à l'autre.
 *
 * Les textes légaux vivent dans le code, pas dans l'administration : ils
 * changent rarement, et chaque modification doit passer par une revue et
 * laisser une trace dans l'historique Git.
 *
 * Mise en forme dans le texte : `**gras**` et `[libellé](adresse)`, l'adresse
 * pouvant être un chemin du site (`/contact`), une URL complète ou un
 * `mailto:`/`tel:`.
 */
export type LegalBlock =
  | { h2: string }
  | { h3: string }
  | { p: string }
  | { ul: readonly string[] }
  | { table: { head: readonly string[]; rows: readonly (readonly string[])[] } }
  /** Emplacement du bouton « Gérer les cookies », sur les sites qui ont un bandeau. */
  | { consent: true };

/** Une ligne de l'inventaire des cookies et du stockage du navigateur. */
export interface StorageItem {
  name: string;
  purpose: string;
  duration: string;
}

/** Une famille de l'inventaire : indispensables, mesure d'audience, annonces. */
export interface StorageGroup {
  title: string;
  /** Qui dépose ces éléments et à quelle condition. */
  note: string;
  items: readonly StorageItem[];
}

/**
 * Ce qui distingue un site des trois autres dans les pages légales. Tout le
 * reste du texte est commun. Chaque champ décrit ce que le site FAIT
 * réellement : un formulaire, un outil ou un cookie ajouté ou retiré se
 * reporte ici le jour même.
 */
export interface LegalSite {
  /** Nom de la marque, tel qu'affiché sur le site. */
  brand: string;
  /** Domaine, sans protocole ni www. */
  domain: string;
  /** Ce que la marque fait, en complément de « sous la marque X, nous … ». */
  activity: string;
  /** Téléphone de la marque, au format affiché. */
  phone: string;
  /** Même numéro, au format international pour les liens tel:. */
  phoneHref: string;
  /** Adresse e-mail publique de la marque. */
  email: string;
  /** Chemins des pages légales de ce site. */
  paths: { terms: string; legal: string; privacy: string; cookies: string };
  /** Hébergement, une phrase par prestataire (mentions légales). */
  hosting: readonly string[];
  /** Outils en ligne dont les résultats sont indicatifs (mentions légales). */
  indicative: readonly string[];
  /** Fabricants cités sur le site, pour la mention de leurs marques. */
  manufacturers: string;
  /** Données reçues, une puce par formulaire ou canal (confidentialité). */
  collected: readonly string[];
  /** Finalités propres au site, en plus des finalités communes. */
  purposes: readonly string[];
  /** Prestataires techniques, une puce chacun (confidentialité). */
  processors: readonly string[];
  /** Transferts hors de l'Union européenne (confidentialité). */
  transfers: string;
  /** Durées propres au site (mesure d'audience), en plus des durées communes. */
  retention: readonly string[];
  /** Résumé de la page cookies, en tête de page. */
  cookieSummary: string;
  /** Inventaire de ce que le site enregistre sur l'appareil du visiteur. */
  storage: readonly StorageGroup[];
  /** Paragraphes propres au site sur la mesure (signaux sans cookie, etc.). */
  measurement: readonly LegalBlock[];
  /** Le site a-t-il un bandeau de consentement et un bouton « Gérer les cookies » ? */
  consentBanner: boolean;
  /** Comment le visiteur donne ou retire son accord. */
  consentText: readonly string[];
}
