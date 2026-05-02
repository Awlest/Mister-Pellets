import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Brand {
  slug: string;
  name: string;
  country: string;
  founded: number;
  tagline: string;
  positioning: string;
  tags: string[];
}

const DEFAULT_BRANDS: Brand[] = [
  {
    slug: "edilkamin",
    name: "Edilkamin",
    country: "Italie",
    founded: 1963,
    tagline: "La référence premium",
    positioning: "Durabilité 15-20 ans, technologie Leonardo® de combustion intelligente. Le choix de tête quand on veut un poêle qui tient sans drift sur la durée.",
    tags: ["Premium", "Italie", "Garantie 5 ans"],
  },
  {
    slug: "ek63",
    name: "EK63",
    country: "Italie",
    founded: 2010,
    tagline: "Connecté · qualité-prix",
    positioning: "Smart Fire WiFi de série, étanche, canalisable. Le bon compromis entre tech moderne et budget maîtrisé.",
    tags: ["Connecté", "Italie", "Compact"],
  },
  {
    slug: "dielle",
    name: "Dielle",
    country: "Italie",
    founded: 1989,
    tagline: "Spécialiste 100% hydro",
    positioning: "Toute la gamme chauffe un circuit d'eau. Choix naturel pour remplacer une chaudière mazout par un système pellets.",
    tags: ["Hydro", "Italie", "Chauffage central"],
  },
  {
    slug: "ferlux",
    name: "Ferlux",
    country: "Espagne",
    founded: 1995,
    tagline: "Budget maîtrisé, fiable",
    positioning: "Mécanique simple, pas de gadget. Choix pertinent pour résidence secondaire, location, ou primo-achat.",
    tags: ["Budget", "Espagne", "Simple"],
  },
];

interface BrandsGridProps {
  title?: string;
  description?: string;
  brands?: Brand[];
}

/**
 * 4 cartes longues marques. Cf. brief §3.2 sec 6.
 */
export function BrandsGrid({
  title = "Les 4 marques que nous distribuons",
  description = "Chaque marque a son créneau. Notre rôle est de te diriger vers celle qui colle vraiment à ta maison et à ton budget.",
  brands = DEFAULT_BRANDS,
}: BrandsGridProps) {
  return (
    <section className="py-16 md:py-24 bg-mp-beige">
      <div className="container mx-auto max-w-[1280px] px-4 md:px-6">
        <div className="max-w-3xl mb-12">
          <h2 className="text-3xl md:text-5xl font-semibold text-mp-green-deep mb-4">
            {title}
          </h2>
          {description && (
            <p className="text-lg text-mp-ink-soft leading-relaxed">{description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {brands.map((brand) => (
            <Card key={brand.slug} className="p-8 flex flex-col gap-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3
                    className="text-3xl font-semibold text-mp-green-deep mb-1"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {brand.name}
                  </h3>
                  <p className="text-sm font-medium text-mp-orange-flame">
                    {brand.tagline}
                  </p>
                </div>
                <span className="text-xs text-mp-ink-soft tabular-nums">
                  {brand.country} · {brand.founded}
                </span>
              </div>

              <p className="text-mp-ink-soft leading-relaxed">{brand.positioning}</p>

              <div className="flex flex-wrap gap-2">
                {brand.tags.map((tag) => (
                  <Badge key={tag} variant="default">
                    {tag}
                  </Badge>
                ))}
              </div>

              <Link
                href={`/nos-marques/${brand.slug}`}
                className="inline-flex items-center gap-2 text-sm font-semibold text-mp-green-deep hover:text-mp-orange-flame transition-colors mt-2"
              >
                Voir les modèles {brand.name}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
