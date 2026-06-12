import Link from "next/link";
import { ArrowRight, MapPin, Truck, Zap } from "lucide-react";
import { HeroSecondary } from "@/components/sections/HeroSecondary";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CTAFinal } from "@/components/sections/CTAFinal";
import { CITIES } from "@/lib/cities";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Zones d'intervention en Wallonie",
  description:
    "Mister Pellets intervient à Namur, Charleroi, Liège, Wavre, Mons, Arlon, Tournai, Verviers, Gembloux, Dinant. Livraison gratuite 50 km autour de Fernelmont.",
  path: "/zones-d-intervention",
});

// Tri par distance pour mettre les villes les plus proches en premier
const SORTED_CITIES = [...CITIES].sort(
  (a, b) => a.distanceFromFernelmont - b.distanceFromFernelmont
);

export default function ZonesDInterventionPage() {
  return (
    <>
      <HeroSecondary
        eyebrow="10 villes · 5 provinces · toute la Wallonie"
        title={
          <>
            Où on <span className="mp-italic">intervient</span> en Wallonie
          </>
        }
        description="Basés à Fernelmont, en plein centre de la province de Namur, on rayonne sur toute la Wallonie. Livraison gratuite des poêles dans un rayon de 50 km autour de l'atelier. Pour les villes plus éloignées (Arlon, Tournai), on regroupe les RDV pour limiter les trajets."
        breadcrumbs={[
          { label: "Accueil", href: "/" },
          { label: "Zones d'intervention" },
        ]}
      />

      {/* 3 cartes infos */}
      <section className="bg-mp-cream py-12 md:py-16">
        <div className="container mx-auto max-w-[1280px] px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="p-6">
              <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-mp-orange-light text-mp-orange-flame mb-4">
                <Truck className="h-6 w-6" />
              </div>
              <h3
                className="text-lg font-semibold text-mp-green-deep mb-2"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Livraison gratuite 50 km
              </h3>
              <p className="text-sm text-mp-ink-soft leading-relaxed">
                Toute la province de Namur, sud de Liège, est du Brabant wallon, nord du Hainaut. Au-delà, forfait 85 € sur la Belgique.
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-mp-orange-light text-mp-orange-flame mb-4">
                <Zap className="h-6 w-6" />
              </div>
              <h3
                className="text-lg font-semibold text-mp-green-deep mb-2"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Délai d'intervention
              </h3>
              <p className="text-sm text-mp-ink-soft leading-relaxed">
                2 à 3 semaines entre le devis signé et la pose pour les villes proches. 3 à 4 semaines pour les plus éloignées (regroupement RDV).
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-mp-orange-light text-mp-orange-flame mb-4">
                <MapPin className="h-6 w-6" />
              </div>
              <h3
                className="text-lg font-semibold text-mp-green-deep mb-2"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Atelier à Fernelmont
              </h3>
              <p className="text-sm text-mp-ink-soft leading-relaxed">
                Rue des Fagotis 3A, 5380. À 17 km de Namur, 22 km de Gembloux. Showroom ouvert lun-ven 9h-18h, sam 9h-13h.
              </p>
            </Card>
          </div>

          {/* Liste des villes */}
          <h2 className="text-2xl md:text-4xl font-semibold text-mp-green-deep mb-8">
            Les 10 villes principales
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SORTED_CITIES.map((city) => {
              const free = city.distanceFromFernelmont <= 50;
              return (
                <Link
                  key={city.slug}
                  href={`/poeles-pellets-${city.slug}`}
                  className="group"
                >
                  <Card className="p-5 h-full hover:-translate-y-0.5 transition-all">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <h3
                          className="text-xl font-semibold text-mp-green-deep group-hover:text-mp-orange-flame transition-colors"
                          style={{ fontFamily: "var(--font-display)" }}
                        >
                          {city.name}
                        </h3>
                        <span className="text-xs text-mp-ink-soft">
                          Province de {city.province}
                        </span>
                      </div>
                      <ArrowRight className="h-5 w-5 text-mp-ink-soft group-hover:text-mp-orange-flame group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-3">
                      <Badge variant="default">
                        <MapPin className="h-3 w-3" /> {city.distanceFromFernelmont} km
                      </Badge>
                      {free && <Badge variant="success">Livraison gratuite</Badge>}
                    </div>

                    <p className="text-xs text-mp-ink-soft">
                      Codes postaux : {city.postalCodes.slice(0, 3).join(", ")}
                      {city.postalCodes.length > 3 && "…"}
                    </p>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Autres communes */}
      <section className="bg-mp-beige py-16 md:py-20">
        <div className="container mx-auto max-w-3xl px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-semibold text-mp-green-deep mb-4">
            Et les autres communes ?
          </h2>
          <p className="text-lg text-mp-ink-soft leading-relaxed mb-6">
            On intervient aussi sur Andenne, Eghezée, Jodoigne, Huy, Marche-en-Famenne, Bastogne,
            Florenville, La Louvière, Nivelles, Soignies, et beaucoup d'autres. Si votre commune n'est
            pas listée explicitement, demandez quand même, la zone est large.
          </p>
        </div>
      </section>

      <CTAFinal
        title="Votre commune n'est pas listée ?"
        description="Tapez votre code postal dans le devis, on vous dit immédiatement si on intervient et combien ça coûte."
      />
    </>
  );
}
