import Link from "next/link";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { typo } from "@/lib/typo";
import { cn } from "@/lib/utils";
import { PHONE_DISPLAY, PHONE_HREF } from "@/config/site";
import { toneClass, type SectionTone } from "@/lib/section-tone";
import { ACTION_LABELS } from "@/config/navigation";

interface CTAFinalProps {
  /** Fond de la section. La page decide de l alternance creme / beige. */
  tone?: SectionTone;
  title?: string;
  description?: string;
  /** `rel` : « nofollow » pour un lien à paramètres (demande de prix d'une fiche). */
  primaryCta?: { label: string; href: string; rel?: string };
  /**
   * Classes ajoutées au bouton principal : une page qui porte déjà un aplat
   * orange à l'écran (barre d'action d'une fiche produit) le passe au vert.
   */
  primaryClassName?: string;
  /** Action secondaire, typiquement la réservation en ligne d'un créneau. */
  secondaryCta?: { label: string; href: string };
  showPhone?: boolean;
}


/**
 * Bloc CTA final sur fond uni (crème ou beige selon l'alternance de la page),
 * sans halo ni dégradé (DESIGN.md). Cf. brief §3.2 sec 12.
 */
export function CTAFinal({
  tone = "beige",
  title = "Une question ? Un projet ?",
  description = "Devis gratuit en 60 secondes, ou échange direct au téléphone. Notre équipe répond personnellement, on est basés à Fernelmont.",
  primaryCta = { label: ACTION_LABELS.estimate, href: "/estimation" },
  primaryClassName,
  secondaryCta,
  showPhone = true,
}: CTAFinalProps) {
  return (
    <section className={cn("mp-band", toneClass(tone))}>
      <div className="mp-shell text-center">
        <div className="mx-auto mp-measure">
        <h2 className="text-3xl md:text-5xl font-semibold text-mp-green-deep mb-4">
          {typo(title)}
        </h2>
        <p className="text-lg text-mp-ink-soft leading-relaxed mb-8 mp-measure mx-auto">
          {typo(description)}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button asChild variant="primary" size="lg" className={primaryClassName}>
            <Link href={primaryCta.href} rel={primaryCta.rel}>{primaryCta.label}</Link>
          </Button>
          {secondaryCta && (
            <Button asChild variant="outline" size="lg">
              <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
            </Button>
          )}
          {showPhone && (
            <a
              href={PHONE_HREF}
              className="inline-flex min-h-11 items-center gap-2 text-base font-semibold text-mp-green-deep hover:text-mp-orange-flame transition-colors"
            >
              <Phone className="h-5 w-5" />
              {PHONE_DISPLAY}
            </a>
          )}
        </div>
        </div>
      </div>
    </section>
  );
}
