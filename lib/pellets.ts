import { brusselsDay } from "@/lib/bonus";

/**
 * Palette de pellets Comfo : prix, offre de lancement, stock et retrait.
 * Source unique pour la page /palette-pellets-comfo, le bandeau du site
 * (components/layout/PelletPromoBanner.tsx), la réservation du retrait
 * (lib/services.ts, app/api/rdv/book) et le cron de bascule
 * (app/api/cron/bonus).
 *
 * Conditions fixées par le client le 27/10/2026 : 470 € TVAC la palette
 * (TVA 6 %), 435 € TVAC jusqu'au 2 novembre 2026 inclus, 50 palettes en
 * stock, retrait sur rendez-vous au showroom et paiement sur place à
 * l'enlèvement. Pas de livraison, pas de paiement en ligne.
 *
 * Annonce de prix (art. VI.18 CDE) : la palette n'était pas vendue sur le
 * site avant le 27/10/2026, il n'existe donc pas de prix antérieur à barrer.
 * Le 435 € s'annonce comme un prix de lancement, avec le prix qui suivra,
 * jamais comme « 470 € barré ». Si la palette a été vendue 470 € pendant les
 * 30 jours précédant une future promotion, le prix barré redevient possible.
 */
export const PELLET_OFFER = {
  path: "/palette-pellets-comfo",
  /** Nom du produit, tel qu'il s'affiche partout. */
  name: "Palette de pellets Comfo",
  /** Prix normal TVAC, en euros. */
  priceTTC: 470,
  vatRate: 0.06,
  launch: {
    priceTTC: 435,
    /** Dernier jour du prix de lancement, jour civil de Bruxelles, inclus. */
    to: "2026-11-02",
    /**
     * Fin de validité pour le balisage Schema.org et la plage de l'offre,
     * ISO 8601 avec fuseau (heure d'hiver le 2 novembre).
     */
    validThrough: "2026-11-02T23:59:59+01:00",
  },
  /** Palettes disponibles au lancement (pas de décompte automatique). */
  stock: 50,
  /** Conditionnement : 65 sacs de 15 kg. */
  bags: 65,
  bagKg: 15,
  /** Palettes réservables en une fois. */
  maxPerBooking: 10,
} as const;

/** Poids net de pellets sur une palette, en kg (975). */
export const PALLET_NET_KG = PELLET_OFFER.bags * PELLET_OFFER.bagKg;

/** Le prix de lancement s'applique-t-il ce jour-là (heure de Bruxelles) ? */
export const isPelletLaunchPeriod = (now: Date = new Date()): boolean =>
  brusselsDay(now) <= PELLET_OFFER.launch.to;

/** Prix TVAC d'une palette à l'instant donné : 435 € puis 470 €. */
export const pelletPriceTTC = (now: Date = new Date()): number =>
  isPelletLaunchPeriod(now) ? PELLET_OFFER.launch.priceTTC : PELLET_OFFER.priceTTC;

/**
 * Lendemain du dernier jour du prix de lancement : les pages en cache
 * gardent l'ancien prix et le bandeau tant qu'on ne les invalide pas.
 */
export const isPelletSwitchDay = (now: Date = new Date()): boolean => {
  const d = new Date(`${PELLET_OFFER.launch.to}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return brusselsDay(now) === d.toISOString().slice(0, 10);
};

const euro = (value: number, digits: 0 | 2) =>
  new Intl.NumberFormat("fr-BE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);

/** « 435 € » (prix ronds) ou « 6,69 € » (prix unitaires). */
export const formatEuro = (value: number): string =>
  euro(value, Number.isInteger(value) ? 0 : 2);

/** Prix HTVA d'un prix TVAC à 6 %, arrondi au cent : 435 € donne 410,38 €. */
export const pelletPriceHT = (ttc: number): number =>
  Math.round((ttc / (1 + PELLET_OFFER.vatRate)) * 100) / 100;

/** Prix d'un sac de 15 kg, au cent : 435 € la palette donne 6,69 €. */
export const pelletPricePerBag = (ttc: number): number =>
  Math.round((ttc / PELLET_OFFER.bags) * 100) / 100;

/**
 * Prix au kilo, obligatoire à côté du prix d'un produit vendu au poids
 * (prix à l'unité de mesure) : 435 € pour 975 kg donne 0,45 €.
 */
export const pelletPricePerKg = (ttc: number): number =>
  Math.round((ttc / PALLET_NET_KG) * 100) / 100;

const dayMonth = (isoDay: string): string =>
  new Intl.DateTimeFormat("fr-BE", { day: "numeric", month: "long", timeZone: "UTC" })
    .format(new Date(`${isoDay}T12:00:00Z`))
    .replace(" ", "\u00a0");

/** « 2 novembre », tiré de PELLET_OFFER.launch.to, espace insécable. */
export const launchLastDayLabel = dayMonth(PELLET_OFFER.launch.to);

/** « 3 novembre » : premier jour au prix normal. */
export const launchNextDayLabel = (() => {
  const d = new Date(`${PELLET_OFFER.launch.to}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return dayMonth(d.toISOString().slice(0, 10)).replace(/^1\u00a0/, "1er\u00a0");
})();

