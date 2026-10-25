import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { HeroSecondary } from "@/components/sections/HeroSecondary";
import { LEGAL_UPDATED_ON } from "@/lib/legal/company";
import { cookies } from "@/lib/legal/cookies";
import { SITE } from "@/lib/legal/site";

export const metadata: Metadata = {
  title: "Politique cookies",
  description:
    "Les cookies Google du site Mister Pellets, ce qu'ils mesurent, ce qui part chez Google sans votre accord et comment changer d'avis.",
  alternates: { canonical: "https://mister-pellets.be/politique-cookies" },
};

export default function PolitiqueCookiesPage() {
  return (
    <>
      <HeroSecondary
        title="Politique cookies"
        description="Ce que le site enregistre sur votre appareil, pourquoi, et comment changer d'avis."
        breadcrumbs={[
          { label: "Accueil", href: "/" },
          { label: "Politique cookies" },
        ]}
      />
      <LegalDocument blocks={cookies(SITE)} updatedOn={LEGAL_UPDATED_ON} />
    </>
  );
}
