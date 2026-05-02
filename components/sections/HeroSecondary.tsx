import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface HeroSecondaryProps {
  eyebrow?: string;
  title: React.ReactNode;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
}

/**
 * Hero compact pour les pages internes. Cf. brief §4.1.
 */
export function HeroSecondary({
  eyebrow,
  title,
  description,
  breadcrumbs,
}: HeroSecondaryProps) {
  return (
    <section className="bg-mp-cream pt-12 pb-16 md:pt-20 md:pb-24 border-b border-mp-sand/30">
      <div className="container mx-auto max-w-[1280px] px-4 md:px-6">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Fil d'Ariane" className="mb-6">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-mp-ink-soft">
              {breadcrumbs.map((item, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  {i > 0 && <ChevronRight className="h-3.5 w-3.5" />}
                  {item.href ? (
                    <Link
                      href={item.href}
                      className="hover:text-mp-orange-flame transition-colors"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span className="text-mp-ink font-medium">{item.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        <div className="max-w-3xl">
          {eyebrow && (
            <Badge variant="eyebrow" className="mb-4">
              {eyebrow}
            </Badge>
          )}
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-semibold leading-[1.1] tracking-tight text-mp-green-deep mb-4">
            {title}
          </h1>
          {description && (
            <p className="text-lg text-mp-ink-soft leading-relaxed">{description}</p>
          )}
        </div>
      </div>
    </section>
  );
}
