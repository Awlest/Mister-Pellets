import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { HeroSecondary } from "@/components/sections/HeroSecondary";
import { LEGAL_UPDATED_ON } from "@/lib/legal/company";
import { SITE } from "@/lib/legal/site";
import { viePrivee } from "@/lib/legal/vie-privee";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description:
    "Ce que Mister Pellets fait de vos données : formulaires, rendez-vous, mesure Google, durées de conservation et vos droits RGPD.",
  alternates: { canonical: "https://mister-pellets.be/politique-confidentialite" },
};

export default function PolitiqueConfidentialitePage() {
  return (
    <>
      <HeroSecondary
        title="Politique de confidentialité"
        description="Ce que nous gardons de vous, pourquoi, et comment le faire corriger ou effacer."
        breadcrumbs={[
          { label: "Accueil", href: "/" },
          { label: "Politique de confidentialité" },
        ]}
      />
      <LegalDocument blocks={viePrivee(SITE)} updatedOn={LEGAL_UPDATED_ON} />
    </>
  );
}
