import Link from "next/link";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPhone } from "@/lib/utils";

interface CTAFinalProps {
  title?: string;
  description?: string;
  primaryCta?: { label: string; href: string };
  showPhone?: boolean;
}

const PHONE = "0472 04 32 22";

/**
 * Bloc CTA final sur fond beige avec halo orange. Cf. brief §3.2 sec 12.
 */
export function CTAFinal({
  title = "Une question ? Un projet ?",
  description = "Devis gratuit en 60 secondes, ou échange direct au téléphone. Notre équipe répond personnellement, on est basés à Fernelmont.",
  primaryCta = { label: "Demander un devis", href: "/demande-de-devis" },
  showPhone = true,
}: CTAFinalProps) {
  return (
    <section className="py-16 md:py-24 bg-mp-beige relative overflow-hidden">
      {/* Halo orange */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(242,138,32,0.20) 0%, rgba(242,138,32,0) 70%)",
        }}
      />

      <div className="container mx-auto max-w-3xl px-4 md:px-6 text-center relative">
        <h2 className="text-3xl md:text-5xl font-semibold text-mp-green-deep mb-4">
          {title}
        </h2>
        <p className="text-lg text-mp-ink-soft leading-relaxed mb-8 max-w-2xl mx-auto">
          {description}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button asChild variant="primary" size="lg">
            <Link href={primaryCta.href}>{primaryCta.label}</Link>
          </Button>
          {showPhone && (
            <a
              href={`tel:${formatPhone(PHONE)}`}
              className="inline-flex items-center gap-2 text-base font-semibold text-mp-green-deep hover:text-mp-orange-flame transition-colors"
            >
              <Phone className="h-5 w-5" />
              {PHONE}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
