import type { Metadata } from "next";
import Link from "next/link";
import { HeroSecondary } from "@/components/sections/HeroSecondary";
import { BrandsGrid } from "@/components/sections/BrandsGrid";
import { CTAFinal } from "@/components/sections/CTAFinal";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title:
    "Nos marques de poêles à pellets : Edilkamin · EK63 · Girolami · Dielle · Ferlux",
  description:
    "Les 5 marques distribuées par Mister Pellets en Wallonie. Trois marques premium mises en avant : Edilkamin (référence italienne 1963), EK63 (groupe Edilkamin, Wi-Fi de série), Girolami (polycombustible breveté auto-nettoyant). Plus Dielle et Ferlux.",
  alternates: { canonical: "https://mister-pellets.be/nos-marques" },
};

/** Comparatif des 3 marques premium — brief marques §E.1. */
const COMPARISON: { criterion: string; edilkamin: string; ek63: string; girolami: string }[] = [
  {
    criterion: "Positionnement",
    edilkamin: "Référence premium",
    ek63: "Connecté accessible",
    girolami: "Polycombustible breveté",
  },
  {
    criterion: "Origine",
    edilkamin: "Milan (Lainate), 1963",
    ek63: "Plateforme Edilkamin",
    girolami: "Sant'Oreste (Rome), 1970",
  },
  {
    criterion: "Techno phare",
    edilkamin: "Leonardo (autorégulation)",
    ek63: "Wi-Fi Smart de série",
    girolami: "Source Feeding (auto-nettoyage)",
  },
  {
    criterion: "Combustible",
    edilkamin: "Pellet",
    ek63: "Pellet",
    girolami: "Pellet, bois, hybride",
  },
  {
    criterion: "Canalisable",
    edilkamin: "Oui",
    ek63: "Oui",
    girolami: "Oui",
  },
  {
    criterion: "Hydro",
    edilkamin: "Oui",
    ek63: "Oui",
    girolami: "Oui",
  },
  {
    criterion: "Hybride bois-pellet",
    edilkamin: "Non",
    ek63: "Non",
    girolami: "Oui",
  },
  {
    criterion: "Wi-Fi de série",
    edilkamin: "Selon modèle",
    ek63: "Oui sur la majorité",
    girolami: "Oui sur gamme moderne",
  },
  {
    criterion: "Étanchéité",
    edilkamin: "Sur gamme étanche",
    ek63: "Quasi toute la gamme",
    girolami: "Selon modèle",
  },
];

const ADVICE: { need: string; brand: string; why: string }[] = [
  {
    need: "Je veux une marque qui a fait ses preuves",
    brand: "Edilkamin",
    why: "60+ ans d'historique, 30+ pays, durée de vie observée 15 à 20 ans.",
  },
  {
    need: "Je veux un poêle connecté sans payer le surcoût premium",
    brand: "EK63",
    why: "Wi-Fi de série, étanche, 15 à 25 % moins cher qu'un Edilkamin équivalent.",
  },
  {
    need: "Je veux pellet et bois dans la même machine, sans nettoyage quotidien",
    brand: "Girolami",
    why: "Brevet auto-nettoyant Source Feeding et Fuel Convert System.",
  },
];

export default function NosMarquesHubPage() {
  return (
    <>
      <HeroSecondary
        eyebrow="5 marques sélectionnées"
        title={
          <>
            Les marques que <span className="mp-italic">nous distribuons</span>
          </>
        }
        description="Plutôt que de tout vendre, on a sélectionné cinq marques qui couvrent l'ensemble des besoins wallons. Trois marques premium qu'on met en avant : Edilkamin pour la profondeur de gamme italienne, EK63 (sa marque sœur) pour les modèles connectés accessibles, Girolami pour son brevet polycombustible auto-nettoyant. Et deux marques solides en complément : Dielle et Ferlux. À chaque marque son créneau."
        breadcrumbs={[
          { label: "Accueil", href: "/" },
          { label: "Nos marques" },
        ]}
      />

      <BrandsGrid title="" description="" />

      {/* Comparatif des 3 marques premium */}
      <section className="bg-mp-cream py-16 md:py-24">
        <div className="container mx-auto max-w-[1280px] px-4 md:px-6">
          <div className="max-w-3xl mb-10">
            <h2 className="text-3xl md:text-5xl font-semibold text-mp-green-deep mb-4">
              Edilkamin, EK63, Girolami : le comparatif
            </h2>
            <p className="text-lg text-mp-ink-soft leading-relaxed">
              Nos trois marques premium, côte à côte. Aucune n&apos;écrase les autres,
              chacune a son terrain de jeu.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-mp-sand/40">
            <table className="w-full text-sm border-collapse min-w-[640px]">
              <thead>
                <tr className="bg-mp-beige">
                  <th className="text-left font-semibold text-mp-ink-soft p-4">
                    Critère
                  </th>
                  <th className="text-left font-semibold text-mp-green-deep p-4">
                    Edilkamin
                  </th>
                  <th className="text-left font-semibold text-mp-green-deep p-4">
                    EK63
                  </th>
                  <th className="text-left font-semibold text-mp-green-deep p-4">
                    Girolami
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, i) => (
                  <tr
                    key={row.criterion}
                    className={i % 2 === 1 ? "bg-mp-beige/40" : "bg-mp-cream"}
                  >
                    <td className="p-4 font-medium text-mp-ink-soft">
                      {row.criterion}
                    </td>
                    <td className="p-4 text-mp-ink">{row.edilkamin}</td>
                    <td className="p-4 text-mp-ink">{row.ek63}</td>
                    <td className="p-4 text-mp-ink">{row.girolami}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Argumentaire : quelle marque selon le besoin */}
      <section className="bg-mp-beige py-16 md:py-24">
        <div className="container mx-auto max-w-[1280px] px-4 md:px-6">
          <h2 className="text-3xl md:text-5xl font-semibold text-mp-green-deep mb-12 max-w-3xl">
            Tu hésites ? On résume
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ADVICE.map((a) => (
              <Card key={a.brand} className="p-6 flex flex-col gap-3">
                <p className="text-mp-ink-soft leading-relaxed italic">
                  « {a.need} »
                </p>
                <Link
                  href={`/nos-marques/${a.brand.toLowerCase()}`}
                  className="text-2xl font-semibold text-mp-green-deep hover:text-mp-orange-flame transition-colors"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {a.brand}
                </Link>
                <p className="text-sm text-mp-ink-soft leading-relaxed flex-1">
                  {a.why}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <CTAFinal
        title="Pas sûr de la marque qui te correspond ?"
        description="On t'oriente en 5 minutes selon ta maison, ton budget et ton usage. Aucune obligation."
      />
    </>
  );
}
