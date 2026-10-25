import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { HeroSecondary } from "@/components/sections/HeroSecondary";
import { LEGAL_UPDATED_ON } from "@/lib/legal/company";
import { conditionsGenerales } from "@/lib/legal/conditions-generales";
import { SITE } from "@/lib/legal/site";

export const metadata: Metadata = {
  title: "Conditions générales de vente",
  description:
    "Conditions générales de vente et d'installation d'Awlest SRL, communes à ses quatre marques, avec celles de Mister Pellets : acompte, livraison, service après-vente.",
  alternates: { canonical: "https://mister-pellets.be/cgv" },
};

/*
  NE PAS remettre d'avertissement "brouillon / à finaliser" sur cette page.
  Elle est publique et sert de référence à Google Merchant Center pour
  vérifier la politique de retour et de remboursement (articles 3.2 et 3.4 de
  la Partie I) : un texte disant que les conditions ne sont pas en vigueur
  déclenche un refus. La relecture par un juriste belge reste à faire, suivie
  hors site.
*/
export default function CGVPage() {
  return (
    <>
      <HeroSecondary
        title="Conditions générales de vente et d'installation"
        description="Les mêmes conditions pour les quatre marques d'Awlest SRL. Celles propres à Mister Pellets (acompte, livraison, service après-vente) sont en Partie III."
        breadcrumbs={[
          { label: "Accueil", href: "/" },
          { label: "CGV" },
        ]}
      />
      <LegalDocument blocks={conditionsGenerales(SITE)} updatedOn={LEGAL_UPDATED_ON} />
    </>
  );
}
