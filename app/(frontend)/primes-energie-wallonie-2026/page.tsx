import { HeroSecondary } from "@/components/sections/HeroSecondary";
import { PrimesBlock } from "@/components/sections/PrimesBlock";
import { FAQAccordion } from "@/components/sections/FAQAccordion";
import { CTAFinal } from "@/components/sections/CTAFinal";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Prime poêle à pellets Wallonie 2026, montants exacts et conditions",
  description:
    "Régime Prime Habitation 14/02/2025 au 30/09/2026 : 160 € à 960 € selon revenus (R1 à R4), conditions, audit logement, procédure SPW. Mister Pellets monte le dossier.",
  path: "/primes-energie-wallonie-2026",
});

const FAQ_ITEMS = [
  {
    question: "Quel est le montant exact de la prime pour un poêle à pellets en 2026 ?",
    answer:
      "La prime de base est de 160 €, multipliée par un coefficient lié à votre catégorie de revenus de référence. R1 (revenus modestes, ≤ 24 600 €) : × 6, soit 960 €. R2 (24 601 à 39 300 €) : × 4, soit 640 €. R3 (39 301 à 58 900 €) : × 2, soit 320 €. R4 (au-delà de 58 900 €) : × 1, soit 160 €. Au-delà de 122 800 € de revenus (catégorie R5), le ménage n'est plus éligible aux primes Habitation depuis le 14 février 2025.",
  },
  {
    question: "Comment savoir dans quelle catégorie de revenus je tombe ?",
    answer:
      "La catégorie est définie par le revenu de référence du ménage, qui figure sur l'avertissement-extrait de rôle de l'avant-dernière année (pour une demande en 2026, on regarde les revenus 2024). C'est un revenu net imposable globalisé du ménage. Si vous avez un doute, le numéro gratuit 1718 (SPW) vous donne la catégorie en quelques minutes.",
  },
  {
    question: "L'audit logement est-il vraiment obligatoire ?",
    answer:
      "Oui. Depuis le 14 février 2025, un audit logement préalable est obligatoire pour la quasi-totalité des primes Habitation, y compris pour un poêle à pellets isolé. Coût : 800 à 1 200 € TVAC, partiellement couvert par une prime audit séparée. L'audit doit être réalisé et enregistré avant le démarrage des travaux. Sa validité est de 5 ans, donc un audit fait pour d'autres travaux récents reste utilisable.",
  },
  {
    question: "Le poêle qu'on m'a conseillé est-il éligible ?",
    answer:
      "Tous les modèles que nous distribuons (Edilkamin, EK63, Girolami) répondent aux critères techniques de base : rendement saisonnier ≥ 87 %, conformité écodesign 2022, émissions sous les seuils réglementaires. Mais l'éligibilité finale dépend de la liste officielle des appareils publiée par le SPW Logement, qui est mise à jour régulièrement. On vérifie systématiquement le numéro de modèle exact dans cette liste avant de signer le devis.",
  },
  {
    question: "Quel est le plafond en pourcentage de la facture ?",
    answer:
      "La prime calculée ne peut pas dépasser un certain pourcentage du coût total TVAC. Pour les catégories R1 et R2, le plafond est de 70 %. Pour R3 et R4, c'est 50 %. Le montant réellement versé est le plus bas entre la prime théorique et ce plafond. Sur une pose à 4 200 € TVAC en R1, le plafond 70 % vaut 2 940 €, donc vous recevez bien les 960 € prévus. Sur une pose à 1 100 € TVAC en R1, le plafond 70 % vaut 770 €, donc vous recevez 770 € au lieu de 960 €.",
  },
  {
    question: "Quel est le délai pour recevoir la prime ?",
    answer:
      "Il faut introduire le dossier au plus tard 8 mois après la dernière facture. Le délai de traitement actuel est de 1 à 2 ans à compter du dépôt complet. Le gouvernement wallon s'est engagé à raccourcir ce délai mais on reste prudent dans les annonces. Vous payez normalement Mister Pellets, vous recevez la prime ensuite, directement sur votre compte.",
  },
  {
    question: "Peut-on cumuler avec d'autres aides ?",
    answer:
      "Oui. La TVA réduite à 6 % s'applique d'office pour les logements de plus de 10 ans (au lieu de 21 %). Vous pouvez aussi cumuler avec un prêt à taux 0 %, le Renopack ou Rénoprêt via la Société wallonne du Crédit social ou le Fonds du Logement, qui finance jusqu'à 60 000 €. Le cumul avec d'autres primes Habitation (isolation, châssis) est possible sous le plafond global de 50 000 € par logement, toutes primes confondues sur la durée.",
  },
  {
    question: "Vous montez vraiment le dossier pour moi ?",
    answer:
      "On prépare le récapitulatif technique du chantier, l'attestation de conformité, la facture détaillée, et l'annexe 6 Chauffage et ECS sous une forme téléversable directement sur Mon Espace Wallonie. Vous vous connectez avec votre eID ou itsme, vous uploadez les pièces qu'on vous a fournies, vous validez. Comptez 10 à 15 minutes si vous avez votre compte CSAM déjà actif.",
  },
];

