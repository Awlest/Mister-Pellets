import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toneClass, type SectionTone } from "@/lib/section-tone";
import { AIDES_VERIFIED_AT, LOAN_MAX, MEBAR_MAX } from "@/lib/aides";

interface AideRow {
  amount: string;
  audience: string;
  detail?: string;
  highlight?: boolean;
}

/**
 * Les aides qui restent pour un poêle à pellets en Wallonie depuis la fin de
 * la prime Habitation (30/09/2026). Réécrit le 03/10/2026 : l'ancien bloc
 * affichait la prime 160 à 960 € par catégorie R1 à R4, qui n'existe plus.
 * Chiffres et date de vérification : lib/aides.ts.
 */
const DEFAULT_AIDES: AideRow[] = [
  {
    amount: "6 %",
    audience: "TVA réduite",
    detail: "Au lieu de 21 %, logement de plus de 10 ans, poêle posé par nous",
    highlight: true,
  },
  {
    amount: "50 %",
    audience: "Rénopack",
    detail: "Part du prêt effacée en C1 (40 % en C2, 15 % en C3)",
  },
  {
    amount: LOAN_MAX.house,
    audience: "Prêt maximum",
    detail: "Rénopack ou Rénoprêt, maison unifamiliale",
  },
  {
    amount: MEBAR_MAX,
    audience: "MEBAR",
    detail: "Revenus modestes, demande via le CPAS",
  },
];

const CONDITIONS = [
  "Maison classée PEB E, F ou G",
  "Audit logement de moins d'un an",
  "Label D (ou C) atteint après travaux",
  "Demande à la SWCS ou au Fonds du Logement",
];

interface PrimesBlockProps {
  /** Fond de la section. La page decide de l alternance creme / beige. */
  tone?: SectionTone;
  title?: string;
  description?: string;
  aides?: AideRow[];
  /** Bouton vers /primes-energie-wallonie-2026 (inutile sur cette page même). */
  showLink?: boolean;
}

export function PrimesBlock({
  tone = "cream",
  title = "Les aides en 2026, après la fin de la prime",
  description = "Depuis le 1er octobre 2026, la Wallonie ne verse plus de prime pour un poêle à pellets. Voici ce qui reste pour alléger la facture, et à quelles conditions.",
  aides = DEFAULT_AIDES,
  showLink = true,
}: PrimesBlockProps) {
  return (
    <section className={cn("mp-band", toneClass(tone))}>
      <div className="mp-shell">
        <div className="mp-measure mb-12 text-center">
          <h2 className="text-3xl md:text-5xl font-semibold text-mp-green-deep mb-4">
            {title}
          </h2>
          {description && (
            <p className="text-lg text-mp-ink-soft leading-relaxed">{description}</p>
          )}
        </div>

        {/* 4 cartes, la TVA (l'aide de presque tous les chantiers) en tête */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {aides.map((aide) => (
            <Card
              key={aide.audience}
              className={`p-6 flex flex-col items-start ${
                aide.highlight
                  ? "ring-2 ring-mp-orange-flame ring-offset-2 ring-offset-mp-cream"
                  : ""
              }`}
            >
              <span
                className="text-4xl md:text-5xl font-semibold text-mp-orange-flame mb-2 tabular-nums"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {aide.amount}
              </span>
              <span className="text-base font-semibold text-mp-green-deep">
                {aide.audience}
              </span>
              {aide.detail && (
                <span className="text-xs text-mp-ink-soft mt-1">{aide.detail}</span>
              )}
            </Card>
          ))}
        </div>

        {/* Ce qui a changé au 1er octobre */}
        <Card className="p-6 mb-8 bg-mp-beige border-mp-sand/40">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-mp-ink leading-relaxed">
            <div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-mp-green-deep mb-1">
                Prime poêle à pellets
              </span>
              Terminée : demandes closes le 30 septembre 2026 à 23 h 59
            </div>
            <div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-mp-green-deep mb-1">
                Rénopack et Rénoprêt
              </span>
              Prêts pour les maisons PEB E, F ou G, avec audit préalable
            </div>
            <div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-mp-green-deep mb-1">
                Saut de label exigé
              </span>
              De F ou G vers D au minimum, de E vers C au minimum
            </div>
          </div>
        </Card>

        {/* Conditions des prêts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 mb-10 mp-measure">
          {CONDITIONS.map((c) => (
            <div key={c} className="flex items-start gap-2 text-sm text-mp-ink">
              <span className="flex items-center justify-center h-5 w-5 rounded-full bg-mp-green-light/20 text-mp-green-mid shrink-0 mt-0.5">
                <Check className="h-3 w-3" />
              </span>
              {c}
            </div>
          ))}
        </div>

        {showLink && (
          <div className="flex justify-center">
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <Link href="/primes-energie-wallonie-2026">
                Toutes les aides et leurs conditions
              </Link>
            </Button>
          </div>
        )}

        <p className="mt-6 text-xs text-mp-ink-soft italic mp-measure text-center">
          Situation vérifiée le {AIDES_VERIFIED_AT} sur wallonie.be, swcs.be et fin.belgium.be.
          Les taux et durées des prêts sont fixés par la SWCS et le Fonds du Logement de
          Wallonie. Renseignements gratuits au 1718.
        </p>
      </div>
    </section>
  );
}