/**
 * Ce que l'on sait des pellets Comfo, vérifié le 27/10/2026. Rien d'autre ne
 * s'écrit sur la page.
 *
 * - Fabricant : ERDA (Énergies Renouvelables des Ardennes SA), Bertrix, qui
 *   présente Comfo comme l'une de ses marques : https://erda.be/notre-gamme-de-pellets/
 * - DINplus A1, registre DIN CERTCO, modèle « comfo pellets », n° 7A149,
 *   valable jusqu'au 30/04/2031, 6 mm :
 *   https://www.dincertco.tuv.com/registrations/60168113
 * - Valeurs techniques : celles qu'ERDA garantit pour tous ses pellets (même
 *   page). Plafonds de la classe A1 : DIN CERTCO 2 PfG C 0444/02.25, annexe 1.
 * - EAN du sac : photo du sac sur erda.be, clé de contrôle valide.
 *
 * À NE PAS écrire : ENplus (certificat BE 002 d'ERDA terminé le 31/12/2024,
 * registre enplus-pellets.eu ; des revendeurs l'affichent encore), PEFC (logo
 * sur le sac, numéro introuvable), masse volumique, « sans écorce », essences
 * précises, pouvoir calorifique de 5 kWh/kg ou plus : aucune source fiable.
 * Le visuel fourni portait les logos ENplus et PEFC : seule la palette est
 * publiée (public/pellets/).
 */
export const COMFO = {
  certificationsShort: "certifiés DINplus A1",
  originBadge: "Fabriqué en Belgique",
  badges: ["DINplus A1", "100 % résineux", "6 mm", `Sacs de ${PELLET_OFFER.bagKg} kg`],
  intro: `Des granulés 100 % résineux fabriqués à Bertrix, dans les Ardennes belges, par ERDA. Ils sont certifiés DINplus en classe A1 et vendus en sacs de ${PELLET_OFFER.bagKg} kg, ${PELLET_OFFER.bags} sacs par palette.`,
  photoAlt: `Palette de sacs de pellets Comfo de ${PELLET_OFFER.bagKg} kg, avec des granulés en gros plan`,
  schemaDescription: `Granulés de bois 100 % résineux de 6 mm, certifiés DINplus A1 (n° 7A149), fabriqués en Belgique par ERDA à Bertrix. Palette de ${PELLET_OFFER.bags} sacs de ${PELLET_OFFER.bagKg} kg.`,
  gtin13: "5425035000002",
  specsIntro:
    "Ce que le fabricant garantit, avec entre parenthèses la limite de la classe A1 pour comparer.",
  specs: [
    { label: "Fabricant", value: "ERDA (Énergies Renouvelables des Ardennes), Bertrix, Belgique" },
    {
      label: "Certification",
      value: "DINplus classe A1 (norme ISO 17225-2), n°\u00a07A149, valable jusqu'au 30 avril 2031",
    },
    { label: "Bois", value: "100 % résineux, sciure de scieries" },
    { label: "Diamètre", value: "6 mm" },
    { label: "Longueur", value: "3,15 à 40 mm" },
    { label: "Humidité", value: "8 % au plus (classe A1 : 10 %)" },
    { label: "Taux de cendres", value: "0,40 % au plus (classe A1 : 0,7 %)" },
    { label: "Pouvoir calorifique", value: "4,8\u00a0kWh/kg au moins (classe A1 : 4,6\u00a0kWh/kg)" },
    { label: "Durabilité mécanique", value: "98 % au moins" },
    { label: "Fines", value: "0,5 % au plus" },
    { label: "Déformation des cendres", value: "1\u00a0200 °C au moins" },
    {
      label: "Conditionnement",
      value: `${PELLET_OFFER.bags} sacs de ${PELLET_OFFER.bagKg} kg, soit ${PELLET_OFFER.bags * PELLET_OFFER.bagKg} kg, sur palette perdue de 90 × 120 cm sous housse`,
    },
    { label: "Code EAN du sac", value: "5425035000002" },
  ],
  specsNote:
    "Le fabricant publie ces valeurs pour l'ensemble de ses pellets, Comfo compris. Sources : sa fiche « Notre gamme de pellets » et le registre DIN CERTCO, consultés le 27 octobre 2026. Ces pellets ne portent pas le label ENplus.",
  compatibilityAnswer:
    "Ce sont des pellets de 6 mm de classe A1, certifiés DINplus, la qualité que demandent la plupart des notices de poêles à pellets. Ils ne portent pas le label ENplus : si la notice ou la garantie de votre poêle l'exige, vérifiez avant d'acheter, ou appelez-nous avec la marque et le modèle.",
} as const;
