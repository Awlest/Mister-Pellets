import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";

interface Testimonial {
  name: string;
  city: string;
  rating: 1 | 2 | 3 | 4 | 5;
  quote: string;
  brand?: string;
}

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    name: "Sophie L.",
    city: "Namur",
    rating: 5,
    quote: "Installation parfaite. L'équipe est arrivée à l'heure, a tout protégé, et notre poêle EK63 fonctionne nickel depuis 4 mois.",
    brand: "EK63",
  },
  {
    name: "Jean-Marc D.",
    city: "Charleroi",
    rating: 5,
    quote: "Travail soigné et excellent rapport qualité-prix. Le canalisable Edilkamin chauffe nos 130 m² sans souci.",
    brand: "Edilkamin",
  },
  {
    name: "Claire V.",
    city: "Liège",
    rating: 5,
    quote: "Remplacement de la vieille chaudière fioul par un Dielle hydro. Économies dès le premier hiver, sans paperasse à gérer.",
    brand: "Dielle",
  },
];

interface TestimonialsProps {
  title?: string;
  description?: string;
  items?: Testimonial[];
}

/**
 * 3 témoignages clients (carrousel à venir Phase 5, pour l'instant grid simple).
 * Cf. brief §3.2 sec 10.
 */
export function Testimonials({
  title = "Ce que disent nos clients",
  description = "4.9 / 5 sur Google après 200 avis. Quelques retours récents.",
  items = DEFAULT_TESTIMONIALS,
}: TestimonialsProps) {
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((t, i) => (
            <Card key={i} className="p-6 flex flex-col gap-4">
              {/* Étoiles */}
              <div className="flex gap-0.5">
                {Array.from({ length: t.rating }).map((_, k) => (
                  <Star
                    key={k}
                    className="h-4 w-4 text-mp-orange-warm fill-mp-orange-warm"
                  />
                ))}
              </div>

              <blockquote className="text-mp-ink leading-relaxed italic">
                « {t.quote} »
              </blockquote>

              <div className="mt-auto pt-2 border-t border-mp-sand/40 flex items-center justify-between text-sm">
                <div>
                  <span className="font-semibold text-mp-green-deep">{t.name}</span>
                  <span className="text-mp-ink-soft"> · {t.city}</span>
                </div>
                {t.brand && (
                  <span className="text-xs font-medium text-mp-orange-flame">
                    {t.brand}
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
