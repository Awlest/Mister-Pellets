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
 * Schema Organization du site (à mettre une fois dans le layout racine).
 */
export const ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://mister-pellets.be/#organization",
  name: "Mister Pellets",
  legalName: "Awlest SRL",
  url: "https://mister-pellets.be",
  logo: "https://mister-pellets.be/logo-mister-pellets-full.svg",
  vatID: "BE0656514212",
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+32472043222",
    email: "info@awlest.com",
    contactType: "customer service",
    areaServed: "BE",
    availableLanguage: "French",
  },
  address: {
    "@type": "PostalAddress",
    streetAddress: "Rue des Fagotis 3A",
    postalCode: "5380",
    addressLocality: "Fernelmont",
    addressCountry: "BE",
  },
};

/**
 * Schema LocalBusiness (HomeAndConstructionBusiness), page d'accueil.
 */
export const LOCAL_BUSINESS_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "HomeAndConstructionBusiness",
  "@id": "https://mister-pellets.be/#business",
  name: "Mister Pellets",
  alternateName: "Awlest SRL",
  url: "https://mister-pellets.be",
  image: "https://mister-pellets.be/logo-mister-pellets-full.svg",
  telephone: "+32472043222",
  email: "info@awlest.com",
  vatID: "BE0656514212",
  priceRange: "€€",
  currenciesAccepted: "EUR",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Rue des Fagotis 3A",
    postalCode: "5380",
    addressLocality: "Fernelmont",
    addressCountry: "BE",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 50.55,
    longitude: 5.0167,
  },
  areaServed: [
    { "@type": "AdministrativeArea", name: "Province de Namur" },
    { "@type": "AdministrativeArea", name: "Province de Liège" },
    { "@type": "AdministrativeArea", name: "Province du Hainaut" },
    { "@type": "AdministrativeArea", name: "Province du Brabant wallon" },
    { "@type": "AdministrativeArea", name: "Province du Luxembourg" },
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    reviewCount: "200",
    bestRating: "5",
  },
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
