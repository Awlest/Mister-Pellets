import Link from "next/link";
import { cn } from "@/lib/utils";
import { toneClass, type SectionTone } from "@/lib/section-tone";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TOP_TIER_BRANDS, brandFoundedLabel, type BrandData } from "@/lib/brands";

interface BrandsGridProps {
  /** Fond de la section. La page decide de l alternance creme / beige. */
  tone?: SectionTone;
  title?: string;
  description?: string;
  brands?: BrandData[];
}

/**
 * 4 cartes longues marques.
 * Hotfix V1.2 §H7 : utilise désormais BRAND_LIST (lib/brands.ts) comme source
 * unique de vérité, après rectification factuelle des positionnements.
 */
export function BrandsGrid({
  tone = "beige",
  title = "Les 3 marques que nous distribuons",
  description = "Chaque marque a son créneau. Notre rôle est de vous diriger vers celle qui colle vraiment à votre maison et à votre budget.",
  brands = TOP_TIER_BRANDS,
}: BrandsGridProps) {
  return (
    <section className={cn("mp-band", toneClass(tone))}>
      <div className="mp-shell">
        <div className="mp-measure mb-12">
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
                <span className="text-xs text-mp-ink-soft tabular-nums text-right">
                  {brand.country}
                  <br />
                  {brandFoundedLabel(brand)}
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
