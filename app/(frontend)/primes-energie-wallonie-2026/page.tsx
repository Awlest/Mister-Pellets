import type { Metadata } from "next";
import { HeroSecondary } from "@/components/sections/HeroSecondary";
import { PrimesBlock } from "@/components/sections/PrimesBlock";
import { FAQAccordion } from "@/components/sections/FAQAccordion";
import { CTAFinal } from "@/components/sections/CTAFinal";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Primes énergie Wallonie 2026 — Poêle à pellets",
  description:
    "Jusqu'à 1 750 € de primes Wallonie pour un poêle à pellets en 2026. Calcul selon revenus, conditions techniques, et démarches. On monte le dossier pour toi.",
};

const FAQ_ITEMS = [
  {
    question: "Qui peut bénéficier de la prime ?",
    answer:
      "Tout propriétaire ou occupant d'un logement existant en Wallonie depuis plus de 5 ans. Locataire avec accord écrit du propriétaire accepté. Le logement doit être situé en région wallonne (Bruxelles et Flandre ont leurs propres dispositifs).",
  },
  {
    question: "Comment savoir dans quelle catégorie de revenus je tombe ?",
    answer:
      "La catégorie est définie par les revenus imposables globaux du ménage de l'avant-dernière année. Pour une demande en 2026, on regarde donc les revenus 2024. R1 (modestes) : jusqu'à environ 24 800 € pour un isolé, R2 (moyens) : jusqu'à 39 700 €, R3 (supérieurs) : au-delà. Les seuils varient selon la composition du ménage.",
  },
  {
    question: "Quelles caractéristiques le poêle doit-il avoir ?",
    answer:
      "Rendement supérieur ou égal à 87 %, émissions de CO ≤ 250 mg/m³, certification écodesign 2022. Tous les modèles que nous distribuons (Edilkamin, EK63, Dielle, Ferlux) répondent à ces critères. On te confirme avant signature du devis.",
  },
  {
    question: "Faut-il faire un audit énergétique avant ?",
    answer:
      "Non, pas pour un poêle à pellets seul. L'audit n'est obligatoire que pour les bouquets de travaux ou pour des primes plus élevées sur l'enveloppe du bâtiment. Pour le poêle, ta facture d'installateur certifié et l'attestation de conformité suffisent.",
  },
  {
    question: "Combien de temps pour recevoir la prime ?",
    answer:
      "Compte 4 à 8 mois entre l'envoi du dossier et le versement, selon la charge de travail du SPW Énergie. Le paiement arrive directement sur ton compte. Tu n'as rien à avancer côté installateur — tu paies normalement, tu récupères la prime ensuite.",
  },
  {
    question: "Vous montez vraiment le dossier pour moi ?",
    answer:
      "Oui, on prépare les documents et on les fournit sous forme exploitable. Tu n'as plus qu'à les téléverser sur le portail du SPW Énergie. On a un template tout fait, tu cliques 5 fois et c'est envoyé.",
  },
  {
    question: "Et si mon PEB est F ou G ?",
    answer:
      "Bonus de 250 € qui s'ajoute à la prime de base. C'est le cas typique d'une vieille maison non isolée. Si tu profites de l'occasion pour aussi isoler, des primes supplémentaires existent côté isolation — on peut t'orienter vers un partenaire isolation si tu veux faire les deux.",
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

  return (
    <>
      <JsonLd data={faqSchema} />

      <HeroSecondary
        eyebrow="Primes Wallonie 2026"
        title={
          <>
            Jusqu'à <span className="mp-italic">1 750 €</span> de prime sur ton poêle à pellets
          </>
        }
        description="Calcul fait selon ton revenu et ta catégorie PEB. On monte le dossier pour toi, sans paperasse à gérer de ton côté. Tu reçois la prime directement sur ton compte 4 à 8 mois après le dépôt."
        breadcrumbs={[
          { label: "Accueil", href: "/" },
          { label: "Primes 2026" },
        ]}
      />

      {/* L'essentiel en 3 paragraphes */}
      <section className="bg-mp-cream py-12 md:py-16">
        <div className="container mx-auto max-w-3xl px-4 md:px-6 prose prose-lg max-w-none">
          <h2 className="text-2xl md:text-3xl font-semibold text-mp-green-deep mb-6">
            L'essentiel en 30 secondes
          </h2>
          <div className="space-y-4 text-mp-ink leading-relaxed text-lg">
            <p>
              La Région wallonne soutient le passage aux pellets via une prime versée après installation.
              Le montant dépend de ton revenu (catégorie R1, R2 ou R3) et d'un éventuel bonus PEB F-G.
              Il faut un installateur certifié et un appareil écodesign 2022 — c'est notre cas pour
              tous les modèles.
            </p>
            <p>
              Tu paies normalement Mister Pellets, tu reçois la prime sur ton compte 4 à 8 mois après
              le dépôt du dossier. Pas d'avance à faire de notre côté. On t'aide à monter le dossier,
              on te le fournit prêt à téléverser sur le portail du SPW Énergie.
            </p>
            <p>
              <strong>Les chiffres pour 2026</strong> : 1 500 € pour les revenus R1, 750 € pour les R2,
              375 € pour les R3. Bonus de 250 € si ton PEB est F ou G. Cumulables avec d'autres aides
              (province, commune, banque) selon ton dossier.
            </p>
          </div>
        </div>
      </section>

      <PrimesBlock />

      {/* Comment monter le dossier */}
      <section className="bg-mp-beige py-16 md:py-24">
        <div className="container mx-auto max-w-3xl px-4 md:px-6">
          <h2 className="text-3xl md:text-5xl font-semibold text-mp-green-deep mb-8">
            Comment on monte le dossier ensemble
          </h2>
          <ol className="space-y-6 text-mp-ink leading-relaxed">
            <li className="flex gap-4">
              <span className="flex items-center justify-center h-8 w-8 rounded-full bg-mp-orange-flame text-white font-bold text-sm shrink-0">1</span>
              <div>
                <h3 className="text-lg font-semibold text-mp-green-deep mb-1">Tu nous dis tes revenus</h3>
                <p>Sur le devis, on te demande dans quelle catégorie tu te situes (sans justificatif à ce stade). Ça nous permet de chiffrer la prime nette.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex items-center justify-center h-8 w-8 rounded-full bg-mp-orange-flame text-white font-bold text-sm shrink-0">2</span>
              <div>
                <h3 className="text-lg font-semibold text-mp-green-deep mb-1">On installe</h3>
                <p>Pose en 1 journée par notre équipe certifiée RGIE. Tu paies Mister Pellets normalement.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex items-center justify-center h-8 w-8 rounded-full bg-mp-orange-flame text-white font-bold text-sm shrink-0">3</span>
              <div>
                <h3 className="text-lg font-semibold text-mp-green-deep mb-1">On te fournit le pack dossier</h3>
                <p>Facture détaillée, attestation de conformité écodesign 2022, certificat installateur, fiche technique du modèle. Tout sous forme PDF prêt à téléverser.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex items-center justify-center h-8 w-8 rounded-full bg-mp-orange-flame text-white font-bold text-sm shrink-0">4</span>
              <div>
                <h3 className="text-lg font-semibold text-mp-green-deep mb-1">Tu envoies sur le portail SPW</h3>
                <p>Compte CSAM (eID ou itsme), tu uploades les 4 docs, tu valides. 10 minutes maximum si tu as les fichiers sous la main.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex items-center justify-center h-8 w-8 rounded-full bg-mp-orange-flame text-white font-bold text-sm shrink-0">5</span>
              <div>
                <h3 className="text-lg font-semibold text-mp-green-deep mb-1">Tu reçois la prime</h3>
                <p>Versement direct sur ton compte 4 à 8 mois plus tard. On suit ton dossier jusqu'au paiement, on t'aide en cas de questions complémentaires du SPW.</p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      <FAQAccordion
        title="Questions fréquentes sur la prime"
        items={FAQ_ITEMS}
      />

      <CTAFinal
        title="Devis chiffré avec ta prime déjà déduite"
        description="On calcule ton montant exact en fonction de tes revenus et du modèle. Tu sais combien tu vas vraiment payer après prime, sans surprise."
      />
    </>
  );
}
