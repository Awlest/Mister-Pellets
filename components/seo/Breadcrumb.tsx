import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { JsonLd } from "./JsonLd";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * Fil d'Ariane visuel + Schema.org BreadcrumbList automatique.
 * Le dernier item ne doit pas avoir de href (page courante).
 * Cf. brief §9.1.
 */
export function Breadcrumb({ items, className }: BreadcrumbProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      ...(item.href && { item: `https://mister-pellets.be${item.href}` }),
    })),
  };

  return (
    <>
      <JsonLd data={schema} />
      <nav aria-label="Fil d'Ariane" className={className}>
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-mp-ink-soft">
          {items.map((item, i) => (
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
                <span className="text-mp-ink font-medium" aria-current="page">
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
