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

const DEFAULT_PRIMES: PrimeRow[] = [
  {
    amount: "1 500 €",
    audience: "Revenus modestes",
    detail: "Catégorie R1 · prime majorée",
    highlight: true,
  },
  {
    amount: "750 €",
    audience: "Revenus moyens",
    detail: "Catégorie R2",
  },
  {
    amount: "375 €",
    audience: "Revenus supérieurs",
    detail: "Catégorie R3 · prime de base",
  },
];

const CONDITIONS = [
  "Rendement ≥ 87 %",
  "Émissions CO ≤ 250 mg/m³",
  "Certification écodesign 2022",
  "Installation par un pro certifié",
];

interface PrimesBlockProps {
  title?: string;
  description?: string;
  primes?: PrimeRow[];
}

/**
 * Bloc primes Wallonie 2026 avec les 3 montants. Cf. brief §3.2 sec 9.
 */
export function PrimesBlock({
  title = "Primes énergie Wallonie 2026",
  description = "Calcul fait selon ton revenu et ta catégorie PEB. On monte le dossier pour toi, sans paperasse à gérer de ton côté.",
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

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-10">
          {primes.map((prime) => (
            <Card
              key={prime.audience}
              className={`lg:col-span-1 p-6 flex flex-col items-start ${
                prime.highlight
                  ? "ring-2 ring-mp-orange-flame ring-offset-2 ring-offset-mp-cream lg:scale-105 lg:col-span-2"
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

          {/* Bonus PEB F-G */}
          <Card className="lg:col-span-2 p-6 bg-mp-green-deep text-white border-mp-green-mid">
            <div className="flex flex-col items-start">
              <span className="text-xs font-semibold uppercase tracking-wider text-mp-orange-warm mb-1">
                Bonus
              </span>
              <span
                className="text-4xl md:text-5xl font-semibold mb-2 tabular-nums"
                style={{ fontFamily: "var(--font-display)" }}
              >
                +250 €
              </span>
              <span className="text-base font-semibold">PEB F ou G</span>
              <span className="text-xs text-mp-cream/70 mt-1">
                Cumulable avec la prime principale
              </span>
            </div>
          </Card>
        </div>

        {/* Conditions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 mb-10 max-w-2xl">
          {CONDITIONS.map((c) => (
            <div key={c} className="flex items-center gap-2 text-sm text-mp-ink">
              <span className="flex items-center justify-center h-5 w-5 rounded-full bg-mp-green-light/20 text-mp-green-mid">
                <Check className="h-3 w-3" />
              </span>
              {c}
            </div>
          ))}
        </div>

        <Button asChild variant="outline" size="lg">
          <Link href="/primes-energie-wallonie-2026">Voir les conditions complètes</Link>
        </Button>
      </div>
    </section>
  );
}
