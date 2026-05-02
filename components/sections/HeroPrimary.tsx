import Link from "next/link";
import { Flame, Star, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface HeroPrimaryProps {
  eyebrow?: string;
  title: React.ReactNode;
  description: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  showStats?: boolean;
}

/**
 * Hero d'accueil, sur fond beige cream avec halo orange flottant.
 * Cf. brief §3.2 sec 1.
 */
export function HeroPrimary({
  eyebrow = "61 modèles · Wallonie · Pose en 1 jour",
  title,
  description,
  primaryCta = { label: "Devis en 60 sec", href: "/demande-de-devis" },
  secondaryCta = { label: "Voir la boutique", href: "/boutique" },
  showStats = true,
}: HeroPrimaryProps) {
  return (
    <section className="relative overflow-hidden">
      {/* Halo orange flottant */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-[500px] w-[500px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(242,138,32,0.18) 0%, rgba(242,138,32,0) 70%)",
        }}
      />

      <div className="container mx-auto max-w-[1280px] px-4 md:px-6 py-16 md:py-24 lg:py-32 relative">
        <div className="max-w-3xl">
          <Badge variant="eyebrow" className="mb-6">
            <Flame className="h-3 w-3 text-mp-orange-flame" />
            {eyebrow}
          </Badge>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-semibold leading-[1.05] tracking-tight text-mp-green-deep mb-6">
            {title}
          </h1>

          <p className="text-lg md:text-xl text-mp-ink-soft leading-relaxed mb-8 max-w-2xl">
            {description}
          </p>

          <div className="flex flex-wrap gap-3 mb-10">
            <Button asChild variant="primary" size="lg">
              <Link href={primaryCta.href}>{primaryCta.label}</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
            </Button>
          </div>

          {showStats && (
            <div className="flex flex-wrap gap-x-6 gap-y-3 items-center text-sm font-medium text-mp-ink-soft">
              <span className="inline-flex items-center gap-2">
                <span className="font-bold text-mp-green-deep text-base">+400</span>
                installés
              </span>
              <span className="text-mp-sand">·</span>
              <span className="inline-flex items-center gap-2">
                <Star className="h-4 w-4 text-mp-orange-warm fill-mp-orange-warm" />
                <span className="font-bold text-mp-green-deep text-base">4.9</span>
                <span className="text-mp-ink-soft/80">/ 200 avis</span>
              </span>
              <span className="text-mp-sand">·</span>
              <span className="inline-flex items-center gap-2">
                <Clock className="h-4 w-4 text-mp-green-mid" />
                Pose en 48h
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
