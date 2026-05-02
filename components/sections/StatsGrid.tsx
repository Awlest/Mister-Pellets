import { cn } from "@/lib/utils";

interface Stat {
  value: string;
  label: string;
  detail?: string;
}

interface StatsGridProps {
  title?: string;
  stats: Stat[];
  variant?: "light" | "dark";
}

/**
 * Grille de 4 stats (par défaut). Style brief §3.2 sec 4.
 */
export function StatsGrid({ title, stats, variant = "light" }: StatsGridProps) {
  return (
    <section
      className={cn(
        "py-16 md:py-24",
        variant === "dark" ? "bg-mp-green-deep text-white" : "bg-mp-beige"
      )}
    >
      <div className="container mx-auto max-w-[1280px] px-4 md:px-6">
        {title && (
          <h2
            className={cn(
              "text-3xl md:text-5xl font-semibold mb-12 max-w-3xl",
              variant === "dark" ? "text-white" : "text-mp-green-deep"
            )}
          >
            {title}
          </h2>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col gap-2">
              <span
                className={cn(
                  "text-4xl md:text-6xl font-semibold tabular-nums leading-none",
                  variant === "dark" ? "text-mp-orange-warm" : "text-mp-orange-flame"
                )}
                style={{ fontFamily: "var(--font-display)" }}
              >
                {stat.value}
              </span>
              <span
                className={cn(
                  "text-sm md:text-base font-medium",
                  variant === "dark" ? "text-mp-cream/90" : "text-mp-ink"
                )}
              >
                {stat.label}
              </span>
              {stat.detail && (
                <span
                  className={cn(
                    "text-xs",
                    variant === "dark" ? "text-mp-cream/60" : "text-mp-ink-soft"
                  )}
                >
                  {stat.detail}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
