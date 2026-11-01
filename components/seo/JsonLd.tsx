interface JsonLdProps {
  data: Record<string, unknown> | Array<Record<string, unknown>>;
}

/**
 * Injecte un Schema.org JSON-LD dans le DOM (server-rendered, idéal SEO + GEO).
 * Cf. brief §9.1.
 *
 * @example
 * <JsonLd data={{
 *   "@context": "https://schema.org",
 *   "@type": "Product",
 *   "name": "Edilkamin Blade 9kW",
 *   ...
 * }} />
 */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/**
 * Identité de l'entreprise, nœud unique pour tout le site.
 *
 * Il y avait auparavant DEUX nœuds pour une seule entreprise : un
 * `Organization` (#organization, sans téléphone) injecté par le layout racine,
 * et un `HomeAndConstructionBusiness` (#business, avec téléphone) injecté par
 * l'accueil et la page contact. Rien ne les reliait, donc un moteur ou un
 * assistant voyait deux entreprises distinctes à la même adresse, dont une
 * injoignable. Tout est désormais porté par un seul @id, #organization, et
 * `HomeAndConstructionBusiness` est un sous-type d'`Organization` : un seul
 * nœud suffit à décrire les deux facettes.
 *
 * Les pendants vivent dans mister-clim/lib/entity.ts et
 * mister-bois/components/seo/JsonLd.tsx, et pointent vers la même société mère
 * (https://awlest.be/#organization).
 */

const ADDRESS = {
  "@type": "PostalAddress",
  streetAddress: "Rue des Fagotis 3A",
  postalCode: "5380",
  addressLocality: "Fernelmont",
  addressRegion: "Namur",
  addressCountry: "BE",
};

/**
 * Profils externes désignant la même entité (Schema.org `sameAs`).
 *
 * C'est ce tableau qui relie le site à sa fiche Google Business et à ses
 * réseaux : sans lui, rien ne dit à Google ni à un assistant que le site, la
 * fiche et les pages sociales parlent de la même entreprise.
 *
 * Fiche Google « Mister Pellets » (Rue des Fagotis 3A, Fernelmont, site
 * mister-pellets.be), par son identifiant Maps (cid), relevé le 25/10/2026 :
 * même forme que le sameAs d'awlest.be. Ajouter les pages sociales le jour où
 * elles sont réellement actives. Ne rien mettre d'inventé : une URL morte dans
 * `sameAs` est pire que l'absence d'entrée.
 */
export const SAME_AS: string[] = ["https://maps.google.com/?cid=16187368063678582693"];

/**
 * Société mère, même nœud sur les trois sites Mister et même @id que celui
 * qu'awlest.be déclare pour lui-même : les moteurs et les assistants relient
 * ainsi les quatre sites à une seule entreprise. Jusqu'au 25/10/2026, l'@id
 * était https://mister-pellets.be/#awlest, partagé avec Mister Clim seulement.
 */
export const AWLEST_ORGANIZATION = {
  "@type": "Organization",
  "@id": "https://awlest.be/#organization",
  name: "Awlest",
  legalName: "Awlest SRL",
  url: "https://awlest.be",
  foundingDate: "2016",
  vatID: "BE0656514212",
  identifier: { "@type": "PropertyValue", propertyID: "BCE", value: "0656.514.212" },
  description:
    "Installateur belge actif en Wallonie depuis 2016. Mister Pellets (poêles à pellets), Mister Clim (climatisation réversible) et Mister Bois (poêles et inserts à bois) sont ses trois marques : une seule société.",
  address: ADDRESS,
};

export const ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "HomeAndConstructionBusiness",
  "@id": "https://mister-pellets.be/#organization",
  name: "Mister Pellets",
  legalName: "Awlest SRL",
  alternateName: ["Mister Pellets", "Awlest", "Awlest SRL"],
  foundingDate: "2016",
  description:
    "Vente et installation de poêles à pellets en Wallonie (MCZ, Edilkamin, EK63, Girolami, Austroflamm, Cadel) : tubage de cheminée, sortie ventouse, conduit neuf, entretien annuel, ramonage et dépannage. Showroom à Fernelmont accessible uniquement sur rendez-vous.",
  url: "https://mister-pellets.be",
  logo: "https://mister-pellets.be/logo-mister-pellets-full.svg",
  image: "https://mister-pellets.be/logo-mister-pellets-full.svg",
  telephone: "+3281138309",
  email: "info@awlest.com",
  vatID: "BE0656514212",
  priceRange: "€€",
  currenciesAccepted: "EUR",
  parentOrganization: AWLEST_ORGANIZATION,
  ...(SAME_AS.length > 0 ? { sameAs: SAME_AS } : {}),
  address: ADDRESS,
  geo: {
    "@type": "GeoCoordinates",
    latitude: 50.55,
    longitude: 5.0167,
  },
  hasMap:
    "https://www.google.com/maps/search/?api=1&query=Mister+Pellets+Rue+des+Fagotis+3A+5380+Fernelmont",
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+3281138309",
    email: "info@awlest.com",
    contactType: "customer service",
    areaServed: "BE",
    availableLanguage: "French",
    // Heures du téléphone. Le showroom n'a pas d'heures d'ouverture au
    // public (visite uniquement sur rendez-vous) : ces heures sont portées
    // par le point de contact et pas par l'entreprise, pour qu'aucun moteur
    // ne les affiche comme des heures où l'on peut passer sans prévenir.
    hoursAvailable: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "18:00",
      },
      // Samedi et dimanche : fermé (octobre 2026).
    ],
  },
  areaServed: [
    { "@type": "AdministrativeArea", name: "Province de Namur" },
    { "@type": "AdministrativeArea", name: "Province de Liège" },
    { "@type": "AdministrativeArea", name: "Province du Hainaut" },
    { "@type": "AdministrativeArea", name: "Province du Brabant wallon" },
    { "@type": "AdministrativeArea", name: "Province du Luxembourg" },
  ],
  // Pas d'aggregateRating ni de review, et ne pas en remettre : les avis
  // affichés sur le site sont ceux de la fiche Google d'Awlest, repris dans
  // l'admin (« Avis Google »). Google refuse les avis qu'une entreprise
  // publie sur elle-même (LocalBusiness, Organization) ou reprend d'une autre
  // plateforme, et les étoiles d'avis de tiers vues comme les nôtres seraient
  // trompeuses. La note s'affiche en contenu, avec le lien vers la fiche.
  //
  // Pas d'openingHoursSpecification : le showroom se visite uniquement sur
  // rendez-vous (octobre 2026). Les heures du téléphone sont sur contactPoint.
};
