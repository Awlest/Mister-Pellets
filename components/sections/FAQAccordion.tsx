import { useId } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { toneClass, type SectionTone } from "@/lib/section-tone";

interface FAQItem {
  question: string;
  answer: React.ReactNode;
}

interface FAQAccordionProps {
  /** Fond de la section. La page decide de l alternance creme / beige. */
  tone?: SectionTone;
  title?: string;
  description?: string;
  items: FAQItem[];
}

/**
 * Questions en <details> natifs, rendus côté serveur. L'accordéon Radix
 * chargeait du JavaScript sur chaque page à FAQ et ne mettait les réponses
 * dans la page qu'à l'ouverture : elles sont maintenant dans le HTML, pour
 * les moteurs comme pour la recherche du navigateur (qui ouvre la question
 * trouvée). `name` garde une seule question ouverte à la fois, comme avant.
 * Animation d'ouverture : globals.css, « FAQ ».
 */
export function FAQAccordion({
  tone = "cream",
  title = "Questions fréquentes",
  description,
  items,
}: FAQAccordionProps) {
  const group = useId();

  return (
    <section className={cn("mp-band", toneClass(tone))}>
      <div className="mp-shell">
        <div className="mp-measure">
        {/* Titre et chapô centrés ; les questions restent alignées à gauche. */}
        <h2 className="text-3xl md:text-5xl font-semibold text-mp-green-deep mb-4 text-center">
          {title}
        </h2>
        {description && (
          <p className="text-lg text-mp-ink-soft mb-10 leading-relaxed text-center">{description}</p>
        )}

        <div className="w-full">
          {items.map((item, i) => (
            <details
              key={i}
              name={group}
              className="mp-faq-item group border-b border-mp-sand/40 last:border-b-0"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left text-mp-green-deep transition-all hover:text-mp-orange-flame [&::-webkit-details-marker]:hidden">
                {/* text-current : la question suit la couleur du survol, comme
                    le texte du bouton Radix qu'elle remplace. */}
                <h3 className="text-base font-medium text-current">{item.question}</h3>
                <ChevronDown
                  className="h-5 w-5 shrink-0 transition-transform duration-200 group-open:rotate-180"
                  aria-hidden
                />
              </summary>
              <div className="pb-5 pr-8 leading-relaxed text-mp-ink-soft">{item.answer}</div>
            </details>
          ))}
        </div>
        </div>
      </div>
    </section>
  );
}
