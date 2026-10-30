import Link from "next/link";
import { HeroSecondary } from "@/components/sections/HeroSecondary";
import { BrandsGrid } from "@/components/sections/BrandsGrid";
import { CTAFinal } from "@/components/sections/CTAFinal";
import { Card } from "@/components/ui/card";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title:
    "Nos marques de poêles à pellets : MCZ, Edilkamin, EK63, Girolami, Austroflamm, Cadel",
  description:
    "Les 6 marques posées par Mister Pellets en Wallonie : MCZ (gamme complète, combustion Core), Edilkamin (référence depuis 1963), EK63 (groupe Edilkamin, Wi-Fi de série), Girolami (brasier auto-nettoyant), Austroflamm (haut de gamme autrichien) et Cadel (groupe MCZ, Wi-Fi intégré).",
  path: "/nos-marques",
});

/** Comparatif des 6 marques mises en avant, brief marques §E.1 (Austroflamm et Cadel le 18/10/2026, MCZ le 30/10/2026). */
const COMPARISON: {
  criterion: string;
  mcz: string;
  edilkamin: string;
  ek63: string;
  girolami: string;
  austroflamm: string;
  cadel: string;
}[] = [
  {
    criterion: "Positionnement",
    mcz: "Gamme la plus complète",
    edilkamin: "Référence premium",
    ek63: "Connecté accessible",
    girolami: "Polycombustible breveté",
    austroflamm: "Haut de gamme autrichien",
    cadel: "Connecté accessible (groupe MCZ)",
  },
  {
    criterion: "Origine",
    mcz: "Pordenone (Frioul), groupe MCZ",
    edilkamin: "Milan (Lainate), 1963",
    ek63: "Plateforme Edilkamin",
    girolami: "Sant'Oreste (Rome), 1970",
    austroflamm: "Krenglbach (Haute-Autriche), 1983",
    cadel: "Santa Lucia di Piave (Trévise), groupe MCZ",
  },
  {
    criterion: "Techno phare",
    mcz: "Combustion Core, Comfort Air",
    edilkamin: "Leonardo (autorégulation)",
    ek63: "Wi-Fi Smart de série",
    girolami: "Source Feeding (auto-nettoyage)",
    austroflamm: "Pellets sans convection forcée, Keramott",
    cadel: "Easy Connect Plus, Autoclean",
  },
  {
    criterion: "Combustible",
    mcz: "Pellet",
    edilkamin: "Pellet",
    ek63: "Pellet",
    girolami: "Pellet, bois, hybride",
    austroflamm: "Pellet, mixte bois-pellet",
    cadel: "Pellet",
  },
  {
    criterion: "Canalisable",
    mcz: "Oui (Comfort Air, jusqu'à 8 m)",
    edilkamin: "Oui",
    ek63: "Oui",
    girolami: "Oui",
    austroflamm: "Avec kit (Ruby, Duo)",
    cadel: "Oui (gamme Plus)",
  },
  {
    criterion: "Hydro",
    mcz: "Oui, 8 à 24 kW",
    edilkamin: "Oui",
    ek63: "Oui",
    girolami: "Oui",
    austroflamm: "Non",
    cadel: "Oui",
  },
  {
    criterion: "Hybride bois-pellet",
    mcz: "Non",
    edilkamin: "Non",
    ek63: "Non",
    girolami: "Oui",
    austroflamm: "Oui (gamme Duo)",
    cadel: "Non",
  },
  {
    criterion: "Wi-Fi de série",
    mcz: "Oui (Maestro+), kit sur la ligne Easy",
    edilkamin: "Selon modèle",
    ek63: "Oui sur la majorité",
    girolami: "Oui sur gamme moderne",
    austroflamm: "En option (box WiRCU)",
    cadel: "Wi-Fi et Bluetooth intégrés",
  },
  {
    criterion: "Étanchéité",
    mcz: "Presque toute la gamme",
    edilkamin: "Sur gamme étanche",
    ek63: "Quasi toute la gamme",
    girolami: "Selon modèle",
    austroflamm: "Air extérieur de série",
    cadel: "Presque toute la gamme",
  },
];

