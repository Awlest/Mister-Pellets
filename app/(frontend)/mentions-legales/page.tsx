import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { HeroSecondary } from "@/components/sections/HeroSecondary";
import { LEGAL_UPDATED_ON } from "@/lib/legal/company";
import { mentionsLegales } from "@/lib/legal/mentions-legales";
import { SITE } from "@/lib/legal/site";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Mentions légales de Mister Pellets, marque d'Awlest SRL : éditeur, siège, hébergement, assurances et médiation.",
  alternates: { canonical: "https://mister-pellets.be/mentions-legales" },
};

export default function MentionsLegalesPage() {
  return (
    <>
      <HeroSecondary
        title="Mentions légales"
        breadcrumbs={[
          { label: "Accueil", href: "/" },
          { label: "Mentions légales" },
        ]}
      />
      <LegalDocument blocks={mentionsLegales(SITE)} updatedOn={LEGAL_UPDATED_ON} />
    </>
  );
}
