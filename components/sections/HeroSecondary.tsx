import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface HeroSecondaryProps {
  eyebrow?: string;
  title: React.ReactNode;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  /**
   * Héros resserré sur mobile, pour les pages où l'outil doit apparaître dans
   * le premier écran (configurateur) : marges réduites, titre plus petit,
   * chapô masqué sous 640 px. Sur /estimation, la première question tombait
   * à 832 px du haut, sous le premier écran d'un téléphone.
   */
  compact?: boolean;
}

/**
 * Hero compact pour les pages internes. Cf. brief §4.1.
 *
 * Tout le bloc est centré (fil d'Ariane compris), comme le hero de l'accueil :
 * aligné à gauche, il laissait la moitié droite de l'écran vide.
 */
export function HeroSecondary({
  eyebrow,
  title,
  description,
  breadcrumbs,
  compact = false,
}: HeroSecondaryProps) {
  return (
    <section
      className={cn(
        "bg-mp-cream border-b border-mp-sand/30",
        compact ? "pt-5 pb-6 sm:pt-12 sm:pb-12 md:pt-16 md:pb-16" : "pt-12 pb-16 md:pt-20 md:pb-24",
      )}
    >
      <div className="mp-shell">
        {/* Breadcrumbs : liens agrandis à 44 px de haut sans changer la mise en
            page (marges négatives), c'est le seul retour arrière visible sur
            mobile, où il n'y a pas d'en-tête. */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Fil d'Ariane" className={compact ? "mb-3 sm:mb-6" : "mb-6"}>
            <ol className="flex flex-wrap items-center justify-center gap-x-1.5 text-sm text-mp-ink-soft">
              {breadcrumbs.map((item, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  {i > 0 && <ChevronRight className="h-3.5 w-3.5" aria-hidden />}
                  {item.href ? (
                    <Link
                      href={item.href}
                      className="-my-3 inline-flex min-h-11 min-w-11 items-center justify-center px-1 hover:text-mp-orange-ink transition-colors"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span className="text-mp-ink font-medium" aria-current="page">
                      {item.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        <div className="mp-measure text-center">
          {eyebrow && (
            <Badge variant="eyebrow" className={compact ? "mb-2 sm:mb-4" : "mb-4"}>
              {eyebrow}
            </Badge>
          )}
          <h1
            className={cn(
              "font-semibold tracking-tight text-mp-green-deep",
              compact
                ? "text-[1.75rem] leading-tight mb-0 sm:mb-4 sm:text-4xl md:text-5xl lg:text-6xl sm:leading-[1.1]"
                : "text-3xl md:text-5xl lg:text-6xl leading-[1.1] mb-4",
            )}
          >
            {title}
          </h1>
          {description && (
            <p
              className={cn(
                "text-lg text-mp-ink-soft leading-relaxed",
                compact && "hidden sm:block",
              )}
            >
              {description}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