const ADVICE: { need: string; brand: string; why: string }[] = [
  {
    need: "Je veux le bon poêle pour ma maison, quelle qu'elle soit",
    brand: "MCZ",
    why: "Une centaine de versions, de 6 à 24 kW : air, canalisable, hydro, plat, foyer, insert. Combustion Core et Wi-Fi de série.",
  },
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
  {
    need: "Je veux un beau poêle, silencieux, qui fait aussi feu de bois",
    brand: "Austroflamm",
    why: "Pellets sans ventilateur dans la pièce, design Cesare Monti, mixtes Duo qui repassent seuls aux pellets.",
  },
  {
    need: "Je veux du connecté à bon prix, même pour un couloir",
    brand: "Cadel",
    why: "Wi-Fi et Bluetooth intégrés, poêles plats dès 27 cm, brasero Autoclean, groupe MCZ.",
  },
];

export default function NosMarquesHubPage() {
  return (
    <>
      <HeroSecondary
        eyebrow="6 marques sélectionnées"
        title={
          <>
            Les marques de poêles à pellets que <span className="mp-italic">nous distribuons</span>
          </>
        }
        description="Plutôt que de tout vendre, on s'est limités à six marques qui couvrent les besoins qu'on voit sur le terrain en Wallonie. MCZ en premier, depuis octobre 2026, pour la gamme la plus complète et la combustion Core. Edilkamin pour sa longue histoire, EK63 (sa marque sœur) pour le connecté à prix accessible, Girolami pour son brevet qui nettoie le brasier tout seul. Austroflamm pour le haut de gamme silencieux et les mixtes bois-pellets, et Cadel, du groupe MCZ, pour une gamme connectée très large à prix doux. Chaque marque a son créneau, on vous dit franchement laquelle est faite pour vous."
        breadcrumbs={[
          { label: "Accueil", href: "/" },
          { label: "Nos marques" },
        ]}
      />

      <BrandsGrid title="" description="" />

      {/* Comparatif des 6 marques mises en avant */}
      <section className="bg-mp-cream mp-band">
        <div className="mp-shell">
          <div className="mp-measure mb-10 text-center">
            <h2 className="text-3xl md:text-5xl font-semibold text-mp-green-deep mb-4">
              Nos six marques : le comparatif
            </h2>
            <p className="text-lg text-mp-ink-soft leading-relaxed">
              MCZ, Edilkamin, EK63, Girolami, Austroflamm et Cadel, côte à côte. Aucune n&apos;écrase les autres,
              chacune a son terrain de jeu.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-mp-sand/40">
            <table className="w-full text-sm border-collapse min-w-[1120px]">
              <thead>
                <tr className="bg-mp-beige">
                  <th className="text-left font-semibold text-mp-ink-soft p-4">
                    Critère
                  </th>
                  <th className="text-left font-semibold text-mp-green-deep p-4">
                    MCZ
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
                  <th className="text-left font-semibold text-mp-green-deep p-4">
                    Austroflamm
                  </th>
                  <th className="text-left font-semibold text-mp-green-deep p-4">
                    Cadel
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
                    <td className="p-4 text-mp-ink">{row.mcz}</td>
                    <td className="p-4 text-mp-ink">{row.edilkamin}</td>
                    <td className="p-4 text-mp-ink">{row.ek63}</td>
                    <td className="p-4 text-mp-ink">{row.girolami}</td>
                    <td className="p-4 text-mp-ink">{row.austroflamm}</td>
                    <td className="p-4 text-mp-ink">{row.cadel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Argumentaire : quelle marque selon le besoin */}
      <section className="bg-mp-beige mp-band">
        <div className="mp-shell">
          <h2 className="text-3xl md:text-5xl font-semibold text-mp-green-deep mb-12 mp-measure text-center">
            Vous hésitez ? On résume
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ADVICE.map((a) => (
              <Card key={a.brand} className="p-6 flex flex-col gap-3">
                <p className="text-mp-ink-soft leading-relaxed italic">
                  « {a.need} »
                </p>
                <Link
                  href={`/nos-marques/${a.brand.toLowerCase()}`}
                  className="inline-flex min-h-11 items-center text-2xl font-semibold text-mp-green-deep hover:text-mp-orange-flame transition-colors"
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
        title="Pas sûr de la marque qui vous correspond ?"
        description="On vous oriente en 5 minutes selon votre maison, votre budget et votre usage. Aucune obligation."
      />
    </>
  );
}
