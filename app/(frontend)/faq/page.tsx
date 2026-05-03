import type { Metadata } from "next";
import { HeroSecondary } from "@/components/sections/HeroSecondary";
import { CTAFinal } from "@/components/sections/CTAFinal";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildFAQSchema, buildPageMetadata } from "@/lib/seo";
import { FAQS } from "@/lib/faqs";
import { FaqExplorer } from "@/components/sections/FaqExplorer";

export const metadata: Metadata = buildPageMetadata({
  title: "FAQ Mister Pellets, toutes vos questions sur les poêles à pellets en Wallonie",
  description:
    "Plus de 40 questions et réponses sur les poêles à pellets en Wallonie. Choix du modèle, marques, primes 2026, installation, entretien, boutique. Recherche et filtres par catégorie.",
  path: "/faq",
  keywords: [
    "FAQ poêle à pellets",
    "questions poêle pellets Wallonie",
    "prime poêle pellets 2026",
    "entretien poêle pellets",
    "Mister Pellets",
  ],
});

export default function FAQPage() {
  const faqSchema = buildFAQSchema(
    FAQS.map((f) => ({ question: f.question, answer: f.answer })),
  );

  return (
    <>
      <JsonLd data={faqSchema} />

      <HeroSecondary
        eyebrow={`${FAQS.length} questions, 9 catégories`}
        title={
          <>
            Trouvez vite la réponse à <span className="mp-italic">votre question</span>
          </>
        }
        description="Toutes les questions que les clients nous posent en premier, compilées et catégorisées. Recherche en temps réel et filtres par catégorie. Si tu ne trouves pas, le téléphone reste le moyen le plus rapide."
        breadcrumbs={[
          { label: "Accueil", href: "/" },
          { label: "FAQ" },
        ]}
      />

      <FaqExplorer />

      <CTAFinal
        title="Pas trouvé ta réponse ?"
        description="Le téléphone reste le moyen le plus rapide pour les cas particuliers. Sinon le formulaire de contact, on revient sous 48 heures ouvrées."
        primaryCta={{ label: "Nous contacter", href: "/contact" }}
      />
    </>
  );
}
