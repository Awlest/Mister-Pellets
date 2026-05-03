import type { Metadata } from "next";
import { HeroSecondary } from "@/components/sections/HeroSecondary";
import { BrandsGrid } from "@/components/sections/BrandsGrid";
import { CTAFinal } from "@/components/sections/CTAFinal";

export const metadata: Metadata = {
  title: "Nos marques de poêles à pellets : Edilkamin · EK63 · Dielle · Ferlux",
  description:
    "Les 4 marques distribuées par Mister Pellets en Wallonie. Edilkamin (référence italienne 1963, gamme très large), EK63 (groupe Edilkamin, Wi-Fi de série), Dielle (combustion brevetée par alimentation par le bas), Ferlux (Espagne, gamme complète, excellent rapport qualité-prix).",
};

export default function NosMarquesHubPage() {
  return (
    <>
      <HeroSecondary
        eyebrow="4 marques sélectionnées"
        title={
          <>
            Les 4 marques que <span className="mp-italic">nous distribuons</span>
          </>
        }
        description="Plutôt que de tout vendre, on a sélectionné 4 marques qui couvrent l'ensemble des besoins wallons. Edilkamin pour la profondeur de gamme italienne, EK63 (sa marque sœur) pour les modèles connectés accessibles, Dielle pour son système breveté de combustion par alimentation par le bas, Ferlux pour la gamme espagnole complète à excellent rapport qualité-prix. À chaque marque son créneau."
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
