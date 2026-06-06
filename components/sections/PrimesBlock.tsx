import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface PrimeRow {
  amount: string;
  audience: string;
  detail?: string;
  highlight?: boolean;
}

/**
 * Régime Prime Habitation Wallonie 2026 (en vigueur du 14/02/2025 au 30/09/2026).
 * Source : SPW Logement / SPW Énergie. Numéro de démarche 3920.
 *
 * Méthode : prime de base 160 € × coefficient selon revenus de référence.
 *   R1 (≤ 24 600 €) × 6 = 960 €
 *   R2 (24 601 à 39 300 €) × 4 = 640 €
 *   R3 (39 301 à 58 900 €) × 2 = 320 €
 *   R4 (> 58 900 €) × 1 = 160 € (montant de base)
 *   R5 (> 122 800 €) : non éligible depuis le 14/02/2025
 */
const DEFAULT_PRIMES: PrimeRow[] = [
  {
    amount: "960 €",
    audience: "Revenus modestes",
    detail: "Catégorie R1 · coefficient × 6",
    highlight: true,
  },
  {
    amount: "640 €",
    audience: "Revenus moyens",
    detail: "Catégorie R2 · coefficient × 4",
  },
  {
    amount: "320 €",
    audience: "Revenus supérieurs",
    detail: "Catégorie R3 · coefficient × 2",
  },
  {
    amount: "160 €",
    audience: "Au-delà",
    detail: "Catégorie R4 · prime de base",
  },
];

const CONDITIONS = [
  "Logement de plus de 15 ans en Région wallonne",
  "Audit logement préalable obligatoire",
  "Poêle dans la liste officielle SPW Logement",
  "Pose par entrepreneur inscrit à la BCE",
];

interface PrimesBlockProps {
  title?: string;
  description?: string;
  primes?: PrimeRow[];
}

/**
 * Bloc primes Wallonie 2026, rectification factuelle complète (régime
 * temporaire 14/02/2025 → 30/09/2026).
 */
export function PrimesBlock({
  title = "Prime Habitation Wallonie 2026",
  description = "Régime temporaire en vigueur jusqu'au 30 septembre 2026. Prime de base 160 € multipliée par un coefficient selon votre catégorie de revenus. On monte le dossier complet pour vous.",
  primes = DEFAULT_PRIMES,
}: PrimesBlockProps) {
  return (
    <section className="py-16 md:py-24 bg-mp-cream">
      <div className="container mx-auto max-w-[1280px] px-4 md:px-6">
        <div className="max-w-3xl mb-12">
          <h2 className="text-3xl md:text-5xl font-semibold text-mp-green-deep mb-4">
            {title}
          </h2>
          {description && (
            <p className="text-lg text-mp-ink-soft leading-relaxed">{description}</p>
          )}
        </div>

        {/* 4 cards, R1 (highlight) puis R2, R3, R4 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {primes.map((prime) => (
            <Card
              key={prime.audience}
              className={`p-6 flex flex-col items-start ${
                prime.highlight
                  ? "ring-2 ring-mp-orange-flame ring-offset-2 ring-offset-mp-cream"
                  : ""
              }`}
            >
              <span
                className="text-4xl md:text-5xl font-semibold text-mp-orange-flame mb-2 tabular-nums"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {prime.amount}
              </span>
              <span className="text-base font-semibold text-mp-green-deep">
                {prime.audience}
              </span>
              {prime.detail && (
                <span className="text-xs text-mp-ink-soft mt-1">{prime.detail}</span>
              )}
            </Card>
          ))}
        </div>

        {/* Plafonds + R5 */}
        <Card className="p-6 mb-8 bg-mp-beige border-mp-sand/40">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-mp-ink leading-relaxed">
            <div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-mp-green-deep mb-1">
                Plafond R1 et R2
              </span>
              Maximum 70 % du coût total TVAC
            </div>
            <div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-mp-green-deep mb-1">
                Plafond R3 et R4
              </span>
              Maximum 50 % du coût total TVAC
            </div>
            <div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-mp-green-deep mb-1">
                Catégorie R5 (&gt; 122 800 €)
              </span>
              Non éligible depuis le 14/02/2025
            </div>
          </div>
        </Card>

        {/* Conditions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 mb-10 max-w-3xl">
          {CONDITIONS.map((c) => (
            <div key={c} className="flex items-start gap-2 text-sm text-mp-ink">
              <span className="flex items-center justify-center h-5 w-5 rounded-full bg-mp-green-light/20 text-mp-green-mid shrink-0 mt-0.5">
                <Check className="h-3 w-3" />
              </span>
              {c}
            </div>
          ))}
        </div>

        <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
          <Link href="/primes-energie-wallonie-2026">
            Conditions complètes et procédure
          </Link>
        </Button>

        <p className="mt-6 text-xs text-mp-ink-soft italic max-w-3xl">
          Information à titre indicatif, basée sur le régime temporaire en vigueur du
          14 février 2025 au 30 septembre 2026 (numéro de démarche 3920). Les montants
          et conditions peuvent évoluer. Pour un calcul personnalisé et une vérification
          officielle, contactez le SPW Énergie au 1718 ou sur energie.wallonie.be.
        </p>
      </div>
    </section>
  );
}
