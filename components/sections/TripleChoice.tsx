import Link from "next/link";
import { toneClass, type SectionTone } from "@/lib/section-tone";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Choice {
  icon: LucideIcon;
  title: string;
  description: string;
  cta: { label: string; href: string };
  highlight?: boolean;
}

interface TripleChoiceProps {
  /** Fond de la section. La page decide de l alternance creme / beige. */
  tone?: SectionTone;
  title?: string;
  description?: string;
  choices: [Choice, Choice, Choice];
}

/**
 * 3 grosses cartes "façons d'avancer". Cf. brief §3.2 sec 3.
 */
export function TripleChoice({
  tone = "cream",
  title = "3 façons d'avancer avec nous",
  description,
  choices,
}: TripleChoiceProps) {
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {choices.map((choice) => {
            const Icon = choice.icon;
            return (
              <Card
                key={choice.title}
                className={cn(
                  "group flex flex-col p-8 transition-all hover:-translate-y-1",
                  choice.highlight && "ring-2 ring-mp-orange-flame ring-offset-2 ring-offset-mp-cream"
                )}
              >
                <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-mp-orange-light text-mp-orange-flame mb-6">
                  <Icon className="h-7 w-7" />
                </div>

                <h3
                  className="text-2xl font-semibold text-mp-green-deep mb-3"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {choice.title}
                </h3>

                <p className="text-mp-ink-soft leading-relaxed flex-1 mb-6">
                  {choice.description}
                </p>

                <Link
                  href={choice.cta.href}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-mp-orange-flame group-hover:gap-3 transition-all"
                >
                  {choice.cta.label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
