import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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

export function FAQAccordion({
  tone = "cream",
  title = "Questions fréquentes",
  description,
  items,
}: FAQAccordionProps) {
  return (
    <section className={cn("mp-band", toneClass(tone))}>
      <div className="mp-shell">
        <div className="mp-measure">
        <h2 className="text-3xl md:text-5xl font-semibold text-mp-green-deep mb-4">
          {title}
        </h2>
        {description && (
          <p className="text-lg text-mp-ink-soft mb-10 leading-relaxed">{description}</p>
        )}

        <Accordion type="single" collapsible className="w-full">
          {items.map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger>{item.question}</AccordionTrigger>
              <AccordionContent>{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        </div>
      </div>
    </section>
  );
}