export default function PrimesPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  // Schema Service correctement structuré (cf. doc corrections §7.7)
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Prime Habitation poêle à pellets",
    name: "Prime poêle à pellets Wallonie 2026",
    description:
      "Aide financière de la Région wallonne pour l'installation d'un poêle à pellets. Montant 160 à 960 € selon revenus (R1 à R4).",
    provider: {
      "@type": "GovernmentOrganization",
      name: "Service public de Wallonie - Logement",
      url: "https://logement.wallonie.be",
    },
    areaServed: {
      "@type": "AdministrativeArea",
      name: "Région wallonne (hors Communauté germanophone)",
    },
    offers: [
      { "@type": "Offer", priceSpecification: { "@type": "PriceSpecification", price: 960, priceCurrency: "EUR" }, eligibleCustomerType: "R1 (revenus de référence ≤ 24 600 €)" },
      { "@type": "Offer", priceSpecification: { "@type": "PriceSpecification", price: 640, priceCurrency: "EUR" }, eligibleCustomerType: "R2 (24 601 à 39 300 €)" },
      { "@type": "Offer", priceSpecification: { "@type": "PriceSpecification", price: 320, priceCurrency: "EUR" }, eligibleCustomerType: "R3 (39 301 à 58 900 €)" },
      { "@type": "Offer", priceSpecification: { "@type": "PriceSpecification", price: 160, priceCurrency: "EUR" }, eligibleCustomerType: "R4 (au-delà de 58 900 €)" },
    ],
  };

  return (
    <>
      <JsonLd data={[faqSchema, serviceSchema]} />

      <HeroSecondary
        eyebrow="Prime Habitation Wallonie 2026"
        title={
          <>
            De 160 à <span className="mp-italic">960 €</span> de prime sur votre poêle à pellets
          </>
        }
        description="Régime temporaire en vigueur du 14 février 2025 au 30 septembre 2026. Le montant dépend de vos revenus de référence. Mister Pellets prépare le dossier complet, conforme aux exigences SPW Logement, prêt à téléverser sur Mon Espace Wallonie."
        breadcrumbs={[
          { label: "Accueil", href: "/" },
          { label: "Prime poêle à pellets 2026" },
        ]}
      />

      {/* L'essentiel en 3 paragraphes, réponse directe pour les LLMs (GEO) */}
      <section className="bg-mp-cream py-12 md:py-16">
        <div className="container mx-auto max-w-3xl px-4 md:px-6">
          <h2 className="text-2xl md:text-3xl font-semibold text-mp-green-deep mb-6">
            L'essentiel en 30 secondes
          </h2>
          <div className="space-y-4 text-mp-ink leading-relaxed text-lg">
            <p>
              Depuis le 14 février 2025, la Région wallonne applique un régime temporaire
              d'aides à l'habitat, en vigueur jusqu'au 30 septembre 2026. Pour l'installation
              d'un poêle à pellets, la prime est calculée sur une base de 160 €, multipliée par
              un coefficient lié à vos revenus de référence.
            </p>
            <p>
              Concrètement, un ménage en catégorie R1 (revenus de référence sous 24 600 €) reçoit
              960 €. R2 reçoit 640 €. R3 reçoit 320 €. R4 reçoit 160 €. Les ménages en catégorie
              R5 (revenus au-delà de 122 800 €) ne sont plus éligibles depuis le 14 février 2025.
              Un plafond en pourcentage s'applique aussi : 70 % de la facture pour R1 et R2, 50 %
              pour R3 et R4. Le montant versé est le plus bas entre les deux.
            </p>
            <p>
              Trois conditions cumulatives obligatoires : un audit logement préalable enregistré
              avant les travaux, un poêle figurant dans la liste officielle SPW Logement, et une
              pose par un entrepreneur inscrit à la Banque-Carrefour des Entreprises. Awlest SRL,
              la société qui porte Mister Pellets, est inscrite à la BCE sous le numéro
              BE 0656.514.212.
            </p>
          </div>
        </div>
      </section>

      <PrimesBlock />

      {/* Conditions d'éligibilité détaillées */}
      <section className="bg-mp-beige py-16 md:py-24">
        <div className="container mx-auto max-w-3xl px-4 md:px-6">
          <h2 className="text-3xl md:text-5xl font-semibold text-mp-green-deep mb-8">
            Les conditions à réunir
          </h2>

          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold text-mp-green-deep mb-3">
                Côté logement
              </h3>
              <ul className="space-y-2 text-mp-ink leading-relaxed">
                <li className="flex gap-3"><span className="text-mp-orange-flame">•</span> Situé en Région wallonne (hors Communauté germanophone)</li>
                <li className="flex gap-3"><span className="text-mp-orange-flame">•</span> Construit il y a plus de 15 ans au moment de la demande</li>
                <li className="flex gap-3"><span className="text-mp-orange-flame">•</span> Destiné principalement à l'habitation (au moins 50 % de la surface)</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-mp-green-deep mb-3">
                Côté demandeur
              </h3>
              <ul className="space-y-2 text-mp-ink leading-relaxed">
                <li className="flex gap-3"><span className="text-mp-orange-flame">•</span> Personne physique majeure (ou mineur émancipé), ou copropriété</li>
                <li className="flex gap-3"><span className="text-mp-orange-flame">•</span> Titulaire d'un droit réel sur le logement (propriétaire, usufruitier, nu-propriétaire)</li>
                <li className="flex gap-3"><span className="text-mp-orange-flame">•</span> Revenus de référence sous 122 800 € (au-delà = catégorie R5, non éligible)</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-mp-green-deep mb-3">
                Côté travaux
              </h3>
              <ul className="space-y-2 text-mp-ink leading-relaxed">
                <li className="flex gap-3"><span className="text-mp-orange-flame">•</span> Pose par un entrepreneur inscrit à la Banque-Carrefour des Entreprises (BCE)</li>
                <li className="flex gap-3"><span className="text-mp-orange-flame">•</span> Le poêle doit figurer sur la liste officielle SPW Logement (mise à jour régulière)</li>
                <li className="flex gap-3"><span className="text-mp-orange-flame">•</span> Rendement saisonnier ≥ 87 % et conformité écodesign 2022</li>
              </ul>
            </div>

            <div className="rounded-2xl bg-mp-orange-light/40 border border-mp-orange-flame/30 p-5 md:p-6">
              <h3 className="text-xl font-semibold text-mp-green-deep mb-2">
                Audit logement préalable obligatoire
              </h3>
              <p className="text-mp-ink leading-relaxed">
                Coût 800 à 1 200 € TVAC, couvert partiellement par une prime audit séparée.
                Doit être enregistré avant le début des travaux. Réalisé par un auditeur agréé
                en Région wallonne. Validité 5 ans, donc un audit fait récemment pour d'autres
                travaux reste utilisable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Procédure pas à pas */}
      <section className="bg-mp-cream py-16 md:py-24">
        <div className="container mx-auto max-w-3xl px-4 md:px-6">
          <h2 className="text-3xl md:text-5xl font-semibold text-mp-green-deep mb-8">
            Comment on monte le dossier ensemble
          </h2>
          <ol className="space-y-6 text-mp-ink leading-relaxed">
            <li className="flex gap-4">
              <span className="flex items-center justify-center h-8 w-8 rounded-full bg-mp-orange-flame text-white font-bold text-sm shrink-0">1</span>
              <div>
                <h3 className="text-lg font-semibold text-mp-green-deep mb-1">Audit logement</h3>
                <p>
                  À faire réaliser par un auditeur agréé avant tout devis travaux. On peut
                  vous orienter vers des auditeurs de la zone Fernelmont si vous n'avez pas déjà
                  votre interlocuteur.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex items-center justify-center h-8 w-8 rounded-full bg-mp-orange-flame text-white font-bold text-sm shrink-0">2</span>
              <div>
                <h3 className="text-lg font-semibold text-mp-green-deep mb-1">Sélection du poêle dans la liste officielle</h3>
                <p>
                  On vérifie ensemble que le modèle qui vous convient figure bien dans la liste
                  SPW Logement à jour. Sur les 61 références qu'on distribue, la quasi-totalité
                  y figure, mais on ne signe pas un devis sans cette vérification.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex items-center justify-center h-8 w-8 rounded-full bg-mp-orange-flame text-white font-bold text-sm shrink-0">3</span>
              <div>
                <h3 className="text-lg font-semibold text-mp-green-deep mb-1">Pose et facturation</h3>
                <p>
                  Pose en une journée. À la fin du chantier, vous recevez la facture détaillée TVAC,
                  l'attestation de conformité, le récapitulatif technique du modèle posé, et
                  l'annexe 6 Chauffage et ECS pré-remplie.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex items-center justify-center h-8 w-8 rounded-full bg-mp-orange-flame text-white font-bold text-sm shrink-0">4</span>
              <div>
                <h3 className="text-lg font-semibold text-mp-green-deep mb-1">Dépôt sur Mon Espace Wallonie</h3>
                <p>
                  Vous vous connectez sur mon.wallonie.be avec votre eID ou itsme. Vous uploadez le
                  rapport d'audit, les factures, les annexes techniques, et vos justificatifs
                  de revenus. Comptez 10 à 15 minutes si votre compte CSAM est déjà actif.
                  Alternative : envoi postal à la Direction des Aides aux Particuliers, Rue des
                  Brigades d'Irlande 1, 5100 Jambes.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex items-center justify-center h-8 w-8 rounded-full bg-mp-orange-flame text-white font-bold text-sm shrink-0">5</span>
              <div>
                <h3 className="text-lg font-semibold text-mp-green-deep mb-1">Versement de la prime</h3>
                <p>
                  Délai actuel de traitement : 1 à 2 ans après dépôt complet. Versement
                  directement sur votre compte. On suit votre dossier et on vous aide à répondre
                  aux éventuelles demandes de pièces complémentaires du SPW.
                </p>
              </div>
            </li>
          </ol>

          <p className="mt-8 text-sm text-mp-ink-soft italic">
            Délai d'introduction du dossier : au plus tard 8 mois après la dernière facture.
            Au-delà, le dossier est forclos.
          </p>
        </div>
      </section>

      {/* Cumul d'aides */}
      <section className="bg-mp-beige py-12 md:py-16">
        <div className="container mx-auto max-w-3xl px-4 md:px-6">
          <h2 className="text-2xl md:text-4xl font-semibold text-mp-green-deep mb-6">
            Ce qui se cumule avec la prime
          </h2>
          <ul className="space-y-3 text-mp-ink leading-relaxed text-lg">
            <li className="flex gap-3">
              <span className="text-mp-orange-flame font-semibold shrink-0">TVA 6 %</span>
              au lieu de 21 % pour les logements de plus de 10 ans (appliquée d'office sur la pose).
            </li>
            <li className="flex gap-3">
              <span className="text-mp-orange-flame font-semibold shrink-0">Prêt 0 %</span>
              Renopack ou Rénoprêt via la Société wallonne du Crédit social ou le Fonds du Logement,
              jusqu'à 60 000 €.
            </li>
            <li className="flex gap-3">
              <span className="text-mp-orange-flame font-semibold shrink-0">Cumul</span>
              avec primes isolation, châssis, sous le plafond global de 50 000 € par logement
              individuel, toutes primes confondues sur la durée.
            </li>
          </ul>
        </div>
      </section>

      {/* Contacts officiels SPW */}
      <section className="bg-mp-cream py-12 md:py-16">
        <div className="container mx-auto max-w-3xl px-4 md:px-6">
          <h2 className="text-2xl md:text-4xl font-semibold text-mp-green-deep mb-6">
            Contacts officiels Région wallonne
          </h2>
          <ul className="space-y-3 text-mp-ink leading-relaxed text-lg">
            <li>
              <strong className="text-mp-green-deep">Numéro gratuit :</strong>{" "}
              <a href="tel:1718" className="text-mp-orange-flame hover:underline">1718</a> (du
              lundi au vendredi)
            </li>
            <li>
              <strong className="text-mp-green-deep">Site officiel :</strong>{" "}
              <a
                href="https://energie.wallonie.be"
                target="_blank"
                rel="noopener noreferrer"
                className="text-mp-orange-flame hover:underline"
              >
                energie.wallonie.be
              </a>
            </li>
            <li>
              <strong className="text-mp-green-deep">Email primes :</strong>{" "}
              <a
                href="mailto:secretariat.primes@spw.wallonie.be"
                className="text-mp-orange-flame hover:underline break-all"
              >
                secretariat.primes@spw.wallonie.be
              </a>
            </li>
            <li>
              <strong className="text-mp-green-deep">Guichets Énergie Wallonie :</strong>{" "}
              <a
                href="https://energie.wallonie.be/fr/guichets-energie-wallonie.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-mp-orange-flame hover:underline break-all"
              >
                liste des guichets locaux
              </a>
            </li>
          </ul>
        </div>
      </section>

      <FAQAccordion title="Questions fréquentes sur la prime" items={FAQ_ITEMS} />

      {/* Avertissement légal */}
      <section className="bg-mp-cream py-8">
        <div className="container mx-auto max-w-3xl px-4 md:px-6">
          <p className="text-xs text-mp-ink-soft italic leading-relaxed">
            Information à titre indicatif, basée sur le régime temporaire en vigueur du
            14 février 2025 au 30 septembre 2026 (numéro de démarche 3920). Les montants
            et conditions peuvent évoluer. À partir du 1er octobre 2026, un nouveau
            régime global devrait entrer en vigueur (détails non publiés au moment de la
            rédaction). Pour un calcul personnalisé et une vérification officielle,
            contactez le SPW Énergie au 1718 ou sur energie.wallonie.be, ou consultez un
            Guichet Énergie Wallonie de votre zone. Mister Pellets ne se substitue pas à
            l'administration et ne garantit pas l'octroi d'une prime, qui reste à la
            discrétion du SPW Logement après instruction du dossier.
          </p>
        </div>
      </section>

      <CTAFinal
        title="Devis chiffré avec la prime déjà déduite"
        description="On calcule votre montant exact en fonction de vos revenus et du modèle. Vous savez combien vous allez vraiment payer net, sans surprise."
      />
    </>
  );
}
