import type { Metadata } from "next";
import { HeroSecondary } from "@/components/sections/HeroSecondary";
import { BrandsGrid } from "@/components/sections/BrandsGrid";
import { CTAFinal } from "@/components/sections/CTAFinal";

export const metadata: Metadata = {
  title: "Nos marques de poêles à pellets, Edilkamin · EK63 · Dielle · Ferlux",
  description:
    "4 marques distribuées par Mister Pellets en Wallonie : Edilkamin (premium italien), EK63 (connecté), Dielle (hydro), Ferlux (budget). Comparaison et conseils.",
};

export default function NosMarquesHubPage() {
  return (
    <>
      <HeroSecondary
        eyebrow="4 marques · 1 stratégie"
        title={
          <>
            Les 4 marques que <span className="mp-italic">nous distribuons</span>
          </>
        }
        description="Plutôt que de tout vendre comme certains concurrents, on a sélectionné 4 marques qui couvrent l'ensemble des besoins wallons : premium pour ceux qui veulent du long terme, connecté pour les amateurs de smart home, hydro pour le remplacement de chaudière, budget pour les projets serrés. À chaque marque son créneau."
        breadcrumbs={[
          { label: "Accueil", href: "/" },
          { label: "Nos marques" },
        ]}
      />

      <BrandsGrid title="" description="" />

      <CTAFinal
        title="Pas sûr de la marque qui te correspond ?"
        description="On t'oriente en 5 minutes selon ta maison, ton budget et ton usage. Aucune obligation."
      />
    </>
  );
}
