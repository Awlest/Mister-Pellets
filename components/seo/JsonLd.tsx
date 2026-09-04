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
 * Le pendant côté clim vit dans mister-clim/lib/entity.ts, et pointe vers le
 * même @id de société mère (#awlest).
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
 * À compléter dès que la fiche Google Business « Mister Pellets » est validée :
 * coller son URL courte (Google Business Profile → Partager votre fiche,
 * format https://g.page/... ou https://maps.app.goo.gl/...), puis les pages
 * sociales réellement actives. Ne rien mettre d'inventé : une URL morte dans
 * `sameAs` est pire que l'absence d'entrée.
 */
export const SAME_AS: string[] = [];

/** Société mère. Même @id que celui déclaré sur mister-clim.be. */
export const AWLEST_ORGANIZATION = {
  "@type": "Organization",
  "@id": "https://mister-pellets.be/#awlest",
  name: "Awlest SRL",
  legalName: "Awlest SRL",
  foundingDate: "2016",
  description:
    "Société belge active en Wallonie depuis 2016. Elle exploite la marque Mister Pellets pour la vente, la pose et l'entretien de poêles à pellets, et la marque Mister Clim pour la climatisation réversible.",
  vatID: "BE0656514212",
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
    "Vente et installation de poêles à pellets en Wallonie (Edilkamin, EK63, Girolami) : tubage de cheminée, sortie ventouse, conduit neuf, entretien annuel, ramonage et dépannage. Showroom à Fernelmont accessible uniquement sur rendez-vous.",
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
  },
  areaServed: [
    { "@type": "AdministrativeArea", name: "Province de Namur" },
    { "@type": "AdministrativeArea", name: "Province de Liège" },
    { "@type": "AdministrativeArea", name: "Province du Hainaut" },
    { "@type": "AdministrativeArea", name: "Province du Brabant wallon" },
    { "@type": "AdministrativeArea", name: "Province du Luxembourg" },
  ],
  // Hotfix V1.3 §P6 : aggregateRating retiré pour le lancement. Les avis
  // Google 4,9/200 existent mais sur la fiche Awlest (maison mère), pas sur
  // Mister Pellets directement. À réintroduire quand la marque commerciale
  // Mister Pellets aura ses propres avis vérifiés (collection Payload
  // Testimonials avec source datée).
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "18:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Saturday",
      opens: "09:00",
      closes: "13:00",
    },
  ],
};
